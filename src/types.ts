// ─────────────────────────────────────────────────────────────────────────────
// Control-plane API response types (mirrors shuriken-api /api/v2/ws/* DTOs)
// ─────────────────────────────────────────────────────────────────────────────

export type StreamVisibility = 'public' | 'presence'

export type PayloadFormat = 'json'

export interface FilterField {
  name: string
  required: boolean
  description: string
}

export interface StreamEntry {
  id: string
  visibility: StreamVisibility
  filters: FilterField[]
  event: string
  payloadFormat: PayloadFormat
  payloadSchemaId: string
}

export interface StreamCatalogResponse {
  streams: StreamEntry[]
}

export interface ConnectionInfo {
  provider: string
  appKey: string
  wsHost: string
  wsPort: number
  forceTls: boolean
  authEndpoint: string
}

export interface SessionInfo {
  recommendedReconnectBackoffMs: number[]
}

export interface ResolvedSubscription {
  stream: string
  channel: string
  event: string
  visibility: StreamVisibility
  payloadFormat: PayloadFormat
  payloadSchemaId: string
  payloadSchemaUrl?: string
}

export interface SessionResponse {
  connection: ConnectionInfo
  session: SessionInfo
  subscriptions: ResolvedSubscription[]
}

// ─────────────────────────────────────────────────────────────────────────────
// SDK client types
// ─────────────────────────────────────────────────────────────────────────────

export interface ShurikenClientOptions {
  apiBaseUrl: string
  apiKey: string
}

export interface SubscriptionFilter {
  stream: string
  filter?: Record<string, string>
}

export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed'

export interface ConnectionStateEvent {
  state: ConnectionState
  reason?: string
}

export type MessageHandler<T = unknown> = (payload: T) => void

export type ConnectionStateHandler = (event: ConnectionStateEvent) => void

export interface ShurikenSubscription {
  unsubscribe(): void
}
