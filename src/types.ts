// ─────────────────────────────────────────────────────────────────────────────
// Control-plane API response types (mirrors shuriken-api /api/v2/ws/* DTOs)
// ─────────────────────────────────────────────────────────────────────────────

/** Stream visibility level. */
export type StreamVisibility = 'public' | 'presence'

/** Payload encoding format. */
export type PayloadFormat = 'json'

/** A filter field accepted by a stream. */
export interface FilterField {
  /** Filter parameter name. */
  name: string
  /** Whether this filter is required. */
  required: boolean
  /** Human-readable description. */
  description: string
}

/** A stream entry from the stream catalog. */
export interface StreamEntry {
  /** Stream identifier (e.g. `svm.token.swaps`). */
  id: string
  /** Visibility level. */
  visibility: StreamVisibility
  /** Accepted filter fields. */
  filters: FilterField[]
  /** Pusher event name. */
  event: string
  /** Payload encoding format. */
  payloadFormat: PayloadFormat
  /** Schema identifier for the payload. */
  payloadSchemaId: string
}

/** Response from the stream catalog endpoint. */
export interface StreamCatalogResponse {
  /** Available streams. */
  streams: StreamEntry[]
}

/** WebSocket connection parameters. */
export interface ConnectionInfo {
  /** Provider name (e.g. `pusher`). */
  provider: string
  /** Pusher app key. */
  appKey: string
  /** WebSocket host. */
  wsHost: string
  /** WebSocket port. */
  wsPort: number
  /** Whether to force TLS. */
  forceTls: boolean
  /** URL for Pusher channel authentication. */
  authEndpoint: string
}

/** Session configuration. */
export interface SessionInfo {
  /** Recommended reconnect backoff delays in milliseconds. */
  recommendedReconnectBackoffMs: number[]
}

/** A resolved stream subscription with channel binding info. */
export interface ResolvedSubscription {
  /** Stream identifier. */
  stream: string
  /** Pusher channel name. */
  channel: string
  /** Pusher event name. */
  event: string
  /** Stream visibility. */
  visibility: StreamVisibility
  /** Payload encoding format. */
  payloadFormat: PayloadFormat
  /** Schema identifier for the payload. */
  payloadSchemaId: string
  /** URL to fetch the payload schema. */
  payloadSchemaUrl?: string
}

/** Response from the WebSocket session bootstrap endpoint. */
export interface SessionResponse {
  /** Connection parameters. */
  connection: ConnectionInfo
  /** Session configuration. */
  session: SessionInfo
  /** Resolved subscriptions with channel/event mappings. */
  subscriptions: ResolvedSubscription[]
}

// ─────────────────────────────────────────────────────────────────────────────
// SDK client types
// ─────────────────────────────────────────────────────────────────────────────

/** Options for {@link createShurikenClient}. */
export interface ShurikenClientOptions {
  /** API base URL (default: `https://api.shuriken.trade`). */
  apiBaseUrl?: string
  /** Agent API key (`sk_...`). Get one at https://app.shuriken.trade/agents. */
  apiKey: string
}

/** A stream subscription filter. */
export interface SubscriptionFilter {
  /** Stream identifier (e.g. `svm.token.swaps`). */
  stream: string
  /** Filter key-value pairs (e.g. `{ tokenAddress: '...' }`). */
  filter?: Record<string, string>
}

/** WebSocket connection state. */
export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed'

/** Emitted when the WebSocket connection state changes. */
export interface ConnectionStateEvent {
  /** New connection state. */
  state: ConnectionState
  /** Reason for the state change, if available. */
  reason?: string
}

/** Callback for WebSocket stream messages. */
export type MessageHandler<T = unknown> = (payload: T) => void

/** Callback for WebSocket connection state changes. */
export type ConnectionStateHandler = (event: ConnectionStateEvent) => void

/** Handle to an active WebSocket subscription. */
export interface ShurikenSubscription {
  /** Unsubscribe from the stream. */
  unsubscribe(): void
}
