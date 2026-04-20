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

// Account API types
export type {
  AccountApi,
  AccountInfo,
  AccountSettings,
  AccountUsage,
  AccountWallet,
  AgentKeyConstraints,
  ChainPresets,
  DefaultWallets,
  EnableMultisendResponse,
  EvmSwapPreset,
  OneClickModeSettings,
  SolanaSwapPreset,
  SwapPreset,
  TradeSettings,
  WalletGroup,
} from './api/account.js'

// Perps API types
export type {
  BatchModifyEntry,
  BatchModifyParams,
  BookLevel,
  CancelOrderParams,
  ClosePositionParams,
  FundingPayment,
  GetPerpAccountParams,
  GetPerpFeesParams,
  GetPerpFillsParams,
  GetPerpFundingParams,
  GetPerpOrdersParams,
  GetPerpPositionsParams,
  LeverageResponse,
  MarginResponse,
  MarketCtx,
  MarketMeta,
  ModifyOrderParams,
  OpenOrder,
  OrderResponse,
  OrderResult,
  PerpAccountState,
  PerpFill,
  PerpMarket,
  PerpPosition,
  PerpPositionsResponse,
  PerpsApi,
  PlaceOrderParams,
  SpotBalance,
  TpSlParams,
  UpdateLeverageParams,
  UpdateMarginParams,
  UserFees,
} from './api/perps.js'

// Portfolio API types
export type {
  GetBalancesParams,
  GetHistoryParams,
  GetPnlParams,
  GetPositionsParams,
  PortfolioApi,
  PortfolioHistoryPoint,
  PortfolioPnl,
  PortfolioTrade,
  PositionInfo,
  PositionsResponse,
  WalletBalance,
} from './api/portfolio.js'

// Swap API types
export type {
  ApproveAllowanceResponse,
  ApproveSpenderResponse,
  BuildTransactionParams,
  BuildTransactionResponse,
  EvmTransactionData,
  ExecuteSwapParams,
  GetApproveAllowanceParams,
  GetSwapQuoteParams,
  QuoteSummary,
  SubmitTransactionParams,
  SubmitTransactionResponse,
  SwapApi,
  SwapFees,
  SwapQuote,
  SwapRoute,
  SwapStatus,
} from './api/swap.js'

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

// Trigger API types
export type {
  CancelledTriggerOrder,
  CreateTriggerOrderParams,
  ListTriggerOrdersParams,
  TriggerApi,
  TriggerCondition,
  TriggerOrder,
  TriggerOrderView,
  TriggerOrdersResponse,
} from './api/trigger.js'

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
  SvmWalletTokenBalanceEvent,
  SvmTokenFilter,
  SvmTokenPoolEvent,
  SvmWalletFilter,
} from './streams/index.js'

// Stream types — EVM
export type {
  EvmNativeBalanceEvent,
  EvmSwapEvent,
  EvmTokenBalanceEvent,
  EvmTokenFilter,
  EvmTokenPoolEvent,
  EvmWalletFilter,
  EvmWalletTokenBalanceEvent,
} from './streams/index.js'

// Stream maps
export type {
  StreamFilterMap,
  StreamId,
  StreamPayloadMap,
} from './streams/index.js'
