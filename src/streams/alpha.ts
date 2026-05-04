// ─────────────────────────────────────────────────────────────────────────────
// Alpha stream payload types
//
// Payload shapes delivered on the Shuriken alpha / signal-feed WebSocket
// streams.
// ─────────────────────────────────────────────────────────────────────────────

import type { FeedTokenMeta, FeedTokenSignal, Network } from './common.js'

// ── Shared primitives ────────────────────────────────────────────────────────

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

// ── Per-platform message variants ────────────────────────────────────────────

export interface DiscordMessageEvent {
  messageId: string
  guildId: string
  channelId: string
  /** Server name at ingest time. Frozen — does not track renames. */
  snapshotGuildName?: string
  /** Channel name at ingest time. Frozen — does not track renames. */
  snapshotChannelName?: string
  content: string
  timestamp: number
  author?: AlphaMessageAuthor
  tokens: AlphaMessageToken[]
  isEdited: boolean
  isDeleted: boolean
  replyToMessageId?: string
}

export interface TelegramMessageEvent {
  messageId: string
  chatId: string
  /** Chat title at ingest time. Frozen — does not track renames. */
  snapshotChatTitle?: string
  topicId?: number
  /** Forum topic title (megagroups with forum=true). */
  topicTitle?: string
  content: string
  timestamp: number
  author?: AlphaMessageAuthor
  tokens: AlphaMessageToken[]
  isEdited: boolean
  isDeleted: boolean
  replyToMessageId?: string
}

export interface XAuthor {
  userId: string
  username: string
  displayName?: string
  avatarUrl?: string
  verified: boolean
  followersCount: number
}

export interface XMention {
  username: string
  userId: string
}

export interface XPublicMetrics {
  likeCount: number
  retweetCount: number
  replyCount: number
  quoteCount: number
}

export interface XMessageEvent {
  tweetId: string
  content: string
  timestamp: number
  author?: XAuthor
  tokens: AlphaMessageToken[]
  hashtags: string[]
  cashtags: string[]
  mentions: XMention[]
  publicMetrics?: XPublicMetrics
  conversationId?: string
  inReplyToUserId?: string
  mediaUrls: string[]
  isDeleted: boolean
}

/**
 * Platform-tagged chat / tweet event. Each variant carries only the fields
 * meaningful to its platform — Discord callers don't see Telegram-only fields
 * and vice versa.
 *
 * JSON wire shape: `{ "platform": "discord", "data": { ... } }`.
 */
export type MessageEvent =
  | { platform: 'discord'; data: DiscordMessageEvent }
  | { platform: 'telegram'; data: TelegramMessageEvent }
  | { platform: 'x'; data: XMessageEvent }

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
 * Discriminate by the `type` field — chat / tweet messages do not carry
 * a `type` field; they're tagged via `platform`.
 */
export type AlphaPersonalEvent = MessageEvent | AlphaCallReferenceEvent

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
 * Real-time chat / tweet message routed to a named signal feed
 * (`alpha.signalFeedNamed`).
 */
export interface AlphaFeedMessageEvent {
  type: 'feedMessage'
  feedId: string
  message?: MessageEvent
}

// ── Alpha filter shapes ──────────────────────────────────────────────────────

export interface AlphaProfileSignalFeedFilter {
  profileId: string
}

export interface AlphaNamedSignalFeedFilter {
  feedId: string
}
