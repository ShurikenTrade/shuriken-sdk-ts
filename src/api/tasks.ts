// ─────────────────────────────────────────────────────────────────────────────
// Tasks domain types (mirrors shuriken-api /api/v2/tasks/* DTOs)
// ─────────────────────────────────────────────────────────────────────────────

/** Execution status of a task. */
export interface TaskStatus {
  /** Task identifier. */
  taskId: string
  /** Task type (e.g. `swap`, `nonce`, `cleanup`, `approval`). */
  taskType: string
  /** Current status. */
  status: 'submitted' | 'pending' | 'success' | 'failed'
  /** On-chain transaction hash, once available. */
  txHash: string | null
  /** Error code if the task failed. */
  errorCode: string | null
  /** Human-readable error message if the task failed. */
  errorMessage: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Tasks namespace interface
// ─────────────────────────────────────────────────────────────────────────────

/** Task status endpoints (`client.tasks.*`). */
export interface TasksApi {
  /** Poll the execution status of a task. */
  getStatus(taskId: string): Promise<TaskStatus>
}
