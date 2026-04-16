// ─────────────────────────────────────────────────────────────────────────────
// Trigger domain types (mirrors shuriken-api /api/v2/trigger/* DTOs)
// ─────────────────────────────────────────────────────────────────────────────

export interface TriggerCondition {
  metric: string
  direction: string
  value: string | null
  trailingPercentage: number | null
}

export interface TriggerOrder {
  orderId: string
  status: string
  chain: string
  inputToken: string
  outputToken: string
  amount: string
  createdAt: string
  trigger: TriggerCondition
}

export interface TriggerOrderView {
  orderId: string
  status: string
  chain: string | null
  inputToken: string
  outputToken: string
  amount: string
  createdAt: string
  updatedAt: string
  trigger: TriggerCondition | null
}

export interface CancelledTriggerOrder {
  orderId: string
  status: string
}

export interface TriggerOrdersResponse {
  orders: TriggerOrderView[]
  nextCursor: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Request parameter types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateTriggerOrderParams {
  chain: string
  inputToken: string
  outputToken: string
  amount: string
  walletId: string
  triggerMetric: string
  triggerDirection: string
  triggerValue?: string
  triggerBehavior?: 'immediate' | 'trailing'
  trailingPercentage?: number
  slippageBps?: number
  expiryHours?: number
}

export interface ListTriggerOrdersParams {
  limit?: number
  cursor?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Trigger namespace interface
// ─────────────────────────────────────────────────────────────────────────────

export interface TriggerApi {
  create(params: CreateTriggerOrderParams): Promise<TriggerOrder>
  get(orderId: string): Promise<TriggerOrderView>
  list(params?: ListTriggerOrdersParams): Promise<TriggerOrdersResponse>
  cancel(orderId: string): Promise<CancelledTriggerOrder>
}
