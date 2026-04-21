// ─────────────────────────────────────────────────────────────────────────────
// Alpha stream payload types
//
// Payload shapes delivered on the Shuriken alpha / signal-feed WebSocket
// streams.
// ─────────────────────────────────────────────────────────────────────────────

import type { Network } from './common.js'

// ── Shared primitives ────────────────────────────────────────────────────────

export type AlphaPlatform = 'discord' | 'telegram' | 'x' | 'unknown'

export interface AlphaMessageAuthor {
  userId: string
  username: string
  displayName?: string
  avatarUrl?: string
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

export interface AlphaCallReferenceMention {
  messageId: string
  platform: string
  timestampMs: number
}

export interface AlphaCallReferenceEvent {
  type: 'callReference'
  address: string
  firstSeenAtMs: number
  lastSeenAtMs: number
  mentionCount: number
  mentions: AlphaCallReferenceMention[]
}

export interface AlphaFeedMessageEvent {
  type: 'feedMessage'
  feedId: string
  message?: AlphaChatMessage
}

/**
 * Union of payload shapes delivered on the personal alpha channel
 * (`presence-alpha-{userId}`). Discriminate by the optional `type` field —
 * raw chat messages do not set `type`.
 */
export type AlphaPersonalEvent = AlphaChatMessage | AlphaCallReferenceEvent | AlphaFeedMessageEvent

// ── alpha.signalFeed* ────────────────────────────────────────────────────────

export interface AlphaGlobalSignalFeedEvent {
  type: 'globalSignalFeedUpdate'
  tokenAddress: string
  network: Network
}

export interface AlphaPersonalSignalFeedEvent {
  type: 'personalSignalFeedUpdate'
  tokenAddress: string
  network: Network
}

export interface AlphaNamedSignalFeedEvent {
  type: 'namedSignalFeedUpdate'
  tokenAddress: string
  network: Network
}

export interface AlphaProfileSignalFeedEvent {
  type: 'profileSignalFeedUpdate'
  tokenAddress: string
  network: Network
  profileId: string
}

// ── Alpha filter shapes ──────────────────────────────────────────────────────

export interface AlphaProfileSignalFeedFilter {
  profileId: string
}

export interface AlphaNamedSignalFeedFilter {
  feedId: string
}
