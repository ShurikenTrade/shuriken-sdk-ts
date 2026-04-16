// ─────────────────────────────────────────────────────────────────────────────
// Perps domain types (mirrors shuriken-api /api/v2/perp/* DTOs)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Account & Balances ─────────────────────────────────────────────────

/** A spot balance entry within a perpetuals account. */
export interface SpotBalance {
  /** Coin symbol (e.g. `USDC`). */
  coin: string
  /** Total balance. */
  total: string
  /** Amount on hold (in open orders / margin). */
  hold: string
}

/** Perpetuals account state (balances and margin). */
export interface PerpAccountState {
  /** Total account value in USD. */
  accountValue: string
  /** Withdrawable amount. */
  withdrawable: string
  /** Spot balances. */
  spotBalances: SpotBalance[]
}

// ─── Fees ───────────────────────────────────────────────────────────────

/** User fee schedule. */
export interface UserFees {
  /** Daily trading volume. */
  dailyVolume: string
  /** Maker fee rate (e.g. `0.0002`). */
  makerRate: string
  /** Taker fee rate (e.g. `0.0005`). */
  takerRate: string
  /** Referral discount rate. */
  referralDiscount: string
}

// ─── Fills ──────────────────────────────────────────────────────────────

/** A single trade fill. */
export interface PerpFill {
  /** Coin symbol. */
  coin: string
  /** Trade side: `buy` or `sell`. */
  side: string
  /** Execution price. */
  px: string
  /** Execution size. */
  sz: string
  /** Fee charged. */
  fee: string
  /** Closed PnL from this fill. */
  closedPnl: string
  /** Unix timestamp (milliseconds). */
  time: number
  /** Order ID. */
  oid: number
  /** Position size before this fill. */
  startPosition: string
  /** Direction (e.g. `Open Long`, `Close Short`). */
  direction: string
  /** Client order ID, if provided. */
  cloid?: string
}

// ─── Funding ────────────────────────────────────────────────────────────

/** A single funding payment. */
export interface FundingPayment {
  /** Coin symbol. */
  coin: string
  /** Funding amount in USDC (negative = paid, positive = received). */
  usdc: string
  /** Funding rate. */
  fundingRate: string
  /** Position size at the time of funding. */
  szi: string
  /** Unix timestamp (milliseconds). */
  time: number
}

// ─── Markets ────────────────────────────────────────────────────────────

/** Static metadata for a perpetuals market. */
export interface MarketMeta {
  /** Coin symbol (e.g. `BTC`, `ETH`). */
  name: string
  /** Internal asset index. */
  assetIndex: number
  /** Size decimal places. */
  szDecimals: number
  /** Maximum leverage. */
  maxLeverage: number
  /** Whether only isolated margin is available. */
  onlyIsolated: boolean
}

/** Live market context (prices, volume, funding). */
export interface MarketCtx {
  /** Mid price. */
  midPx: string
  /** Mark price. */
  markPx: string
  /** Oracle price. */
  oraclePx: string
  /** Previous day's price. */
  prevDayPx: string
  /** Daily notional volume. */
  dayNtlVlm: string
  /** Current funding rate. */
  funding: string
  /** Open interest. */
  openInterest: string
  /** Premium over oracle price. */
  premium: string
}

/** A single price level in the order book. */
export interface BookLevel {
  /** Price at this level. */
  price: string
  /** Aggregate size at this level. */
  size: string
  /** Number of orders at this level. */
  numOrders: number
}

/** A perpetuals market with metadata, live context, and order book. */
export interface PerpMarket {
  /** Static market metadata. */
  meta: MarketMeta
  /** Live market context. */
  ctx: MarketCtx
  /** Ask (sell) side of the order book. */
  asks: BookLevel[]
  /** Bid (buy) side of the order book. */
  bids: BookLevel[]
}

// ─── Orders ─────────────────────────────────────────────────────────────

/** Result for a single order within an {@link OrderResponse}. */
export interface OrderResult {
  /** `success` or `error`. */
  status: string
  /** Order ID (present on success). */
  oid?: number
  /** Client order ID echo. */
  cloid?: string
  /** Error message (present on failure). */
  error?: string
}

/** Response from order placement, modification, or cancellation. */
export interface OrderResponse {
  /** Results for each order in the request. */
  results: OrderResult[]
}

/** An open perpetuals order. */
export interface OpenOrder {
  /** Coin symbol. */
  coin: string
  /** Side: `buy` or `sell`. */
  side: string
  /** Limit price. */
  limitPx: string
  /** Order size. */
  sz: string
  /** Order ID. */
  oid: number
  /** Unix timestamp (milliseconds). */
  timestamp: number
  /** Order type (e.g. `limit`). */
  orderType: string
  /** Client order ID, if provided. */
  cloid?: string
}

/** Take-profit or stop-loss parameters. */
export interface TpSlParams {
  /** Trigger price. */
  triggerPx: string
  /** Execute as market order when triggered (default: `true`). */
  isMarket?: boolean
  /** Limit price (only used if `isMarket` is `false`). */
  limitPx?: string
}

// ─── Positions ──────────────────────────────────────────────────────────

/** An open perpetuals position. */
export interface PerpPosition {
  /** Coin symbol. */
  coin: string
  /** Signed position size (positive = long, negative = short). */
  szi: string
  /** Average entry price. */
  entryPx: string
  /** Unrealized PnL. */
  unrealizedPnl: string
  /** Return on equity. */
  returnOnEquity: string
  /** Estimated liquidation price. */
  liquidationPx: string
  /** Margin mode: `cross` or `isolated`. */
  leverageType: string
  /** Leverage multiplier. */
  leverageValue: string
  /** Margin used by this position. */
  marginUsed: string
  /** Current notional value. */
  positionValue: string
}

/** Response from {@link PerpsApi.getPositions}. */
export interface PerpPositionsResponse {
  /** Open positions. */
  positions: PerpPosition[]
  /** Total account value. */
  accountValue: string
  /** Total margin used across all positions. */
  totalMarginUsed: string
  /** Total notional position size. */
  totalNtlPos: string
  /** Withdrawable amount. */
  withdrawable: string
  /** Spot balances (present for unified margin accounts). */
  spotBalances?: SpotBalance[]
}

// ─── Leverage & Margin ──────────────────────────────────────────────────

/** Response from {@link PerpsApi.updateLeverage}. */
export interface LeverageResponse {
  /** Whether the update succeeded. */
  success: boolean
  /** Error message if it failed. */
  error?: string
}

/** Response from {@link PerpsApi.updateMargin}. */
export interface MarginResponse {
  /** Whether the update succeeded. */
  success: boolean
  /** Error message if it failed. */
  error?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Request parameter types
// ─────────────────────────────────────────────────────────────────────────────

/** Parameters for {@link PerpsApi.getAccount}. */
export interface GetPerpAccountParams {
  /** Wallet ID (uses default Hyperliquid wallet if omitted). */
  walletId?: string
}

/** Parameters for {@link PerpsApi.getFees}. */
export interface GetPerpFeesParams {
  /** Wallet ID (uses default Hyperliquid wallet if omitted). */
  walletId?: string
}

/** Parameters for {@link PerpsApi.getFills}. */
export interface GetPerpFillsParams {
  /** Start time (unix milliseconds). */
  startTime: number
  /** End time (unix milliseconds). */
  endTime?: number
  /** Filter by coin symbol. */
  coin?: string
  /** Wallet ID (uses default Hyperliquid wallet if omitted). */
  walletId?: string
}

/** Parameters for {@link PerpsApi.getFunding}. */
export interface GetPerpFundingParams {
  /** Start time (unix milliseconds). */
  startTime: number
  /** End time (unix milliseconds). */
  endTime?: number
  /** Filter by coin symbol. */
  coin?: string
  /** Wallet ID (uses default Hyperliquid wallet if omitted). */
  walletId?: string
}

/** Parameters for {@link PerpsApi.getOrders}. */
export interface GetPerpOrdersParams {
  /** Filter by coin symbol. */
  coin?: string
  /** Wallet ID (uses default Hyperliquid wallet if omitted). */
  walletId?: string
}

/** Parameters for {@link PerpsApi.getPositions}. */
export interface GetPerpPositionsParams {
  /** Wallet ID (uses default Hyperliquid wallet if omitted). */
  walletId?: string
}

/** Parameters for {@link PerpsApi.placeOrder}. */
export interface PlaceOrderParams {
  /** Shuriken wallet ID. */
  walletId: string
  /** Coin symbol (e.g. `BTC`, `ETH`). */
  coin: string
  /** `true` to buy/long, `false` to sell/short. */
  isBuy: boolean
  /** Limit price (required for limit orders). */
  limitPx?: string
  /** Size in coins. */
  sz?: string
  /** Size in USD (alternative to `sz`). */
  sizeUsd?: string
  /** Order type (e.g. `limit`, `market`). */
  orderType?: string
  /** Client order ID for tracking. */
  cloid?: string
  /** Order grouping. */
  grouping?: string
  /** If `true`, only reduces an existing position. */
  reduceOnly?: boolean
  /** Take-profit parameters. */
  tp?: TpSlParams
  /** Stop-loss parameters. */
  sl?: TpSlParams
}

/** Parameters for {@link PerpsApi.modifyOrder}. */
export interface ModifyOrderParams {
  /** Shuriken wallet ID. */
  walletId: string
  /** Coin symbol. */
  coin: string
  /** Side of the order being modified. */
  isBuy: boolean
  /** New size. */
  sz: string
  /** New limit price. */
  limitPx: string
  /** Order ID to modify. */
  oid?: number
  /** Client order ID to modify. */
  cloid?: string
  /** New client order ID. */
  newCloid?: string
  /** Order type (e.g. `limit`). */
  orderType: string
}

/** Parameters for {@link PerpsApi.cancelOrder}. */
export interface CancelOrderParams {
  /** Shuriken wallet ID. */
  walletId: string
  /** Coin symbol. */
  coin: string
  /** Order ID to cancel. */
  oid?: number
  /** Client order ID to cancel. */
  cloid?: string
  /** Cancel all orders for this coin. */
  cancelAll?: boolean
}

/** A single order modification within a {@link BatchModifyParams} request. */
export interface BatchModifyEntry {
  /** Coin symbol. */
  coin: string
  /** Side of the order. */
  isBuy: boolean
  /** New size. */
  sz: string
  /** New limit price. */
  limitPx: string
  /** Order ID to modify. */
  oid?: number
  /** Client order ID to modify. */
  cloid?: string
  /** New client order ID. */
  newCloid?: string
  /** Order type (e.g. `limit`). */
  orderType: string
}

/** Parameters for {@link PerpsApi.batchModifyOrders}. */
export interface BatchModifyParams {
  /** Shuriken wallet ID. */
  walletId: string
  /** List of order modifications. */
  modifications: BatchModifyEntry[]
}

/** Parameters for {@link PerpsApi.closePosition}. */
export interface ClosePositionParams {
  /** Shuriken wallet ID. */
  walletId: string
  /** Coin symbol. */
  coin: string
  /** Percentage to close (0–100, default: 100). */
  percentage?: number
}

/** Parameters for {@link PerpsApi.updateLeverage}. */
export interface UpdateLeverageParams {
  /** Shuriken wallet ID. */
  walletId: string
  /** Coin symbol. */
  coin: string
  /** Desired leverage multiplier. */
  leverage: number
  /** `true` for cross margin, `false` for isolated. */
  isCross?: boolean
}

/** Parameters for {@link PerpsApi.updateMargin}. */
export interface UpdateMarginParams {
  /** Shuriken wallet ID. */
  walletId: string
  /** Coin symbol. */
  coin: string
  /** Margin amount to add (positive) or remove (negative). */
  amount: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Perps namespace interface
// ─────────────────────────────────────────────────────────────────────────────

/** Perpetuals trading endpoints (`client.perps.*`). */
export interface PerpsApi {
  /** Get account state (balances, margin). */
  getAccount(params?: GetPerpAccountParams): Promise<PerpAccountState>
  /** Get the user's fee schedule. */
  getFees(params?: GetPerpFeesParams): Promise<UserFees>
  /** Get trade fill history. */
  getFills(params: GetPerpFillsParams): Promise<PerpFill[]>
  /** Get funding payment history. */
  getFunding(params: GetPerpFundingParams): Promise<FundingPayment[]>
  /** List all perpetual markets. */
  getMarkets(): Promise<PerpMarket[]>
  /** Get a single market with order book. */
  getMarket(coin: string): Promise<PerpMarket>
  /** Get open orders. */
  getOrders(params?: GetPerpOrdersParams): Promise<OpenOrder[]>
  /** Get open positions with account summary. */
  getPositions(params?: GetPerpPositionsParams): Promise<PerpPositionsResponse>
  /** Place a perpetual order. */
  placeOrder(params: PlaceOrderParams): Promise<OrderResponse>
  /** Modify an existing order. */
  modifyOrder(params: ModifyOrderParams): Promise<OrderResponse>
  /** Cancel an order. */
  cancelOrder(params: CancelOrderParams): Promise<OrderResponse>
  /** Batch modify multiple orders. */
  batchModifyOrders(params: BatchModifyParams): Promise<OrderResponse>
  /** Close an open position (fully or partially). */
  closePosition(params: ClosePositionParams): Promise<OrderResponse>
  /** Update leverage for a coin. */
  updateLeverage(params: UpdateLeverageParams): Promise<LeverageResponse>
  /** Adjust isolated margin for a position. */
  updateMargin(params: UpdateMarginParams): Promise<MarginResponse>
}
