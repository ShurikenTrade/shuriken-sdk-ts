// ─────────────────────────────────────────────────────────────────────────────
// Alpha stream payload types
//
// Payload shapes delivered on the Shuriken alpha / signal-feed WebSocket
// streams.
// ─────────────────────────────────────────────────────────────────────────────

import type { FeedTokenMeta, FeedTokenSignal, Network } from './common.js'

// ── Shared primitives ────────────────────────────────────────────────────────

export type AlphaPlatform = 'discord' | 'telegram' | 'x' | 'unknown'

export interface AlphaMessageAuthor {
  userId?: string
  username?: string
  displayName?: string
  avatarUrl?: string
  isBot?: boolean
}

export interface AlphaMessageToken {
  address: string
  chain: string
}

/** Chat message ingested from Discord / Telegram / X. */
export interface AlphaChatMessage {
  messageId: string
  channelId: string
  guildId?: string
  platform: AlphaPlatform
  content: string
  timestamp: number
  author?: AlphaMessageAuthor
  tokens: AlphaMessageToken[]
  isEdited: boolean
  isDeleted: boolean
  isPinned: boolean
  replyToMessageId?: string
  topicTitle?: string
}

// ── alpha.personal ───────────────────────────────────────────────────────────

/** @deprecated Use signal feed events instead. */
export interface AlphaCallReferenceMention {
  messageId: string
  platform: string
  timestampMs: number
}

/** @deprecated Use signal feed events instead. */
export interface AlphaCallReferenceEvent {
  type: 'callReference'
  address: string
  firstSeenAtMs: number
  lastSeenAtMs: number
  mentionCount: number
  mentions: AlphaCallReferenceMention[]
}

/**
 * Union of payload shapes delivered on the `alpha.personal` stream.
 * Discriminate by the `type` field — raw chat messages do not carry
 * a `type` field.
 */
export type AlphaPersonalEvent = AlphaChatMessage | AlphaCallReferenceEvent

// ── alpha.signalFeed* ────────────────────────────────────────────────────────

export interface AlphaGlobalSignalFeedEvent {
  type: 'globalSignalFeedUpdate'
  tokenAddress: string
  network: Network
  tokenMeta?: FeedTokenMeta
  latestSignal?: FeedTokenSignal
}

export interface AlphaPersonalSignalFeedEvent {
  type: 'personalSignalFeedUpdate'
  tokenAddress: string
  network: Network
  tokenMeta?: FeedTokenMeta
  latestSignal?: FeedTokenSignal
  feedId?: string
}

export interface AlphaNamedSignalFeedEvent {
  type: 'namedSignalFeedUpdate'
  tokenAddress: string
  network: Network
  tokenMeta?: FeedTokenMeta
  latestSignal?: FeedTokenSignal
  feedId?: string
}

export interface AlphaProfileSignalFeedEvent {
  type: 'profileSignalFeedUpdate'
  tokenAddress: string
  network: Network
  tokenMeta?: FeedTokenMeta
  latestSignal?: FeedTokenSignal
  profileId: string
}

/**
 * Real-time chat message routed to a named signal feed
 * (`alpha.signalFeedNamed`).
 */
export interface AlphaFeedMessageEvent {
  type: 'feedMessage'
  feedId: string
  message?: AlphaChatMessage
}

// ── Alpha filter shapes ──────────────────────────────────────────────────────

export interface AlphaProfileSignalFeedFilter {
  profileId: string
}

export interface AlphaNamedSignalFeedFilter {
  feedId: string
}
