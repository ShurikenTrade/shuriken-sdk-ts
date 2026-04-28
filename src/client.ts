import TransportDefault from 'pusher-js'

// The real-time transport library ships a CJS bundle; depending on the runtime
// the default import may be the constructor directly or wrapped in an object.
const _mod = TransportDefault as unknown as Record<string, unknown>
const Transport =
  typeof TransportDefault === 'function'
    ? TransportDefault
    : ((_mod.default ?? _mod.Pusher) as typeof TransportDefault)
type Transport = InstanceType<typeof Transport>

import { ShurikenApiError, ShurikenAuthError, ShurikenSessionError } from './errors.js'
import type { StreamFilterMap, StreamId, StreamPayloadMap } from './streams/index.js'
import type {
  AccountApi,
  AccountInfo,
  AccountSettings,
  AccountUsage,
  AccountWallet,
  EnableMultisendResponse,
} from './api/account.js'
import type {
  FundingPayment,
  LeverageResponse,
  MarginResponse,
  OpenOrder,
  OrderResponse,
  PerpAccountState,
  PerpFill,
  PerpMarket,
  PerpPositionsResponse as PerpPositionsResp,
  PerpsApi,
  UserFees,
} from './api/perps.js'
import type {
  CancelledTriggerOrder,
  TriggerApi,
  TriggerOrder,
  TriggerOrderView,
  TriggerOrdersResponse,
} from './api/trigger.js'
import type {
  PortfolioApi,
  PortfolioPnl,
  PortfolioTrade,
  PositionsResponse,
  WalletBalance,
} from './api/portfolio.js'
import type {
  DeleteWalletGroupResponse,
  WalletGroupRecord,
  WalletGroupsApi,
} from './api/wallet-groups.js'
import type {
  ApproveAllowanceResponse,
  ApproveSpenderResponse,
  BuildTransactionResponse,
  SubmitTransactionResponse,
  SwapApi,
  SwapQuote,
  SwapStatus,
} from './api/swap.js'
import type { TasksApi, TaskStatus } from './api/tasks.js'
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
  SubscriptionErrorHandler,
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
  perps: PerpsApi
  portfolio: PortfolioApi
  swap: SwapApi
  tasks: TasksApi
  tokens: TokensApi
  trigger: TriggerApi
  walletGroups: WalletGroupsApi
  ws: {
    connect(): Promise<void>
    disconnect(): void
    subscribe<S extends StreamId>(
      stream: S,
      filter: StreamFilterMap[S],
      handler: MessageHandler<StreamPayloadMap[S]>,
      onError?: SubscriptionErrorHandler
    ): ShurikenSubscription
    subscribe<T = unknown>(
      filter: SubscriptionFilter,
      handler: MessageHandler<T>,
      onError?: SubscriptionErrorHandler
    ): ShurikenSubscription
    onConnectionStateChange(handler: ConnectionStateHandler): () => void
    getSession(): SessionResponse | null
  }
}

interface ActiveSubscription {
  channel: string
  event: string
  handler: MessageHandler
  onError?: SubscriptionErrorHandler
  filter: SubscriptionFilter
  resolved: ResolvedSubscription | null
}

const DEFAULT_API_BASE_URL = 'https://api.shuriken.trade'

export function createShurikenClient(options: ShurikenClientOptions): ShurikenClient {
  const apiBaseUrl = options.apiBaseUrl ?? DEFAULT_API_BASE_URL
  const authHeader = `Bearer ${options.apiKey}`

  // ─── Shared fetch helper ───────────────────────────────────────────────

  async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
    const url = `${apiBaseUrl}${path}`
    return fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: authHeader,
      },
    })
  }

  // ─── JSON request helpers ───────────────────────────────────────────────

  async function handleResponse<T>(res: Response): Promise<T> {
    if (res.status === 401) throw new ShurikenAuthError('Unauthorized')
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      let apiCode = 'UNKNOWN'
      let message = text
      let requestId: string | undefined
      try {
        const json = JSON.parse(text)
        if (json?.error?.code) apiCode = json.error.code
        if (json?.error?.message) message = json.error.message
        if (json?.requestId) requestId = json.requestId
      } catch {
        // not JSON, use raw text
      }
      throw new ShurikenApiError(message, res.status, apiCode, requestId)
    }
    const json = await res.json()
    return (json.data ?? json) as T
  }

  async function apiGet<T>(path: string): Promise<T> {
    return handleResponse(await apiFetch(path))
  }

  async function apiPost<T>(path: string, body: unknown): Promise<T> {
    return handleResponse(
      await apiFetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    )
  }

  async function apiPut<T>(path: string, body: unknown): Promise<T> {
    return handleResponse(
      await apiFetch(path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    )
  }

  async function apiDelete<T>(path: string, body?: unknown): Promise<T> {
    const init: RequestInit = { method: 'DELETE' }
    if (body !== undefined) {
      init.headers = { 'Content-Type': 'application/json' }
      init.body = JSON.stringify(body)
    }
    return handleResponse(await apiFetch(path, init))
  }

  async function apiPatch<T>(path: string, body: unknown): Promise<T> {
    return handleResponse(
      await apiFetch(path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    )
  }

  // ─── Account ──────────────────────────────────────────────────────────

  const account: AccountApi = {
    getMe: () => apiGet<AccountInfo>('/api/v2/account/me'),
    getSettings: () => apiGet<AccountSettings>('/api/v2/account/settings'),
    updateSettings: (settings) => apiPut<AccountSettings>('/api/v2/account/settings', settings),
    getUsage: () => apiGet<AccountUsage>('/api/v2/account/usage'),
    getWallets: () => apiGet<AccountWallet[]>('/api/v2/account/wallets'),
    enableMultisend: (walletId) =>
      apiPost<EnableMultisendResponse>(
        `/api/v2/account/wallets/${encodeURIComponent(walletId)}/enable-multisend`,
        {}
      ),
  }

  // ─── Tokens ───────────────────────────────────────────────────────────

  function buildQuery(params: Record<string, string | number | undefined>): string {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined)
    if (entries.length === 0) return ''
    return `?${entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')}`
  }

  // ─── Wallet Groups ─────────────────────────────────────────────────────

  const walletGroups: WalletGroupsApi = {
    list: (params) => {
      const qs = buildQuery({ chain: params?.chain })
      return apiGet<{ groups: WalletGroupRecord[] }>(`/api/v2/wallet-groups${qs}`).then(
        (data) => data.groups
      )
    },

    get: (groupId) =>
      apiGet<WalletGroupRecord>(`/api/v2/wallet-groups/${encodeURIComponent(groupId)}`),

    create: (params) => apiPost<WalletGroupRecord>('/api/v2/wallet-groups', params),

    createWithWallets: (params) =>
      apiPost<WalletGroupRecord>('/api/v2/wallet-groups/with-wallets', params),

    update: (groupId, params) =>
      apiPatch<WalletGroupRecord>(`/api/v2/wallet-groups/${encodeURIComponent(groupId)}`, params),

    delete: (groupId) =>
      apiDelete<DeleteWalletGroupResponse>(`/api/v2/wallet-groups/${encodeURIComponent(groupId)}`),

    addWallets: (groupId, params) =>
      apiPost<WalletGroupRecord>(
        `/api/v2/wallet-groups/${encodeURIComponent(groupId)}/wallets`,
        params
      ),

    removeWallets: (groupId, params) =>
      apiDelete<WalletGroupRecord>(
        `/api/v2/wallet-groups/${encodeURIComponent(groupId)}/wallets`,
        params
      ),

    reorderWallets: (groupId, params) =>
      apiPut<WalletGroupRecord>(
        `/api/v2/wallet-groups/${encodeURIComponent(groupId)}/wallets/order`,
        params
      ),

    moveWallet: (walletId, params) =>
      apiPost<WalletGroupRecord>(`/api/v2/wallets/${encodeURIComponent(walletId)}/move`, params),
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

  // ─── Tasks ──────────────────────────────────────────────────────────

  const tasks: TasksApi = {
    getStatus: (taskId) => apiGet<TaskStatus>(`/api/v2/tasks/${encodeURIComponent(taskId)}`),
  }

  // ─── Trigger ─────────────────────────────────────────────────────────

  const trigger: TriggerApi = {
    create: (params) => apiPost<TriggerOrder>('/api/v2/trigger/order', params),

    get: (orderId) =>
      apiGet<TriggerOrderView>(`/api/v2/trigger/order/${encodeURIComponent(orderId)}`),

    list: (params) => {
      const qs = buildQuery({ limit: params?.limit, cursor: params?.cursor })
      return apiGet<TriggerOrdersResponse>(`/api/v2/trigger/orders${qs}`)
    },

    cancel: (orderId) =>
      apiDelete<CancelledTriggerOrder>(`/api/v2/trigger/order/${encodeURIComponent(orderId)}`),
  }

  // ─── Perps ──────────────────────────────────────────────────────────────

  const perps: PerpsApi = {
    getAccount: (params) => {
      const qs = buildQuery({ wallet_id: params?.walletId })
      return apiGet<PerpAccountState>(`/api/v2/perp/account${qs}`)
    },

    getFees: (params) => {
      const qs = buildQuery({ wallet_id: params?.walletId })
      return apiGet<UserFees>(`/api/v2/perp/fees${qs}`)
    },

    getFills: (params) => {
      const qs = buildQuery({
        wallet_id: params.walletId,
        start_time: params.startTime,
        end_time: params.endTime,
        coin: params.coin,
      })
      return apiGet<PerpFill[]>(`/api/v2/perp/fills${qs}`)
    },

    getFunding: (params) => {
      const qs = buildQuery({
        wallet_id: params.walletId,
        start_time: params.startTime,
        end_time: params.endTime,
        coin: params.coin,
      })
      return apiGet<FundingPayment[]>(`/api/v2/perp/funding${qs}`)
    },

    getMarkets: () => apiGet<PerpMarket[]>('/api/v2/perp/markets'),

    getMarket: (coin) => apiGet<PerpMarket>(`/api/v2/perp/markets/${encodeURIComponent(coin)}`),

    getOrders: (params) => {
      const qs = buildQuery({ wallet_id: params?.walletId, coin: params?.coin })
      return apiGet<OpenOrder[]>(`/api/v2/perp/orders${qs}`)
    },

    getPositions: (params) => {
      const qs = buildQuery({ wallet_id: params?.walletId })
      return apiGet<PerpPositionsResp>(`/api/v2/perp/positions${qs}`)
    },

    placeOrder: (params) => apiPost<OrderResponse>('/api/v2/perp/order', params),

    modifyOrder: (params) => apiPatch<OrderResponse>('/api/v2/perp/order', params),

    cancelOrder: (params) => apiDelete<OrderResponse>('/api/v2/perp/order', params),

    batchModifyOrders: (params) => apiPatch<OrderResponse>('/api/v2/perp/orders', params),

    closePosition: (params) => apiPost<OrderResponse>('/api/v2/perp/position/close', params),

    updateLeverage: (params) => apiPost<LeverageResponse>('/api/v2/perp/leverage', params),

    updateMargin: (params) => apiPost<MarginResponse>('/api/v2/perp/position/margin', params),
  }

  // ─── WebSocket internals ───────────────────────────────────────────────

  let transport: Transport | null = null
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

  function mapTransportState(transportState: string): ConnectionState {
    switch (transportState) {
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
   * channel bindings. Serialized via sessionMutex to prevent races.
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
          subscribeToChannel(sub)
        }
      }
    }

    sessionMutex = sessionMutex.then(work, work)
    return sessionMutex
  }

  function initTransport(conn: SessionResponse['connection']): Transport {
    return new Transport(conn.appKey, {
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

  function bindTransportEvents(p: Transport) {
    p.connection.bind('state_change', (states: { previous: string; current: string }) => {
      emitState(mapTransportState(states.current))
    })

    p.connection.bind('error', (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err)
      emitState('failed', message)
    })
  }

  function subscribeToChannel(sub: ActiveSubscription) {
    if (!transport) return

    const channel = transport.subscribe(sub.channel)
    channel.bind(sub.event, (data: unknown) => {
      sub.handler(data)
    })
    if (sub.onError) {
      const onError = sub.onError
      channel.bind(
        'pusher:subscription_error',
        (err: { type?: string; error?: string; status?: number }) => {
          onError({ status: err.status ?? 0, message: err.error ?? 'subscription failed' })
        }
      )
    }
  }

  function findResolved(filter: SubscriptionFilter): ResolvedSubscription | undefined {
    if (!session) return undefined
    return session.subscriptions.find((s) => s.stream === filter.stream)
  }

  // ─── WebSocket public API ──────────────────────────────────────────────

  async function wsConnect(): Promise<void> {
    if (transport) {
      throw new ShurikenSessionError('Client is already connected')
    }

    emitState('connecting')

    // Bootstrap with a lightweight probe to get connection metadata.
    // Actual subscriptions are added via subscribe() which expands the session.
    session = await fetchSession([{ stream: 'alpha.signalFeedGlobal' }])

    transport = initTransport(session.connection)
    bindTransportEvents(transport)

    await new Promise<void>((resolve, reject) => {
      // biome-ignore lint/style/noNonNullAssertion: transport is set above
      const p = transport!
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
      if (transport && sub.channel) {
        transport.unsubscribe(sub.channel)
      }
      activeSubscriptions.delete(id)
    }

    if (transport) {
      transport.disconnect()
      transport = null
    }

    session = null
    emitState('disconnected')
  }

  function wsSubscribe(
    streamOrFilter: string | SubscriptionFilter,
    filterOrHandler: Record<string, string> | MessageHandler,
    maybeHandler?: MessageHandler | SubscriptionErrorHandler,
    maybeOnError?: SubscriptionErrorHandler
  ): ShurikenSubscription {
    const isTyped = typeof streamOrFilter === 'string'
    const filter: SubscriptionFilter = isTyped
      ? { stream: streamOrFilter, filter: filterOrHandler as Record<string, string> }
      : streamOrFilter
    const handler: MessageHandler = isTyped
      ? (maybeHandler as MessageHandler)
      : (filterOrHandler as MessageHandler)
    const onError: SubscriptionErrorHandler | undefined = isTyped
      ? maybeOnError
      : (maybeHandler as SubscriptionErrorHandler | undefined)

    if (!transport || !session) {
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
        onError,
        filter,
        resolved,
      }
      activeSubscriptions.set(id, sub)
      subscribeToChannel(sub)
    } else {
      // Stream not in session — register as pending and expand session
      const pending: ActiveSubscription = {
        channel: '',
        event: '',
        handler: handler as MessageHandler,
        onError,
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
        if (transport && sub?.channel) {
          transport.unsubscribe(sub.channel)
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
    tasks,
    perps,
    tokens,
    trigger,
    walletGroups,
    ws: {
      connect: wsConnect,
      disconnect: wsDisconnect,
      subscribe: wsSubscribe,
      onConnectionStateChange,
      getSession,
    },
  }
}
