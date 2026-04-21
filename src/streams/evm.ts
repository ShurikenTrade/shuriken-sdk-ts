// ─────────────────────────────────────────────────────────────────────────────
// EVM stream payload types
//
// Payload shapes for EVM-based events (Ethereum, Base, BSC, etc.) delivered
// over the Shuriken WebSocket streams.
// ─────────────────────────────────────────────────────────────────────────────

import type { Network } from './common.js'

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
  network: Network
}

// ── evm.token.poolInfo ───────────────────────────────────────────────────────

export interface EvmTokenPoolEvent {
  tokenAddress: string
  chainId: number
  tokenName: string
  tokenSymbol: string
  tokenDecimals: number
  totalSupply?: string
  priceUsd?: string
  priceNative?: string
  liquidityUsd?: string
  marketCapUsd?: string
  blockNumber: number
  timestampUpdatedMs: number
  network: Network
}

// ── evm.wallet.nativeBalance ─────────────────────────────────────────────────

export interface EvmNativeBalanceEvent {
  owner: string
  chainId: number
  blockNumber: number
  blockTime: number
  balance: string
  network: Network
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
  network: Network
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
  network: Network
}

// ── EVM filter shapes ────────────────────────────────────────────────────────

export interface EvmTokenFilter {
  chainId: string
  tokenAddress: string
}

export interface EvmWalletFilter {
  walletAddress: string
}
