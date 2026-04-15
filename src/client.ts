import Pusher from 'pusher-js'

import { ShurikenAuthError, ShurikenSessionError } from './errors.js'
import type { StreamFilterMap, StreamId, StreamPayloadMap } from './streams/index.js'
import type {
  ConnectionState,
  ConnectionStateHandler,
  MessageHandler,
  ResolvedSubscription,
  SessionResponse,
  ShurikenClientOptions,
  ShurikenSubscription,
  SubscriptionFilter,
} from './types.js'

/**
 * High-level client for the Shuriken v2 API.
 *
 * Authenticates with an agent key (`sk_...`), provides typed methods for
 * the REST surface, and manages WebSocket stream subscriptions via the
 * control-plane bootstrap flow.
 *
 * Usage:
 * ```ts
 * const client = createShurikenClient({ apiBaseUrl, apiKey: 'sk_...' })
 * await client.ws.connect()
 *
 * // Subscribe with typed handlers — session expands automatically
 * client.ws.subscribe('token.swaps', { tokenAddress: 'So111...' }, (event) => {
 *   console.log(event.priceUsd)
 * })
 * ```
 */
export interface ShurikenClient {
  ws: {
    connect(): Promise<void>
    disconnect(): void
    subscribe<S extends StreamId>(
      stream: S,
      filter: StreamFilterMap[S],
      handler: MessageHandler<StreamPayloadMap[S]>
    ): ShurikenSubscription
    subscribe<T = unknown>(
      filter: SubscriptionFilter,
      handler: MessageHandler<T>
    ): ShurikenSubscription
    onConnectionStateChange(handler: ConnectionStateHandler): () => void
    getSession(): SessionResponse | null
  }
}

interface ActiveSubscription {
  channel: string
  event: string
  handler: MessageHandler
  filter: SubscriptionFilter
  resolved: ResolvedSubscription | null
}

export function createShurikenClient(options: ShurikenClientOptions): ShurikenClient {
  const authHeader = `Bearer ${options.apiKey}`

  // ─── Shared fetch helper ───────────────────────────────────────────────

  async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
    const url = `${options.apiBaseUrl}${path}`
    return fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: authHeader,
      },
    })
  }

  // ─── WebSocket internals ───────────────────────────────────────────────

  let pusher: Pusher | null = null
  let session: SessionResponse | null = null
  let connectionState: ConnectionState = 'disconnected'
  const stateHandlers = new Set<ConnectionStateHandler>()
  const activeSubscriptions = new Map<symbol, ActiveSubscription>()

  // Serializes session expansion requests so concurrent subscribe() calls
  // don't race and overwrite each other's results.
  let sessionMutex: Promise<void> = Promise.resolve()

  function emitState(state: ConnectionState, reason?: string) {
    connectionState = state
    for (const handler of stateHandlers) {
      handler({ state, reason })
    }
  }

  function mapPusherState(pusherState: string): ConnectionState {
    switch (pusherState) {
      case 'connected':
        return 'connected'
      case 'connecting':
      case 'initialized':
        return 'connecting'
      case 'unavailable':
      case 'failed':
        return 'failed'
      case 'disconnected':
        return 'disconnected'
      default:
        return 'disconnected'
    }
  }

  async function fetchSession(subscriptions: SubscriptionFilter[]): Promise<SessionResponse> {
    const body = {
      subscriptions: subscriptions.map((s) => ({
        stream: s.stream,
        filter: s.filter ?? {},
      })),
    }

    const res = await apiFetch('/api/v2/ws/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.status === 401) {
      throw new ShurikenAuthError('Session bootstrap failed: unauthorized')
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new ShurikenSessionError(`Session bootstrap failed (${res.status}): ${text}`)
    }

    const json = await res.json()
    return json.data ?? json
  }

  /** Collect all unique filters from active subscriptions + any new ones. */
  function allSubscriptionFilters(extra?: SubscriptionFilter[]): SubscriptionFilter[] {
    const seen = new Set<string>()
    const filters: SubscriptionFilter[] = []

    function add(f: SubscriptionFilter) {
      const key = `${f.stream}:${JSON.stringify(f.filter ?? {})}`
      if (!seen.has(key)) {
        seen.add(key)
        filters.push(f)
      }
    }

    for (const sub of activeSubscriptions.values()) {
      add(sub.filter)
    }
    if (extra) {
      for (const f of extra) {
        add(f)
      }
    }

    return filters
  }

  /**
   * Expand the session to include new filters while preserving existing
   * Pusher channel bindings. Serialized via sessionMutex to prevent races.
   */
  function expandSession(newFilters: SubscriptionFilter[]): Promise<void> {
    const work = async () => {
      const allFilters = allSubscriptionFilters(newFilters)
      const newSession = await fetchSession(allFilters)

      // Merge: keep connection from new session, merge subscriptions
      session = newSession

      // Bind any pending subscriptions that now have resolved channels
      for (const [, sub] of activeSubscriptions) {
        if (sub.resolved) continue // already bound
        const resolved = findResolved(sub.filter)
        if (resolved) {
          sub.channel = resolved.channel
          sub.event = resolved.event
          sub.resolved = resolved
          subscribeToPusherChannel(sub)
        }
      }
    }

    sessionMutex = sessionMutex.then(work, work)
    return sessionMutex
  }

  function initPusher(conn: SessionResponse['connection']): Pusher {
    return new Pusher(conn.appKey, {
      wsHost: conn.wsHost,
      wsPort: conn.wsPort,
      forceTLS: conn.forceTls,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      cluster: 'mt1',
      authEndpoint: conn.authEndpoint,
      auth: {
        headers: {
          Authorization: authHeader,
        },
      },
    })
  }

  function bindPusherEvents(p: Pusher) {
    p.connection.bind('state_change', (states: { previous: string; current: string }) => {
      emitState(mapPusherState(states.current))
    })

    p.connection.bind('error', (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err)
      emitState('failed', message)
    })
  }

  function subscribeToPusherChannel(sub: ActiveSubscription) {
    if (!pusher) return

    const channel = pusher.subscribe(sub.channel)
    channel.bind(sub.event, (data: unknown) => {
      sub.handler(data)
    })
  }

  function findResolved(filter: SubscriptionFilter): ResolvedSubscription | undefined {
    if (!session) return undefined
    return session.subscriptions.find((s) => s.stream === filter.stream)
  }

  // ─── WebSocket public API ──────────────────────────────────────────────

  async function wsConnect(): Promise<void> {
    if (pusher) {
      throw new ShurikenSessionError('Client is already connected')
    }

    emitState('connecting')

    // Bootstrap with a lightweight probe to get connection metadata.
    // Actual subscriptions are added via subscribe() which expands the session.
    session = await fetchSession([{ stream: 'alpha.signalFeedGlobal' }])

    pusher = initPusher(session.connection)
    bindPusherEvents(pusher)

    await new Promise<void>((resolve, reject) => {
      // biome-ignore lint/style/noNonNullAssertion: pusher is set above
      const p = pusher!
      const timeout = setTimeout(() => {
        reject(new ShurikenSessionError('Connection timed out'))
      }, 30_000)

      p.connection.bind('connected', () => {
        clearTimeout(timeout)
        resolve()
      })

      p.connection.bind('failed', () => {
        clearTimeout(timeout)
        reject(new ShurikenSessionError('Connection failed'))
      })

      if (p.connection.state === 'connected') {
        clearTimeout(timeout)
        resolve()
      }
    })

    emitState('connected')
  }

  function wsDisconnect(): void {
    for (const [id, sub] of activeSubscriptions) {
      if (pusher && sub.channel) {
        pusher.unsubscribe(sub.channel)
      }
      activeSubscriptions.delete(id)
    }

    if (pusher) {
      pusher.disconnect()
      pusher = null
    }

    session = null
    emitState('disconnected')
  }

  function wsSubscribe(
    streamOrFilter: string | SubscriptionFilter,
    filterOrHandler: Record<string, string> | MessageHandler,
    maybeHandler?: MessageHandler
  ): ShurikenSubscription {
    const filter: SubscriptionFilter =
      typeof streamOrFilter === 'string'
        ? { stream: streamOrFilter, filter: filterOrHandler as Record<string, string> }
        : streamOrFilter
    const handler: MessageHandler =
      typeof streamOrFilter === 'string'
        ? (maybeHandler as MessageHandler)
        : (filterOrHandler as MessageHandler)

    if (!pusher || !session) {
      throw new ShurikenSessionError('Client is not connected. Call ws.connect() first.')
    }

    const id = Symbol()
    const resolved = findResolved(filter)

    if (resolved) {
      // Stream already in session — bind immediately
      const sub: ActiveSubscription = {
        channel: resolved.channel,
        event: resolved.event,
        handler: handler as MessageHandler,
        filter,
        resolved,
      }
      activeSubscriptions.set(id, sub)
      subscribeToPusherChannel(sub)
    } else {
      // Stream not in session — register as pending and expand session
      const pending: ActiveSubscription = {
        channel: '',
        event: '',
        handler: handler as MessageHandler,
        filter,
        resolved: null,
      }
      activeSubscriptions.set(id, pending)

      expandSession([filter]).catch(() => {
        activeSubscriptions.delete(id)
      })
    }

    return {
      unsubscribe() {
        activeSubscriptions.delete(id)
        const sub = activeSubscriptions.get(id)
        if (pusher && sub?.channel) {
          pusher.unsubscribe(sub.channel)
        }
      },
    }
  }

  function onConnectionStateChange(handler: ConnectionStateHandler): () => void {
    stateHandlers.add(handler)
    return () => {
      stateHandlers.delete(handler)
    }
  }

  function getSession(): SessionResponse | null {
    return session
  }

  // ─── Client ────────────────────────────────────────────────────────────

  return {
    ws: {
      connect: wsConnect,
      disconnect: wsDisconnect,
      subscribe: wsSubscribe,
      onConnectionStateChange,
      getSession,
    },
  }
}
