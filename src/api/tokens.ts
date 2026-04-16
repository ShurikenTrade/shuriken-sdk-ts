// ─────────────────────────────────────────────────────────────────────────────
// Tokens domain types (mirrors shuriken-api /api/v2/tokens/* DTOs)
// ─────────────────────────────────────────────────────────────────────────────

export interface TokenInfo {
  tokenId: string
  chain: string
  address: string
  name: string
  symbol: string
  decimals: number
}

export interface TokenPool {
  address: string | null
  liquidityUsd: string | null
  marketCapUsd: string | null
  priceUsd: string | null
}

export interface TokenPrice {
  tokenId: string
  decimals: number
  priceUsd: number | null
}

export interface TokenChartCandle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TokenVolumeStats {
  buy5m: number | null
  buy1h: number | null
  buy6h: number | null
  buy24h: number | null
  sell5m: number | null
  sell1h: number | null
  sell6h: number | null
  sell24h: number | null
}

export interface TokenTxnStats {
  buys5m: number | null
  buys1h: number | null
  buys6h: number | null
  buys24h: number | null
  sells5m: number | null
  sells1h: number | null
  sells6h: number | null
  sells24h: number | null
}

export interface TokenUniqueTradersStats {
  buyers5m: number | null
  buyers1h: number | null
  buyers6h: number | null
  buyers24h: number | null
  sellers5m: number | null
  sellers1h: number | null
  sellers6h: number | null
  sellers24h: number | null
}

export interface TokenPriceChangeStats {
  '5m': number | null
  '1h': number | null
  '6h': number | null
  '24h': number | null
}

export interface TokenStats {
  tokenId: string
  volume: TokenVolumeStats
  txns: TokenTxnStats
  uniqueTraders: TokenUniqueTradersStats
  priceChange: TokenPriceChangeStats
}

export interface TokenChart {
  tokenId: string
  resolution: string
  candles: TokenChartCandle[]
}

export interface TokenPools {
  tokenId: string
  pools: TokenPool[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Request parameter types
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchTokensParams {
  q: string
  chain?: string
  page?: number
  limit?: number
}

export interface BatchTokensParams {
  tokens: string[]
}

export interface GetTokenChartParams {
  tokenId: string
  resolution?: '1m' | '5m' | '15m' | '30m' | '1h' | '6h' | '1d'
  count?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Batch response
// ─────────────────────────────────────────────────────────────────────────────

export interface BatchTokensResponse {
  tokens: TokenInfo[]
  notFound: string[]
  invalid: string[]
  errors: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Tokens namespace interface
// ─────────────────────────────────────────────────────────────────────────────

export interface TokensApi {
  get(tokenId: string): Promise<TokenInfo>
  search(params: SearchTokensParams): Promise<TokenInfo[]>
  batch(params: BatchTokensParams): Promise<BatchTokensResponse>
  getPrice(tokenId: string): Promise<TokenPrice>
  getChart(params: GetTokenChartParams): Promise<TokenChart>
  getStats(tokenId: string): Promise<TokenStats>
  getPools(tokenId: string): Promise<TokenPools>
}
