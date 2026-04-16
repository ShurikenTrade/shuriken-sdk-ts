// ─────────────────────────────────────────────────────────────────────────────
// Tokens domain types (mirrors shuriken-api /api/v2/tokens/* DTOs)
// ─────────────────────────────────────────────────────────────────────────────

/** Token metadata. */
export interface TokenInfo {
  /** Token ID in `chain:address` format (e.g. `solana:So111...`). */
  tokenId: string
  /** Chain the token lives on (e.g. `solana`, `base`, `bsc`). */
  chain: string
  /** On-chain token address. */
  address: string
  /** Human-readable token name. */
  name: string
  /** Token ticker symbol. */
  symbol: string
  /** Number of decimal places. */
  decimals: number
}

/** Liquidity pool associated with a token. */
export interface TokenPool {
  /** Pool contract address. */
  address: string | null
  /** Total liquidity in USD. */
  liquidityUsd: string | null
  /** Market cap in USD. */
  marketCapUsd: string | null
  /** Current price in USD. */
  priceUsd: string | null
}

/** Lightweight token price. */
export interface TokenPrice {
  /** Token ID in `chain:address` format. */
  tokenId: string
  /** Number of decimal places. */
  decimals: number
  /** Current USD price, or `null` if unavailable. */
  priceUsd: number | null
}

/** Single OHLCV candle. */
export interface TokenChartCandle {
  /** Unix timestamp (seconds). */
  timestamp: number
  /** Opening price. */
  open: number
  /** Highest price. */
  high: number
  /** Lowest price. */
  low: number
  /** Closing price. */
  close: number
  /** Volume traded. */
  volume: number
}

/** Buy/sell volume over multiple timeframes. */
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

/** Buy/sell transaction counts over multiple timeframes. */
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

/** Unique buyer/seller counts over multiple timeframes. */
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

/** Price change percentages over multiple timeframes. */
export interface TokenPriceChangeStats {
  '5m': number | null
  '1h': number | null
  '6h': number | null
  '24h': number | null
}

/** Aggregated trading statistics for a token. */
export interface TokenStats {
  /** Token ID in `chain:address` format. */
  tokenId: string
  /** Buy/sell volume by timeframe. */
  volume: TokenVolumeStats
  /** Transaction counts by timeframe. */
  txns: TokenTxnStats
  /** Unique trader counts by timeframe. */
  uniqueTraders: TokenUniqueTradersStats
  /** Price change percentages by timeframe. */
  priceChange: TokenPriceChangeStats
}

/** OHLCV chart data for a token. */
export interface TokenChart {
  /** Token ID in `chain:address` format. */
  tokenId: string
  /** Candle resolution (e.g. `1h`, `1d`). */
  resolution: string
  /** Array of OHLCV candles. */
  candles: TokenChartCandle[]
}

/** Liquidity pools for a token. */
export interface TokenPools {
  /** Token ID in `chain:address` format. */
  tokenId: string
  /** Associated liquidity pools. */
  pools: TokenPool[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Request parameter types
// ─────────────────────────────────────────────────────────────────────────────

/** Parameters for {@link TokensApi.search}. */
export interface SearchTokensParams {
  /** Search query string. */
  q: string
  /** Filter by chain: `solana`, `base`, `bsc`. */
  chain?: string
  /** Page number (default: 1). */
  page?: number
  /** Results per page (default: 20, max: 100). */
  limit?: number
}

/** Parameters for {@link TokensApi.batch}. */
export interface BatchTokensParams {
  /** Token IDs in `chain:address` format (max 100). */
  tokens: string[]
}

/** Parameters for {@link TokensApi.getChart}. */
export interface GetTokenChartParams {
  /** Token ID in `chain:address` format. */
  tokenId: string
  /** Candle resolution (default: `1h`). */
  resolution?: '1m' | '5m' | '15m' | '30m' | '1h' | '6h' | '1d'
  /** Number of candles to return (default: 100, max: 500). */
  count?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Batch response
// ─────────────────────────────────────────────────────────────────────────────

/** Response from a batch token lookup. */
export interface BatchTokensResponse {
  /** Successfully resolved tokens. */
  tokens: TokenInfo[]
  /** Token IDs that were not found. */
  notFound: string[]
  /** Token IDs that were malformed. */
  invalid: string[]
  /** Error messages, if any. */
  errors: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Tokens namespace interface
// ─────────────────────────────────────────────────────────────────────────────

/** Token data endpoints (`client.tokens.*`). */
export interface TokensApi {
  /** Get metadata for a single token. */
  get(tokenId: string): Promise<TokenInfo>
  /** Search tokens by name or symbol. */
  search(params: SearchTokensParams): Promise<TokenInfo[]>
  /** Get multiple tokens in one call (up to 100). */
  batch(params: BatchTokensParams): Promise<BatchTokensResponse>
  /** Get the current USD price for a token. */
  getPrice(tokenId: string): Promise<TokenPrice>
  /** Get OHLCV chart data for a token. */
  getChart(params: GetTokenChartParams): Promise<TokenChart>
  /** Get trading statistics (volume, txns, unique traders, price change). */
  getStats(tokenId: string): Promise<TokenStats>
  /** Get liquidity pools for a token. */
  getPools(tokenId: string): Promise<TokenPools>
}
