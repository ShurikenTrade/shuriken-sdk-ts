// ─────────────────────────────────────────────────────────────────────────────
// Portfolio domain types (mirrors shuriken-api /api/v2/portfolio/* DTOs)
// ─────────────────────────────────────────────────────────────────────────────

export interface WalletBalance {
  chain: string
  walletAddress: string
  nativeBalance: string
  nativeBalanceUsd: number
  nativeSymbol: string
}

export interface PortfolioTrade {
  chain: string
  txHash: string
  timestamp: number
  walletAddress: string
  inputToken: string
  inputAmount: string | null
  outputToken: string
  outputAmount: string | null
  token: string
  sizeUsd: string
  priceUsd: string
  isBuy: boolean
}

export interface PortfolioHistoryPoint {
  timestamp: number
  valueUsd: number
}

export interface PortfolioPnl {
  totalValueUsd: number
  totalBoughtUsd: number
  totalSoldUsd: number
  totalPnlUsd: number
  totalRealizedPnlUsd: number
  totalUnrealizedPnlUsd: number
  positionCount: number
  portfolioHistory: PortfolioHistoryPoint[]
}

export interface PositionInfo {
  walletAddress: string
  tokenAddress: string
  latestBalanceRaw: string
  latestTokenUsdPrice: number
  tokenDecimal: number
  boughtUsd: number
  soldUsd: number
  boughtNative: number
  soldNative: number
  buyCount: number
  sellCount: number
  balanceUsd: number
  balanceNative: number
  realisedPnlPct: number
  totalPnlPct: number
  network: string
}

export interface PositionsResponse {
  positions: PositionInfo[]
  totalValueUsd: number
  positionCount: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Request parameter types
// ─────────────────────────────────────────────────────────────────────────────

export interface GetBalancesParams {
  chain?: string
}

export interface GetHistoryParams {
  chain?: string
  page?: number
  limit?: number
}

export interface GetPnlParams {
  timeframe?: '1d' | '7d' | '30d' | 'lifetime'
}

export interface GetPositionsParams {
  chain?: string
  status?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio namespace interface
// ─────────────────────────────────────────────────────────────────────────────

export interface PortfolioApi {
  getBalances(params?: GetBalancesParams): Promise<WalletBalance[]>
  getHistory(params?: GetHistoryParams): Promise<PortfolioTrade[]>
  getPnl(params?: GetPnlParams): Promise<PortfolioPnl>
  getPositions(params?: GetPositionsParams): Promise<PositionsResponse>
}
