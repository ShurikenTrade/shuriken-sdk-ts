// ─────────────────────────────────────────────────────────────────────────────
// SVM (Solana) stream payload types
//
// Payload shapes for Solana-based events delivered over the Shuriken
// WebSocket streams.
// ─────────────────────────────────────────────────────────────────────────────

// ── svm.token.swaps ──────────────────────────────────────────────────────────

export interface SvmSwapFees {
  gasLamports?: number
  computeUnitsConsumed?: number
  platform?: string
  platformFeeLamports?: number
  mevFeeLamports?: number
}

export interface SvmSwapEvent {
  tokenMint: string
  signature: string
  slot: number
  blockTime: number
  blockHeight?: number
  blockHash?: string
  transactionIndex?: number
  isBuy: boolean
  sizeSol: string
  sizeUsd: string
  priceUsd: string
  priceSol: string
  maker?: string
  inputMint?: string
  outputMint?: string
  inputDecimals?: number
  outputDecimals?: number
  amountIn?: number
  amountOut?: number
  tradeSource?: string
  poolAddress?: string
  location?: string
  fees?: SvmSwapFees
  network: 'sol'
}

// ── svm.token.poolInfo ───────────────────────────────────────────────────────

export interface SvmTokenPoolEvent {
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  tokenDecimals: number
  priceUsd?: string
  blockIndex: number
  timestampUpdatedMs: number
  network: 'sol'
}

// ── svm.wallet.nativeBalance ─────────────────────────────────────────────────

export interface SvmNativeBalanceEvent {
  owner: string
  slot: number
  blockTime: number
  preBalance: number
  postBalance: number
  network: 'sol'
}

// ── svm.wallet.tokenBalances ─────────────────────────────────────────────────

export interface SvmWalletTokenBalanceEvent {
  mint: string
  owner: string
  slot: number
  blockTime: number
  decimals: number
  preBalance: number
  postBalance: number
  network: 'sol'
}

// ── svm.token.balances ──────────────────────────────────────────────────────

export interface SvmTokenBalanceEvent {
  mint: string
  owner: string
  slot: number
  blockTime: number
  decimals: number
  preBalance: number
  postBalance: number
  network: 'sol'
}

// ── svm.bondingCurve.creations ───────────────────────────────────────────────

export interface SvmBondingCurveCreationEvent {
  tokenAddress: string
  curveAddress: string
  curveDexType: string
  creator: string
  signature: string
  slot: number
  blockTime: number
  blockHeight: number
  blockHash: string
  transactionIndex?: number
  network: 'sol'
}

// ── svm.bondingCurve.graduations ─────────────────────────────────────────────

export interface SvmBondingCurveGraduationEvent {
  tokenAddress: string
  curveAddress: string
  curveDexType: string
  destPoolAddress: string
  destPoolDexType: string
  signature: string
  slot: number
  blockTime: number
  blockHeight: number
  blockHash: string
  transactionIndex?: number
  network: 'sol'
}

// ── svm.token.distributionStats ──────────────────────────────────────────────

export interface SvmTokenDistributionStatsEvent {
  tokenAddress: string
  network: 'sol'
  blockIndex: number
  stats?: Record<string, unknown>
}

// ── svm.token.holderStats ────────────────────────────────────────────────────

export interface SvmHolderStatsEvent {
  tokenAddress: string
  network: 'sol'
  blockIndex: number
  stats?: Record<string, unknown>
}

// ── SVM filter shapes ────────────────────────────────────────────────────────

export interface SvmTokenFilter {
  tokenAddress: string
}

export interface SvmWalletFilter {
  walletAddress: string
}
