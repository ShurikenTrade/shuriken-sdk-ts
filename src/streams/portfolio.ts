// ─────────────────────────────────────────────────────────────────────────────
// Portfolio / automation notification stream payload types
//
// Payload shapes for per-user transaction and task lifecycle notifications
// delivered on the Shuriken notification WebSocket streams.
// ─────────────────────────────────────────────────────────────────────────────

// ── portfolio.notifications ──────────────────────────────────────────────────

export interface SwapNotificationEvent {
  type: 'swap'
  taskId: string
  userId: string
  chainId: number
}

export interface TransferNotificationEvent {
  type: 'transfer'
  taskId: string
  userId: string
}

export interface ApprovalNotificationEvent {
  type: 'approval'
  taskId: string
  userId: string
}

export interface AutomationNotificationEvent {
  type: 'automation'
  taskId: string
  userId: string
}

export interface StrategyNotificationEvent {
  type: 'strategy'
  rootTaskId: string
  userId: string
}

export interface ClaimNotificationEvent {
  type: 'claim'
  claimId: string
  userId: string
}

export interface CleanupNotificationEvent {
  type: 'cleanup'
  taskId: string
  userId: string
}

export interface SvmNonceNotificationEvent {
  type: 'svmNonce'
  taskId: string
  userId: string
}

export interface CrosschainSwapNotificationEvent {
  type: 'crosschainSwap'
  taskId: string
  userId: string
}

export interface PerpsOrderNotificationEvent {
  type: 'perpsOrder'
  taskId: string
  userId: string
}

/**
 * Union of all notification payload shapes delivered on the
 * `portfolio.notifications` stream. Discriminate by the `type` field.
 */
export type PortfolioNotificationEvent =
  | SwapNotificationEvent
  | TransferNotificationEvent
  | ApprovalNotificationEvent
  | AutomationNotificationEvent
  | StrategyNotificationEvent
  | ClaimNotificationEvent
  | CleanupNotificationEvent
  | SvmNonceNotificationEvent
  | CrosschainSwapNotificationEvent
  | PerpsOrderNotificationEvent

// ── automation.updates ───────────────────────────────────────────────────────

/**
 * Automation-scoped notification updates. Delivered on the per-user
 * automation channel — discriminate by `type` to identify the kind of
 * automation lifecycle event (the automation task itself, strategy progress,
 * or trigger orders routed through swap execution).
 */
export type AutomationUpdateEvent =
  | AutomationNotificationEvent
  | StrategyNotificationEvent
  | SwapNotificationEvent
