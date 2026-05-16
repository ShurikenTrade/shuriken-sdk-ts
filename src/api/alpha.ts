// ─────────────────────────────────────────────────────────────────────────────
// Alpha signals domain types (mirrors shuriken-api /api/v2/alpha/* DTOs)
//
// No naming collisions found in the existing src/ tree. A grep for
// AlphaSource, AlphaCallSignal, RecentCall, GlobalCall, TokenMention
// across src/ returned no results, so canonical names are used directly.
//
// Response shapes are derived from live staging curl outputs captured
// on 2026-05-16 against build dev-67daebf-1778926051 — not hand-rolled
// from the spec.
// ─────────────────────────────────────────────────────────────────────────────

/** A single alpha source connection. */
export interface AlphaSourceItem {
  connectionId: string
  connectionType: string
  enabled: boolean
  createdAt?: string
  name?: string
  platform?: string
  source?: string
}

/** Response from {@link AlphaNamespace.getSources}. */
export interface GetAlphaSourcesResult {
  sources: AlphaSourceItem[]
}

/** The originating source recorded on a recent alpha call. */
export interface RecentCallSource {
  platform: string
  channelName?: string
  authorUsername?: string
  messagePreview?: string
  sourceName?: string
  connectionId?: string
}

/** A single entry in the recent-calls list. */
export interface RecentCallItem {
  tokenAddress: string
  tokenSymbol?: string
  tokenName?: string
  chain: string
  firstSeenAt: number
  lastSeenAt: number
  mentionCount: number
  priceUsdAtCall?: string
  currentPriceUsd?: string
  marketCapUsdAtCall?: string
  liquidityUsdAtCall?: string
  lastSource?: RecentCallSource
}

/** Parameters for {@link AlphaNamespace.getRecentCalls}. */
export interface GetRecentCallsParams {
  limit?: number
  sourceName?: string
  connectionId?: string
}

/** Response from {@link AlphaNamespace.getRecentCalls}. */
export interface GetRecentCallsResult {
  totalCount: number
  calls: RecentCallItem[]
}

/** A single entry in the global-calls list. */
export interface GlobalCallItem {
  tokenAddress: string
  tokenSymbol?: string
  tokenName?: string
  chain: string
  firstSeenAt: number
  lastSeenAt: number
  mentionCount: number
  currentPriceUsd?: string
  priceChangeSinceCallPct?: string
  lastTweetAuthor?: string
  lastTweetPreview?: string
}

/** Parameters for {@link AlphaNamespace.getGlobalCalls}. */
export interface GetGlobalCallsParams {
  platform?: string
  limit?: number
}

/** Response from {@link AlphaNamespace.getGlobalCalls}. */
export interface GetGlobalCallsResult {
  platform: string
  totalCount: number
  calls: GlobalCallItem[]
}

/** The account that issued an alpha call. */
export interface AlphaCallCaller {
  username?: string
  displayName?: string
  avatarUrl?: string
  verified?: boolean
}

/** Source location detail for an alpha call signal. */
export interface AlphaCallSourceDetail {
  guildId?: string
  serverName?: string
  channelId?: string
  channelName?: string
  topicId?: number
  topicTitle?: string
  tweetId?: string
  messageId?: string
}

/** On-chain trade data associated with an alpha call signal. */
export interface AlphaTradeData {
  isBuy: boolean
  amountUsd: string
  amountNative: string
  walletAddress: string
  txSignature: string
}

/** A single message within a context thread surrounding an alpha call. */
export interface ContextMessage {
  author?: string
  text: string
  timestampMs: number
  offset: number
}

/** A single alpha call signal returned by the call-context endpoint. */
export interface AlphaCallSignal {
  signalId: string
  timestampMs: number
  platform: string
  isBot: boolean
  priceUsd?: number
  marketCapUsd?: number
  liquidityUsd?: number
  caller?: AlphaCallCaller
  source?: AlphaCallSourceDetail
  tradeData?: AlphaTradeData
  /** `null` for X/trade signals where no message body is available. */
  messagePreview?: string | null
  /** `null` for X/trade signals where no thread context is available. */
  contextMessages?: ContextMessage[] | null
}

/** Parameters for {@link AlphaNamespace.getCallContext}. */
export interface GetCallContextParams {
  limit?: number
  cursor?: number
  /**
   * Filter signals to specific platforms.
   * Serialised as a comma-separated string on the wire (e.g. `"discord,telegram"`).
   */
  sourceFilter?: string[]
  includeBotSignals?: boolean
  includeMessageContext?: boolean
}

/** Response from {@link AlphaNamespace.getCallContext}. */
export interface GetCallContextResult {
  tokenAddress: string
  totalSignals: number
  hasMore: boolean
  nextCursor?: number
  signals: AlphaCallSignal[]
}

/** A single mention entry for a token. */
export interface TokenMentionItem {
  messageId: string
  platform: string
  timestamp: number
  channelId?: string
  guildId?: string
  authorUsername?: string
  priceUsdAtMention?: string
  marketCapUsdAtMention?: string
}

/** Parameters for {@link AlphaNamespace.getTokenMentions}. */
export interface GetTokenMentionsParams {
  limit?: number
}

/** Response from {@link AlphaNamespace.getTokenMentions}. */
export interface GetTokenMentionsResult {
  tokenAddress: string
  tokenSymbol?: string
  chain: string
  totalMentions: number
  firstSeenAt?: number
  lastSeenAt?: number
  mentions: TokenMentionItem[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Alpha namespace interface
// ─────────────────────────────────────────────────────────────────────────────

/** Alpha signal endpoints (`client.alpha.*`). */
export interface AlphaNamespace {
  /** List the user's configured alpha source connections. */
  getSources(): Promise<GetAlphaSourcesResult>
  /** Retrieve recent alpha calls visible to this key's source connections. */
  getRecentCalls(params?: GetRecentCallsParams): Promise<GetRecentCallsResult>
  /** Retrieve global (public) alpha calls, optionally filtered by platform. */
  getGlobalCalls(params?: GetGlobalCallsParams): Promise<GetGlobalCallsResult>
  /**
   * Retrieve full signal context for a specific token — the raw signals that
   * drove the call, with optional surrounding message context.
   */
  getCallContext(tokenAddress: string, params?: GetCallContextParams): Promise<GetCallContextResult>
  /** Retrieve mention history for a specific token. */
  getTokenMentions(
    tokenAddress: string,
    params?: GetTokenMentionsParams
  ): Promise<GetTokenMentionsResult>
}
