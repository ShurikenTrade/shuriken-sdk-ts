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
}
