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
} from './svm.js'

export type {
  EvmSwapEvent,
  EvmTokenFilter,
  EvmTokenPoolEvent,
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
  SvmTokenBalanceEvent,
  SvmTokenDistributionStatsEvent,
  SvmTokenFilter,
  SvmTokenPoolEvent,
  SvmWalletFilter,
} from './svm.js'

import type { EvmSwapEvent, EvmTokenFilter, EvmTokenPoolEvent } from './evm.js'

export interface StreamPayloadMap {
  'svm.token.swaps': SvmSwapEvent
  'svm.token.poolInfo': SvmTokenPoolEvent
  'svm.token.distributionStats': SvmTokenDistributionStatsEvent
  'svm.token.holderStats': SvmHolderStatsEvent
  'svm.wallet.nativeBalance': SvmNativeBalanceEvent
  'svm.wallet.tokenBalance': SvmTokenBalanceEvent
  'svm.bondingCurve.creations': SvmBondingCurveCreationEvent
  'svm.bondingCurve.graduations': SvmBondingCurveGraduationEvent
  'evm.token.swaps': EvmSwapEvent
  'evm.token.poolInfo': EvmTokenPoolEvent
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
  'svm.wallet.tokenBalance': SvmTokenFilter
  'svm.bondingCurve.creations': Record<string, never>
  'svm.bondingCurve.graduations': Record<string, never>
  'evm.token.swaps': EvmTokenFilter
  'evm.token.poolInfo': EvmTokenFilter
}
