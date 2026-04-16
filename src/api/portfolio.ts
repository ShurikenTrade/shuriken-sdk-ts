// ─────────────────────────────────────────────────────────────────────────────
// Portfolio domain types (mirrors shuriken-api /api/v2/portfolio/* DTOs)
// ─────────────────────────────────────────────────────────────────────────────

/** Native token balance for a single wallet. */
export interface WalletBalance {
  /** Chain (e.g. `solana`, `base`, `bsc`). */
  chain: string
  /** Wallet address. */
  walletAddress: string
  /** Native balance in base units (e.g. lamports). */
  nativeBalance: string
  /** Native balance converted to USD. */
  nativeBalanceUsd: number
  /** Native token symbol (e.g. `SOL`, `ETH`, `BNB`). */
  nativeSymbol: string
}

/** A single trade in the portfolio history. */
export interface PortfolioTrade {
  /** Chain the trade occurred on. */
  chain: string
  /** On-chain transaction hash. */
  txHash: string
  /** Unix timestamp (seconds). */
  timestamp: number
  /** Wallet that executed the trade. */
  walletAddress: string
  /** Token address sold. */
  inputToken: string
  /** Amount sold (base units), or `null` if unavailable. */
  inputAmount: string | null
  /** Token address bought. */
  outputToken: string
  /** Amount bought (base units), or `null` if unavailable. */
  outputAmount: string | null
  /** Primary token involved. */
  token: string
  /** Trade size in USD. */
  sizeUsd: string
  /** Execution price in USD. */
  priceUsd: string
  /** `true` if this was a buy, `false` if a sell. */
  isBuy: boolean
}

/** A single data point in the portfolio value history chart. */
export interface PortfolioHistoryPoint {
  /** Unix timestamp (seconds). */
  timestamp: number
  /** Portfolio value in USD at this point. */
  valueUsd: number
}

/** Aggregate PnL summary for the portfolio. */
export interface PortfolioPnl {
  /** Current total portfolio value in USD. */
  totalValueUsd: number
  /** Total amount bought in USD. */
  totalBoughtUsd: number
  /** Total amount sold in USD. */
  totalSoldUsd: number
  /** Total PnL (realized + unrealized) in USD. */
  totalPnlUsd: number
  /** Realized PnL in USD. */
  totalRealizedPnlUsd: number
  /** Unrealized PnL in USD. */
  totalUnrealizedPnlUsd: number
  /** Number of open positions. */
  positionCount: number
  /** Historical portfolio value over time. */
  portfolioHistory: PortfolioHistoryPoint[]
}

/** A single spot token position. */
export interface PositionInfo {
  /** Wallet holding the position. */
  walletAddress: string
  /** Token contract address. */
  tokenAddress: string
  /** Current raw token balance. */
  latestBalanceRaw: string
  /** Current token price in USD. */
  latestTokenUsdPrice: number
  /** Token decimal places. */
  tokenDecimal: number
  /** Total USD spent buying. */
  boughtUsd: number
  /** Total USD received from selling. */
  soldUsd: number
  /** Total native amount bought. */
  boughtNative: number
  /** Total native amount sold. */
  soldNative: number
  /** Number of buy transactions. */
  buyCount: number
  /** Number of sell transactions. */
  sellCount: number
  /** Current position value in USD. */
  balanceUsd: number
  /** Current position size in native units. */
  balanceNative: number
  /** Realised PnL as a percentage. */
  realisedPnlPct: number
  /** Total PnL (realised + unrealised) as a percentage. */
  totalPnlPct: number
  /** Network identifier (e.g. `solana`, `base`). */
  network: string
}

/** Response from {@link PortfolioApi.getPositions}. */
export interface PositionsResponse {
  /** List of token positions. */
  positions: PositionInfo[]
  /** Total portfolio value in USD. */
  totalValueUsd: number
  /** Number of open positions. */
  positionCount: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Request parameter types
// ─────────────────────────────────────────────────────────────────────────────

/** Parameters for {@link PortfolioApi.getBalances}. */
export interface GetBalancesParams {
  /** Filter by chain: `solana`, `base`, `bsc`. */
  chain?: string
}

/** Parameters for {@link PortfolioApi.getHistory}. */
export interface GetHistoryParams {
  /** Filter by chain: `solana`, `base`, `bsc`. */
  chain?: string
  /** Page number. */
  page?: number
  /** Results per page (max 100). */
  limit?: number
}

/** Parameters for {@link PortfolioApi.getPnl}. */
export interface GetPnlParams {
  /** PnL timeframe (default: `30d`). */
  timeframe?: '1d' | '7d' | '30d' | 'lifetime'
}

/** Parameters for {@link PortfolioApi.getPositions}. */
export interface GetPositionsParams {
  /** Filter by chain. */
  chain?: string
  /** Filter by position status. */
  status?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio namespace interface
// ─────────────────────────────────────────────────────────────────────────────

/** Portfolio endpoints (`client.portfolio.*`). */
export interface PortfolioApi {
  /** Get cross-chain native token balances for all wallets. */
  getBalances(params?: GetBalancesParams): Promise<WalletBalance[]>
  /** Get trade history. */
  getHistory(params?: GetHistoryParams): Promise<PortfolioTrade[]>
  /** Get aggregate PnL summary with historical chart data. */
  getPnl(params?: GetPnlParams): Promise<PortfolioPnl>
  /** Get open token positions with PnL. */
  getPositions(params?: GetPositionsParams): Promise<PositionsResponse>
}
