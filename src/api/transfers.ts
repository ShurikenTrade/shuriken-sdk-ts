// ─────────────────────────────────────────────────────────────────────────────
// Transfers domain types (mirrors shuriken-api /api/v2/transfers/* DTOs)
//
// Two endpoints: `send` and `retire-wallet` (which drains the source wallet
// then archives it). Both require the `transfer:write` scope.
//
// Both methods accept `awaitResult` (default `true`) which blocks until the
// terminal task state is reached. When `awaitResult` is `true` and the
// transfer succeeds, `transaction` will be present in the response.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * On-chain transaction details included in a successful `TransferResult`
 * when `awaitResult` was `true`.
 */
export interface TransferTransaction {
  /** Transaction hash. */
  hash: string
  /** Block-explorer URL, or `null` if the chain has no known explorer. */
  explorerUrl: string | null
}

/**
 * Error detail included in a failed `TransferResult`.
 */
export interface TransferError {
  /** Machine-readable error code. */
  code: string
  /** Human-readable error message. */
  message: string
}

/**
 * Result returned by {@link TransfersApi.send} and {@link TransfersApi.retireWallet}.
 */
export interface TransferResult {
  /** Background task ID. Poll via `client.tasks.getStatus` if `awaitResult` was `false`. */
  taskId: string
  /** Terminal task state. `PENDING` is returned immediately when `awaitResult` is `false`. */
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  /**
   * `true` when the source wallet will be automatically archived upon a
   * successful transfer (always `true` for `retireWallet`).
   */
  willArchiveOnSuccess: boolean
  /**
   * Present when `status` is `SUCCESS` and `awaitResult` was `true`.
   */
  transaction?: TransferTransaction
  /**
   * Present when `status` is `FAILED`.
   */
  error?: TransferError
}

/**
 * Request body for {@link TransfersApi.send}.
 */
export interface SendParams {
  /** Source wallet ID. */
  fromWalletId: string
  /** Destination wallet ID. */
  toWalletId: string
  /**
   * Token to send. Well-known symbols: `"SOL"`, `"ETH"`, `"BNB"`, `"USDC"`,
   * `"native"`. Also accepts a raw on-chain token address.
   */
  token: string
  /**
   * Amount in raw base units as a decimal string.
   * Example: `"1000000"` for 1 SOL (1 000 000 lamports).
   */
  amount: string
  /** Blockchain identifier. `"SVM"` for Solana, `"EVM"` for EVM-compatible chains. */
  chain: string
  /**
   * EVM chain ID. Required when `chain` is `"EVM"`.
   * Common values: `8453` (Base), `56` (BSC).
   */
  chainId?: number
  /**
   * When `true` (default), the call blocks until the terminal task state is
   * reached and `transaction` is populated on success. Set to `false` to
   * return immediately with `status: "PENDING"`.
   */
  awaitResult?: boolean
  /**
   * Caller-supplied idempotency key. Duplicate requests with the same
   * `correlationId` within a 5-minute window are deduplicated server-side.
   * Omit to let the server auto-derive a bucket key.
   */
  correlationId?: string
  /** Free-form note attached to the activity feed entry for this transfer. */
  agentComment?: string
}

/**
 * Request body for {@link TransfersApi.retireWallet}.
 *
 * Drains the source wallet to `toWalletId` then archives the source. Identical
 * fields to {@link SendParams} except `amount` is omitted — the full balance
 * is always transferred.
 */
export interface RetireWalletParams {
  /** Source wallet to drain and then archive. */
  fromWalletId: string
  /** Destination wallet that receives all funds. */
  toWalletId: string
  /**
   * Token to send. Well-known symbols: `"SOL"`, `"ETH"`, `"BNB"`, `"USDC"`,
   * `"native"`. Also accepts a raw on-chain token address.
   */
  token: string
  /** Blockchain identifier. `"SVM"` for Solana, `"EVM"` for EVM-compatible chains. */
  chain: string
  /**
   * EVM chain ID. Required when `chain` is `"EVM"`.
   * Common values: `8453` (Base), `56` (BSC).
   */
  chainId?: number
  /**
   * When `true` (default), the call blocks until the terminal task state is
   * reached. Set to `false` to return immediately with `status: "PENDING"`.
   */
  awaitResult?: boolean
  /**
   * Caller-supplied idempotency key. Omit to let the server auto-derive.
   */
  correlationId?: string
  /** Free-form note attached to the activity feed entry for this transfer. */
  agentComment?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Transfers namespace interface
// ─────────────────────────────────────────────────────────────────────────────

/** Wallet-to-wallet transfer endpoints (`client.transfers.*`). */
export interface TransfersApi {
  /**
   * Send a token amount from one wallet to another.
   *
   * By default (`awaitResult: true`) the call blocks until the on-chain
   * transaction is confirmed and returns the hash. Pass `awaitResult: false`
   * to get a task ID immediately and poll via `client.tasks.getStatus`.
   *
   * Required scope: `transfer:write`
   */
  send(params: SendParams): Promise<TransferResult>

  /**
   * Drain a wallet's full token balance to another wallet, then archive the
   * source wallet.
   *
   * Equivalent to `send` with the full balance as `amount`, followed by
   * an automatic archive of `fromWalletId` on success.
   * `willArchiveOnSuccess` is always `true` in the response.
   *
   * Required scope: `transfer:write`
   */
  retireWallet(params: RetireWalletParams): Promise<TransferResult>
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

type ApiPost = <T>(path: string, body: unknown) => Promise<T>

/**
 * Create the `TransfersApi` implementation bound to the provided HTTP helper.
 *
 * @internal Used by `createShurikenClient`.
 */
export function createTransfersApi(apiPost: ApiPost): TransfersApi {
  return {
    send: (params) => apiPost<TransferResult>('/api/v2/transfers/send', params),

    retireWallet: (params) => apiPost<TransferResult>('/api/v2/transfers/retire-wallet', params),
  }
}
