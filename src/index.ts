export { createShurikenClient } from './client.js'
export type { ShurikenClient } from './client.js'

export type {
  ConnectionInfo,
  ConnectionState,
  ConnectionStateEvent,
  ConnectionStateHandler,
  FilterField,
  MessageHandler,
  PayloadFormat,
  ResolvedSubscription,
  SessionInfo,
  SessionResponse,
  ShurikenClientOptions,
  ShurikenSubscription,
  StreamCatalogResponse,
  StreamEntry,
  StreamVisibility,
  SubscriptionFilter,
} from './types.js'

export {
  ShurikenApiError,
  ShurikenAuthError,
  ShurikenDecodeError,
  ShurikenError,
  ShurikenSessionError,
} from './errors.js'

// Tokens API types
export type {
  BatchTokensParams,
  BatchTokensResponse,
  GetTokenChartParams,
  SearchTokensParams,
  TokenChart,
  TokenChartCandle,
  TokenInfo,
  TokenPool,
  TokenPools,
  TokenPrice,
  TokenPriceChangeStats,
  TokenStats,
  TokenTxnStats,
  TokenUniqueTradersStats,
  TokenVolumeStats,
  TokensApi,
} from './api/tokens.js'

// Stream types — SVM
export type {
  SvmBondingCurveCreationEvent,
  SvmBondingCurveGraduationEvent,
  SvmHolderStatsEvent,
  SvmNativeBalanceEvent,
  SvmSwapEvent,
  SvmSwapFees,
  SvmTokenBalanceEvent,
  SvmTokenDistributionStatsEvent,
  SvmTokenFilter,
  SvmTokenPoolEvent,
  SvmWalletFilter,
} from './streams/index.js'

// Stream types — EVM
export type {
  EvmSwapEvent,
  EvmTokenFilter,
  EvmTokenPoolEvent,
} from './streams/index.js'

// Stream maps
export type {
  StreamFilterMap,
  StreamId,
  StreamPayloadMap,
} from './streams/index.js'
