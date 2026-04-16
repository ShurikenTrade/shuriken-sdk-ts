// ─────────────────────────────────────────────────────────────────────────────
// Perps domain types (mirrors shuriken-api /api/v2/perp/* DTOs)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Account & Balances ─────────────────────────────────────────────────

export interface SpotBalance {
  coin: string
  total: string
  hold: string
}

export interface PerpAccountState {
  accountValue: string
  withdrawable: string
  spotBalances: SpotBalance[]
}

// ─── Fees ───────────────────────────────────────────────────────────────

export interface UserFees {
  dailyVolume: string
  makerRate: string
  takerRate: string
  referralDiscount: string
}

// ─── Fills ──────────────────────────────────────────────────────────────

export interface PerpFill {
  coin: string
  side: string
  px: string
  sz: string
  fee: string
  closedPnl: string
  time: number
  oid: number
  startPosition: string
  direction: string
  cloid?: string
}

// ─── Funding ────────────────────────────────────────────────────────────

export interface FundingPayment {
  coin: string
  usdc: string
  fundingRate: string
  szi: string
  time: number
}

// ─── Markets ────────────────────────────────────────────────────────────

export interface MarketMeta {
  name: string
  assetIndex: number
  szDecimals: number
  maxLeverage: number
  onlyIsolated: boolean
}

export interface MarketCtx {
  midPx: string
  markPx: string
  oraclePx: string
  prevDayPx: string
  dayNtlVlm: string
  funding: string
  openInterest: string
  premium: string
}

export interface BookLevel {
  price: string
  size: string
  numOrders: number
}

export interface PerpMarket {
  meta: MarketMeta
  ctx: MarketCtx
  asks: BookLevel[]
  bids: BookLevel[]
}

// ─── Orders ─────────────────────────────────────────────────────────────

export interface OrderResult {
  status: string
  oid?: number
  cloid?: string
  error?: string
}

export interface OrderResponse {
  results: OrderResult[]
}

export interface OpenOrder {
  coin: string
  side: string
  limitPx: string
  sz: string
  oid: number
  timestamp: number
  orderType: string
  cloid?: string
}

export interface TpSlParams {
  triggerPx: string
  isMarket?: boolean
  limitPx?: string
}

// ─── Positions ──────────────────────────────────────────────────────────

export interface PerpPosition {
  coin: string
  szi: string
  entryPx: string
  unrealizedPnl: string
  returnOnEquity: string
  liquidationPx: string
  leverageType: string
  leverageValue: string
  marginUsed: string
  positionValue: string
}

export interface PerpPositionsResponse {
  positions: PerpPosition[]
  accountValue: string
  totalMarginUsed: string
  totalNtlPos: string
  withdrawable: string
  spotBalances?: SpotBalance[]
}

// ─── Leverage & Margin ──────────────────────────────────────────────────

export interface LeverageResponse {
  success: boolean
  error?: string
}

export interface MarginResponse {
  success: boolean
  error?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Request parameter types
// ─────────────────────────────────────────────────────────────────────────────

export interface GetPerpAccountParams {
  walletId?: string
}

export interface GetPerpFeesParams {
  walletId?: string
}

export interface GetPerpFillsParams {
  startTime: number
  endTime?: number
  coin?: string
  walletId?: string
}

export interface GetPerpFundingParams {
  startTime: number
  endTime?: number
  coin?: string
  walletId?: string
}

export interface GetPerpOrdersParams {
  coin?: string
  walletId?: string
}

export interface GetPerpPositionsParams {
  walletId?: string
}

export interface PlaceOrderParams {
  walletId: string
  coin: string
  isBuy: boolean
  limitPx?: string
  sz?: string
  sizeUsd?: string
  orderType?: string
  cloid?: string
  grouping?: string
  reduceOnly?: boolean
  tp?: TpSlParams
  sl?: TpSlParams
}

export interface ModifyOrderParams {
  walletId: string
  coin: string
  isBuy: boolean
  sz: string
  limitPx: string
  oid?: number
  cloid?: string
  newCloid?: string
  orderType: string
}

export interface CancelOrderParams {
  walletId: string
  coin: string
  oid?: number
  cloid?: string
  cancelAll?: boolean
}

export interface BatchModifyEntry {
  coin: string
  isBuy: boolean
  sz: string
  limitPx: string
  oid?: number
  cloid?: string
  newCloid?: string
  orderType: string
}

export interface BatchModifyParams {
  walletId: string
  modifications: BatchModifyEntry[]
}

export interface ClosePositionParams {
  walletId: string
  coin: string
  percentage?: number
}

export interface UpdateLeverageParams {
  walletId: string
  coin: string
  leverage: number
  isCross?: boolean
}

export interface UpdateMarginParams {
  walletId: string
  coin: string
  amount: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Perps namespace interface
// ─────────────────────────────────────────────────────────────────────────────

export interface PerpsApi {
  getAccount(params?: GetPerpAccountParams): Promise<PerpAccountState>
  getFees(params?: GetPerpFeesParams): Promise<UserFees>
  getFills(params: GetPerpFillsParams): Promise<PerpFill[]>
  getFunding(params: GetPerpFundingParams): Promise<FundingPayment[]>
  getMarkets(): Promise<PerpMarket[]>
  getMarket(coin: string): Promise<PerpMarket>
  getOrders(params?: GetPerpOrdersParams): Promise<OpenOrder[]>
  getPositions(params?: GetPerpPositionsParams): Promise<PerpPositionsResponse>
  placeOrder(params: PlaceOrderParams): Promise<OrderResponse>
  modifyOrder(params: ModifyOrderParams): Promise<OrderResponse>
  cancelOrder(params: CancelOrderParams): Promise<OrderResponse>
  batchModifyOrders(params: BatchModifyParams): Promise<OrderResponse>
  closePosition(params: ClosePositionParams): Promise<OrderResponse>
  updateLeverage(params: UpdateLeverageParams): Promise<LeverageResponse>
  updateMargin(params: UpdateMarginParams): Promise<MarginResponse>
}
