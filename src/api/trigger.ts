// ─────────────────────────────────────────────────────────────────────────────
// Trigger domain types (mirrors shuriken-api /api/v2/trigger/* DTOs)
// ─────────────────────────────────────────────────────────────────────────────

/** Condition that activates a trigger order. */
export interface TriggerCondition {
  /** Metric to watch: `price_usd`, `market_cap_usd`, `liquidity_usd`. */
  metric: string
  /** Direction: `above` or `below`. */
  direction: string
  /** Target value (for `immediate` behavior). */
  value: string | null
  /** Trailing percentage (for `trailing` behavior, 0.01–99.0). */
  trailingPercentage: number | null
}

/** A newly created trigger order. */
export interface TriggerOrder {
  /** Order ID. */
  orderId: string
  /** Current status (e.g. `active`, `triggered`, `cancelled`). */
  status: string
  /** Chain: `solana`, `base`, `bsc`. */
  chain: string
  /** Token address to sell. */
  inputToken: string
  /** Token address to buy. */
  outputToken: string
  /** Amount in base units. */
  amount: string
  /** ISO 8601 creation timestamp. */
  createdAt: string
  /** Trigger condition. */
  trigger: TriggerCondition
}

/** Detailed view of a trigger order (includes `updatedAt`). */
export interface TriggerOrderView {
  /** Order ID. */
  orderId: string
  /** Current status. */
  status: string
  /** Chain, or `null`. */
  chain: string | null
  /** Token address to sell. */
  inputToken: string
  /** Token address to buy. */
  outputToken: string
  /** Amount in base units. */
  amount: string
  /** ISO 8601 creation timestamp. */
  createdAt: string
  /** ISO 8601 last update timestamp. */
  updatedAt: string
  /** Trigger condition, or `null` if not set. */
  trigger: TriggerCondition | null
}

/** Response after cancelling a trigger order. */
export interface CancelledTriggerOrder {
  /** Order ID. */
  orderId: string
  /** Status after cancellation (e.g. `cancelled`). */
  status: string
}

/** Paginated list of trigger orders. */
export interface TriggerOrdersResponse {
  /** Orders in this page. */
  orders: TriggerOrderView[]
  /** Cursor for the next page, or `null` if no more results. */
  nextCursor: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Request parameter types
// ─────────────────────────────────────────────────────────────────────────────

/** Parameters for {@link TriggerApi.create}. */
export interface CreateTriggerOrderParams {
  /** Chain: `solana`, `base`, `bsc`. */
  chain: string
  /** Token address to sell. */
  inputToken: string
  /** Token address to buy. */
  outputToken: string
  /** Amount in base units. */
  amount: string
  /** Shuriken wallet ID. */
  walletId: string
  /** Metric to watch: `price_usd`, `market_cap_usd`, `liquidity_usd`. */
  triggerMetric: string
  /** Direction: `above` or `below`. */
  triggerDirection: string
  /** Target value (required for `immediate` behavior). */
  triggerValue?: string
  /** Trigger behavior (default: `immediate`). */
  triggerBehavior?: 'immediate' | 'trailing'
  /** Trailing percentage (required for `trailing` behavior, 0.01–99.0). */
  trailingPercentage?: number
  /** Slippage tolerance in basis points (default: 1000 = 10%). */
  slippageBps?: number
  /** Order expiry in hours (default: 24). */
  expiryHours?: number
}

/** Parameters for {@link TriggerApi.list}. */
export interface ListTriggerOrdersParams {
  /** Results per page (default: 20, max: 100). */
  limit?: number
  /** Opaque cursor from a previous response's `nextCursor`. */
  cursor?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Trigger namespace interface
// ─────────────────────────────────────────────────────────────────────────────

/** Trigger order endpoints (`client.trigger.*`). */
export interface TriggerApi {
  /** Create a new trigger order. */
  create(params: CreateTriggerOrderParams): Promise<TriggerOrder>
  /** Get a trigger order by ID. */
  get(orderId: string): Promise<TriggerOrderView>
  /** List trigger orders (cursor-paginated). */
  list(params?: ListTriggerOrdersParams): Promise<TriggerOrdersResponse>
  /** Cancel a trigger order. */
  cancel(orderId: string): Promise<CancelledTriggerOrder>
}
