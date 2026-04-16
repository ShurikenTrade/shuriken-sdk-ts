import Pusher from 'pusher-js'

import { ShurikenApiError, ShurikenAuthError, ShurikenSessionError } from './errors.js'
import type { StreamFilterMap, StreamId, StreamPayloadMap } from './streams/index.js'
import type {
  AccountApi,
  AccountInfo,
  AccountSettings,
  AccountUsage,
  AccountWallet,
} from './api/account.js'
import type {
  PortfolioApi,
  PortfolioPnl,
  PortfolioTrade,
  PositionsResponse,
  WalletBalance,
} from './api/portfolio.js'
import type {
  ApproveAllowanceResponse,
  ApproveSpenderResponse,
  BuildTransactionResponse,
  SubmitTransactionResponse,
  SwapApi,
  SwapQuote,
  SwapStatus,
} from './api/swap.js'
import type {
  BatchTokensResponse,
  TokenChart,
  TokenInfo,
  TokenPools,
  TokenPrice,
  TokenStats,
  TokensApi,
} from './api/tokens.js'
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
  account: AccountApi
  portfolio: PortfolioApi
  swap: SwapApi
  tokens: TokensApi
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

  // ─── JSON request helpers ───────────────────────────────────────────────

  async function apiGet<T>(path: string): Promise<T> {
    const res = await apiFetch(path)
    if (res.status === 401) throw new ShurikenAuthError('Unauthorized')
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new ShurikenApiError(`${res.status}: ${text}`, res.status)
    }
    const json = await res.json()
    return (json.data ?? json) as T
  }

  async function apiPost<T>(path: string, body: unknown): Promise<T> {
    const res = await apiFetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.status === 401) throw new ShurikenAuthError('Unauthorized')
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new ShurikenApiError(`${res.status}: ${text}`, res.status)
    }
    const json = await res.json()
    return (json.data ?? json) as T
  }

  async function apiPut<T>(path: string, body: unknown): Promise<T> {
    const res = await apiFetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.status === 401) throw new ShurikenAuthError('Unauthorized')
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new ShurikenApiError(`${res.status}: ${text}`, res.status)
    }
    const json = await res.json()
    return (json.data ?? json) as T
  }

  // ─── Account ──────────────────────────────────────────────────────────

  const account: AccountApi = {
    getMe: () => apiGet<AccountInfo>('/api/v2/account/me'),
    getSettings: () => apiGet<AccountSettings>('/api/v2/account/settings'),
    updateSettings: (settings) => apiPut<AccountSettings>('/api/v2/account/settings', settings),
    getUsage: () => apiGet<AccountUsage>('/api/v2/account/usage'),
    getWallets: () => apiGet<AccountWallet[]>('/api/v2/account/wallets'),
  }

  // ─── Tokens ───────────────────────────────────────────────────────────

  function buildQuery(params: Record<string, string | number | undefined>): string {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined)
    if (entries.length === 0) return ''
    return `?${entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')}`
  }

  const tokens: TokensApi = {
    get: (tokenId) => apiGet<TokenInfo>(`/api/v2/tokens/${encodeURIComponent(tokenId)}`),

    search: (params) => {
      const qs = buildQuery({
        q: params.q,
        chain: params.chain,
        page: params.page,
        limit: params.limit,
      })
      return apiGet<TokenInfo[]>(`/api/v2/tokens/search${qs}`).then((data) => {
        // API wraps in { tokens: [...] }
        return (data as unknown as { tokens: TokenInfo[] }).tokens ?? (data as TokenInfo[])
      })
    },

    batch: (params) =>
      apiPost<BatchTokensResponse>('/api/v2/tokens/batch', { tokens: params.tokens }),

    getPrice: (tokenId) =>
      apiGet<TokenPrice>(`/api/v2/tokens/${encodeURIComponent(tokenId)}/price`),

    getChart: (params) => {
      const qs = buildQuery({ resolution: params.resolution, count: params.count })
      return apiGet<TokenChart>(
        `/api/v2/tokens/${encodeURIComponent(params.tokenId)}/price/chart${qs}`
      )
    },

    getStats: (tokenId) =>
      apiGet<TokenStats>(`/api/v2/tokens/${encodeURIComponent(tokenId)}/stats`),

    getPools: (tokenId) =>
      apiGet<TokenPools>(`/api/v2/tokens/${encodeURIComponent(tokenId)}/pools`),
  }

  // ─── Portfolio ─────────────────────────────────────────────────────────

  const portfolio: PortfolioApi = {
    getBalances: (params) => {
      const qs = buildQuery({ chain: params?.chain })
      return apiGet<{ wallets: WalletBalance[] }>(`/api/v2/portfolio/balances${qs}`).then(
        (data) => data.wallets
      )
    },

    getHistory: (params) => {
      const qs = buildQuery({ chain: params?.chain, page: params?.page, limit: params?.limit })
      return apiGet<{ trades: PortfolioTrade[] }>(`/api/v2/portfolio/history${qs}`).then(
        (data) => data.trades
      )
    },

    getPnl: (params) => {
      const qs = buildQuery({ timeframe: params?.timeframe })
      return apiGet<PortfolioPnl>(`/api/v2/portfolio/pnl${qs}`)
    },

    getPositions: (params) => {
      const qs = buildQuery({ chain: params?.chain, status: params?.status })
      return apiGet<PositionsResponse>(`/api/v2/portfolio/positions${qs}`)
    },
  }

  // ─── Swap ──────────────────────────────────────────────────────────────

  const swap: SwapApi = {
    getQuote: (params) => {
      const qs = buildQuery({
        chain: params.chain,
        inputMint: params.inputMint,
        outputMint: params.outputMint,
        amount: params.amount,
        slippageBps: params.slippageBps,
      })
      return apiGet<SwapQuote>(`/api/v2/swap/quote${qs}`)
    },

    execute: (params) => apiPost<SwapStatus>('/api/v2/swap/execute', params),

    buildTransaction: (params) =>
      apiPost<BuildTransactionResponse>('/api/v2/swap/transaction', params),

    submitTransaction: (params) =>
      apiPost<SubmitTransactionResponse>('/api/v2/swap/submit', params),

    getStatus: (taskId) => apiGet<SwapStatus>(`/api/v2/swap/status/${encodeURIComponent(taskId)}`),

    getApproveSpender: (chainId) => {
      const qs = buildQuery({ chainId })
      return apiGet<ApproveSpenderResponse>(`/api/v2/swap/approve/spender${qs}`)
    },

    getApproveAllowance: (params) => {
      const qs = buildQuery({
        chainId: params.chainId,
        tokenAddress: params.tokenAddress,
        walletAddress: params.walletAddress,
      })
      return apiGet<ApproveAllowanceResponse>(`/api/v2/swap/approve/allowance${qs}`)
    },
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
    account,
    portfolio,
    swap,
    tokens,
    ws: {
      connect: wsConnect,
      disconnect: wsDisconnect,
      subscribe: wsSubscribe,
      onConnectionStateChange,
      getSession,
    },
  }
}
