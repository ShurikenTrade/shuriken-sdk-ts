export type {
  SvmBondingCurveCreationEvent,
  SvmBondingCurveGraduationEvent,
  SvmHolderStatsEvent,
  SvmNativeBalanceEvent,
  SvmSwapEvent,
  SvmSwapFees,
  SvmWalletTokenBalanceEvent,
  SvmTokenDistributionStatsEvent,
  SvmTokenFilter,
  SvmTokenPoolEvent,
  SvmTokenBalanceEvent,
  SvmWalletFilter,
} from './svm.js'

export type {
  EvmNativeBalanceEvent,
  EvmSwapEvent,
  EvmWalletTokenBalanceEvent,
  EvmTokenFilter,
  EvmTokenPoolEvent,
  EvmTokenBalanceEvent,
  EvmWalletFilter,
} from './evm.js'

export type {
  AlphaCallReferenceEvent,
  AlphaCallReferenceMention,
  AlphaChatMessage,
  AlphaFeedMessageEvent,
  AlphaGlobalSignalFeedEvent,
  AlphaMessageAuthor,
  AlphaMessageToken,
  AlphaNamedSignalFeedEvent,
  AlphaNamedSignalFeedFilter,
  AlphaPersonalEvent,
  AlphaPersonalSignalFeedEvent,
  AlphaPlatform,
  AlphaProfileSignalFeedEvent,
  AlphaProfileSignalFeedFilter,
} from './alpha.js'

export type {
  DiscordSignalSource,
  FeedTokenMeta,
  FeedTokenSignal,
  Network,
  SignalSource,
  TelegramSignalSource,
  TradeSignalSource,
  XSignalSource,
} from './common.js'

export type {
  ApprovalNotificationEvent,
  AutomationNotificationEvent,
  AutomationUpdateEvent,
  ClaimNotificationEvent,
  CleanupNotificationEvent,
  CrosschainSwapNotificationEvent,
  PerpsOrderNotificationEvent,
  PortfolioNotificationEvent,
  StrategyNotificationEvent,
  SvmNonceNotificationEvent,
  SwapNotificationEvent,
  TransferNotificationEvent,
} from './portfolio.js'

// ─────────────────────────────────────────────────────────────────────────────
// Stream ID → Payload type mapping
// ─────────────────────────────────────────────────────────────────────────────

import type {
  SvmBondingCurveCreationEvent,
  SvmBondingCurveGraduationEvent,
  SvmHolderStatsEvent,
  SvmNativeBalanceEvent,
  SvmSwapEvent,
  SvmWalletTokenBalanceEvent,
  SvmTokenDistributionStatsEvent,
  SvmTokenFilter,
  SvmTokenPoolEvent,
  SvmTokenBalanceEvent,
  SvmWalletFilter,
} from './svm.js'

import type {
  EvmNativeBalanceEvent,
  EvmSwapEvent,
  EvmWalletTokenBalanceEvent,
  EvmTokenFilter,
  EvmTokenPoolEvent,
  EvmTokenBalanceEvent,
  EvmWalletFilter,
} from './evm.js'

import type {
  AlphaGlobalSignalFeedEvent,
  AlphaNamedSignalFeedEvent,
  AlphaNamedSignalFeedFilter,
  AlphaPersonalEvent,
  AlphaPersonalSignalFeedEvent,
  AlphaProfileSignalFeedEvent,
  AlphaProfileSignalFeedFilter,
} from './alpha.js'

import type { AutomationUpdateEvent, PortfolioNotificationEvent } from './portfolio.js'

export interface StreamPayloadMap {
  'svm.token.swaps': SvmSwapEvent
  'svm.token.poolInfo': SvmTokenPoolEvent
  'svm.token.distributionStats': SvmTokenDistributionStatsEvent
  'svm.token.holderStats': SvmHolderStatsEvent
  'svm.wallet.nativeBalance': SvmNativeBalanceEvent
  'svm.wallet.tokenBalances': SvmWalletTokenBalanceEvent
  'svm.token.balances': SvmTokenBalanceEvent
  'svm.bondingCurve.creations': SvmBondingCurveCreationEvent
  'svm.bondingCurve.graduations': SvmBondingCurveGraduationEvent
  'evm.token.swaps': EvmSwapEvent
  'evm.token.poolInfo': EvmTokenPoolEvent
  'evm.wallet.nativeBalance': EvmNativeBalanceEvent
  'evm.wallet.tokenBalances': EvmWalletTokenBalanceEvent
  'evm.token.balances': EvmTokenBalanceEvent
  'alpha.signalFeedGlobal': AlphaGlobalSignalFeedEvent
  'alpha.signalFeedPersonal': AlphaPersonalSignalFeedEvent
  'alpha.signalFeedProfile': AlphaProfileSignalFeedEvent
  'alpha.signalFeedNamed': AlphaNamedSignalFeedEvent
  'alpha.personal': AlphaPersonalEvent
  'portfolio.notifications': PortfolioNotificationEvent
  'automation.updates': AutomationUpdateEvent
}

export type StreamId = keyof StreamPayloadMap

// ─────────────────────────────────────────────────────────────────────────────
// Stream ID → Filter shape mapping
// ─────────────────────────────────────────────────────────────────────────────

export interface StreamFilterMap {
  'svm.token.swaps': SvmTokenFilter
  'svm.token.poolInfo': SvmTokenFilter
  'svm.token.distributionStats': SvmTokenFilter
  'svm.token.holderStats': SvmTokenFilter
  'svm.wallet.nativeBalance': SvmWalletFilter
  'svm.wallet.tokenBalances': SvmWalletFilter
  'svm.token.balances': SvmTokenFilter
  'svm.bondingCurve.creations': Record<string, never>
  'svm.bondingCurve.graduations': Record<string, never>
  'evm.token.swaps': EvmTokenFilter
  'evm.token.poolInfo': EvmTokenFilter
  'evm.wallet.nativeBalance': EvmWalletFilter
  'evm.wallet.tokenBalances': EvmWalletFilter
  'evm.token.balances': EvmTokenFilter
  'alpha.signalFeedGlobal': Record<string, never>
  'alpha.signalFeedPersonal': Record<string, never>
  'alpha.signalFeedProfile': AlphaProfileSignalFeedFilter
  'alpha.signalFeedNamed': AlphaNamedSignalFeedFilter
  'alpha.personal': Record<string, never>
  'portfolio.notifications': Record<string, never>
  'automation.updates': Record<string, never>
}
