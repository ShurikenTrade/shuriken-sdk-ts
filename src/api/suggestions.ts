// ─────────────────────────────────────────────────────────────────────────────
// Trade Suggestions domain types
// (mirrors shuriken-api `/api/v2/agents/suggestions/*` DTOs)
//
// Agents post advisory trade ideas to the user; users ack (execute) or dismiss
// them from the terminal / tg-bot. Lifecycle states (OPEN | ACTED | DISMISSED |
// EXPIRED) are derived in the service layer from three nullable timestamps.
// ─────────────────────────────────────────────────────────────────────────────

/** Derived suggestion lifecycle. */
export type SuggestionState = 'OPEN' | 'ACTED' | 'DISMISSED' | 'EXPIRED'

/** Confidence hint posted by the agent. */
export type SuggestionConfidence = 'LOW' | 'MEDIUM' | 'HIGH'

/** Trade direction (proto enum name as the wire value). */
export type SuggestionSide = 'BUY' | 'SELL'

/** Lightweight handle for the agent key that posted the suggestion. */
export interface SuggestionAgentKey {
  /** Agent key ID. */
  id: string
  /** Display name for the agent key. May be empty. */
  name: string
}

/**
 * Asset metadata enriched onto the response — consumers don't have to call
 * `get_token_info` separately.
 */
export interface SuggestionAsset {
  /** Token address on the suggestion's network. */
  address: string
  /** Token symbol. */
  symbol: string
  /** Token name. */
  name: string
  /** Most recent USD price, if known. */
  priceUsd: number | null
}

/**
 * Outbound suggestion shape returned by create / list.
 * The `state` field is derived; the timestamps remain the source of truth.
 *
 * `actedAt` / `dismissedAt` / `dismissReason` / `linkedTaskId` are populated
 * when the user acks or dismisses the suggestion from the terminal / tg-bot
 * — agents observe the resolution via `list` but cannot drive it themselves.
 */
export interface TradeSuggestion {
  /** Suggestion ID (cuid). */
  id: string
  /** Derived lifecycle. */
  state: SuggestionState
  /** ISO 8601 creation timestamp. */
  createdAt: string
  /** ISO 8601 expiry timestamp. */
  expiresAt: string
  /** ISO 8601 timestamp when the user acked the suggestion, if any. */
  actedAt: string | null
  /** ISO 8601 timestamp when the user dismissed the suggestion, if any. */
  dismissedAt: string | null
  /** Free-form reason supplied with `dismiss`, if any. */
  dismissReason: string | null
  /** Task ID linked at `ack` time, if any. */
  linkedTaskId: string | null
  /** Trade direction. */
  side: SuggestionSide
  /** Network ID proto enum name, e.g. `SOL`, `BASE`, `BSC`, `MONAD`. */
  networkId: string
  /** Asset metadata. */
  asset: SuggestionAsset
  /** Why the agent suggested this trade. ≤500 chars. */
  rationale: string
  /** Optional sizing hint in USD. */
  amountInUsd: number | null
  /** Optional confidence hint. */
  confidence: SuggestionConfidence | null
  /** Agent key that posted the suggestion. */
  agentKey: SuggestionAgentKey
}

/** Parameters for {@link SuggestionsApi.create}. */
export interface CreateSuggestionRequest {
  /** Trade direction. */
  side: SuggestionSide
  /** `common.NetworkId` enum name (`SOL`, `BASE`, `BSC`, `MONAD`, …). */
  networkId: string
  /** Token address. Direction is implicit from `side`. */
  asset: string
  /** Why you're suggesting this trade. ≤500 chars. */
  rationale: string
  /** Optional sizing hint in USD. */
  amountInUsd?: number
  /** Optional confidence: `LOW`, `MEDIUM`, or `HIGH`. */
  confidence?: SuggestionConfidence
}

/** Parameters for {@link SuggestionsApi.list}. */
export interface ListSuggestionsQuery {
  /** Filter by state, or `ALL` for everything. Defaults to `OPEN` server-side. */
  state?: SuggestionState | 'ALL'
  /** Page size, 1..=200. Defaults to 50 server-side. */
  limit?: number
  /** Opaque next-page cursor returned by a previous call. */
  cursor?: string
}

/** Response from {@link SuggestionsApi.list}. */
export interface ListSuggestionsResponse {
  /** Suggestions ordered most-recent first. */
  suggestions: TradeSuggestion[]
  /** Cursor for the next page, if any. */
  nextCursor?: string
}

/** Agent-posted trade suggestions (`client.suggestions.*`). */
export interface SuggestionsApi {
  /** Post a new trade suggestion. Requires the `suggest:trade` scope. */
  create(req: CreateSuggestionRequest): Promise<TradeSuggestion>
  /** List suggestions for the authenticated user. */
  list(query?: ListSuggestionsQuery): Promise<ListSuggestionsResponse>
}
