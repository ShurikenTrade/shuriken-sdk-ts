// ─────────────────────────────────────────────────────────────────────────────
// EVM stream payload types
//
// Each interface mirrors the JSON contract emitted by web-event-proxy on the
// API-dedicated Soketi cluster for EVM-based events (Ethereum, Base, BSC, etc.).
// ─────────────────────────────────────────────────────────────────────────────

// ── evm.token.swaps ──────────────────────────────────────────────────────────

export interface EvmSwapEvent {
  tokenAddress: string
  txHash: string
  chainId: number
  blockNumber: number
  blockHash?: string
  txIndex?: number
  timestamp: number
  isBuy: boolean
  amountNative: string
  amountUsd: string
  priceNative: string
  priceUsd: string
  tokenDecimals: number
  tokenInAddress: string
  tokenOutAddress: string
  amountIn: string
  amountOut: string
  poolAddress?: string
  recipient?: string
  maker?: string
  inferredDexType?: string
  platformName?: string
  network: string
}

// ── evm.token.poolInfo ───────────────────────────────────────────────────────

export interface EvmTokenPoolEvent {
  tokenAddress: string
  chainId: number
  network: string
}

// ── evm.wallet.nativeBalance ─────────────────────────────────────────────────

export interface EvmNativeBalanceEvent {
  owner: string
  chainId: number
  blockNumber: number
  blockTime: number
  balance: string
  network: string
}

// ── evm.wallet.tokenBalances ─────────────────────────────────────────────────

export interface EvmWalletTokenBalanceEvent {
  tokenAddress: string
  owner: string
  chainId: number
  blockNumber: number
  blockTime: number
  balance: string
  decimals: number
  network: string
}

// ── evm.token.balances ──────────────────────────────────────────────────────

export interface EvmTokenBalanceEvent {
  tokenAddress: string
  owner: string
  chainId: number
  blockNumber: number
  blockTime: number
  balance: string
  decimals: number
  network: string
}

// ── EVM filter shapes ────────────────────────────────────────────────────────

export interface EvmTokenFilter {
  chainId: string
  tokenAddress: string
}

export interface EvmWalletFilter {
  walletAddress: string
}
