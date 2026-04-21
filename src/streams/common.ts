// ─────────────────────────────────────────────────────────────────────────────
// Shared stream primitives
//
// Types shared across SVM, EVM, and alpha stream payloads.
// ─────────────────────────────────────────────────────────────────────────────

/** Supported network identifier, serialised as a lowercase string over the wire. */
export type Network = 'eth' | 'base' | 'blast' | 'avax' | 'bsc' | 'trx' | 'sol' | 'monad' | 'hype'

// ── Signal feed primitives ──────────────────────────────────────────────────

export interface FeedTokenMeta {
  address: string
  network: Network
  symbol: string
  name: string
  decimals?: number
  logoUrl?: string
  deploymentTimestamp?: number
}

export interface DiscordSignalSource {
  messageId: string
  guildId: string
  channelId: string
  authorId: string
  authorUsername?: string
  authorAvatarUrl?: string
  authorIsBot?: boolean
  authorDisplayName?: string
  webhookId?: string
}

export interface TelegramSignalSource {
  messageId: string
  chatId: string
  topicId?: number
  topicTitle?: string
  senderId: string
  senderUsername?: string
  senderAvatarUrl?: string
  senderIsBot?: boolean
  senderDisplayName?: string
}

export interface XSignalSource {
  tweetId: string
  authorId: string
  authorUsername?: string
  authorAvatarUrl?: string
  authorVerified?: boolean
  authorDisplayName?: string
}

export interface TradeSignalSource {
  walletAddress: string
  txSignature: string
  isBuy: boolean
  amountUsd: string
  amountNative: string
}

export type SignalSource =
  | { sourceType: 'discord'; source: DiscordSignalSource }
  | { sourceType: 'telegram'; source: TelegramSignalSource }
  | { sourceType: 'x'; source: XSignalSource }
  | { sourceType: 'trade'; source: TradeSignalSource }

export interface FeedTokenSignal {
  id: string
  timestampMs: number
  source: SignalSource
  isBot: boolean
  priceUsd: number
  priceNative: number
  marketcapUsd: number
  liquidityUsd: number
  liquidityNative?: number
  poolAddress?: string
  dexName?: string
}
