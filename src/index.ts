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
  ShurikenAuthError,
  ShurikenDecodeError,
  ShurikenError,
  ShurikenSessionError,
} from './errors.js'

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
