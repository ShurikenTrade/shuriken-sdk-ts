// ─────────────────────────────────────────────────────────────────────────────
// Splits domain types (mirrors shuriken-api /api/v2/splits/* DTOs)
//
// SplitNOW cross-chain split flow. Two-step: plan → execute.
//
//  1. Call `plan` to get a `planId` and a human-readable `summary`. The plan
//     is valid for 60 seconds (`expiresInSeconds`).
//  2. Review the `summary` and `warnings`, then call `execute` with the
//     `planId` to kick off the split.
//
// Both endpoints require feature flag `agent_kit/api_v2` on the deployment.
// If the flag is off the API returns `503 SPLIT_DISABLED`.
//
// Scopes: `split:plan` for plan, `split:execute` for execute.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single destination wallet and its share of the split, expressed in basis
 * points (bips). The sum of all `pctBips` across the destinations array must
 * equal exactly `10000` (100 %).
 */
export interface PlanSplitDestination {
  /** Destination wallet ID. */
  walletId: string
  /**
   * Share of the split in basis points (1 bip = 0.01 %).
   * All destinations in a single plan must sum to exactly 10000.
   */
  pctBips: number
}

/**
 * Request body for {@link SplitsApi.plan}.
 *
 * Either `destinationGroupId` OR `destinations` must be provided — they are
 * mutually exclusive.
 */
export interface PlanSplitBody {
  /** Source wallet ID to split funds from. */
  sourceWalletId: string
  /**
   * Wallet-group ID whose members become the destinations. Mutually exclusive
   * with `destinations`.
   */
  destinationGroupId?: string
  /**
   * Explicit destination list with per-wallet bip allocations. Mutually
   * exclusive with `destinationGroupId`.
   */
  destinations?: PlanSplitDestination[]
  /**
   * Amount of the source asset to split, as a decimal string.
   * Example: `"0.16"` for 0.16 SOL.
   */
  fromAmount: string
  /**
   * Source asset identifier (lowercase).
   * Supported values: `"sol"` | `"eth"` | `"bnb"`.
   */
  fromAsset: string
  /** Free-form note attached to the activity feed entry for this split. */
  agentComment?: string
}

/**
 * Exchange-rate detail for a single destination leg within a split plan.
 */
export interface PlanSplitRate {
  /** Exchanger / aggregator identifier. */
  exchangerId: string
  /** Quoted exchange rate as a decimal string. */
  exchangeRate: string
  /** Target asset ID on the destination chain. */
  toAssetId: string
  /** Target network ID. */
  toNetworkId: string
}

/**
 * Response from {@link SplitsApi.plan}.
 *
 * Pass `planId` to {@link SplitsApi.execute} within `expiresInSeconds` seconds.
 * Review `summary` and `warnings` before executing.
 */
export interface PlanSplitResult {
  /** Opaque plan identifier. Valid for 60 seconds from generation. */
  planId: string
  /** Number of destination wallets in this plan. */
  destinationCount: number
  /** Human-readable description of what the split will do. Show to users / agents before executing. */
  summary: string
  /** Per-destination exchange rate details. */
  rates: PlanSplitRate[]
  /** Non-fatal warnings. Review before executing (e.g. low liquidity on a leg). */
  warnings: string[]
  /** ISO 8601 timestamp after which this plan can no longer be executed. */
  expiresAt: string
  /** Seconds until the plan expires. Always `60` at plan creation. */
  expiresInSeconds: number
}

/**
 * Request body for {@link SplitsApi.execute}.
 */
export interface ExecuteSplitBody {
  /** Plan ID returned by {@link SplitsApi.plan}. Must be used within 60 seconds. */
  planId: string
  /** Free-form note attached to the activity feed entry for this split. */
  agentComment?: string
}

/**
 * Response from {@link SplitsApi.execute}.
 */
export interface ExecuteSplitResult {
  /** Background task ID. Poll via `client.tasks.getStatus` for live status. */
  taskId: string
  /** SplitNOW order ID for cross-reference with the SplitNOW service. */
  splitnowOrderId: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Splits namespace interface
// ─────────────────────────────────────────────────────────────────────────────

/** SplitNOW cross-chain split endpoints (`client.splits.*`). */
export interface SplitsApi {
  /**
   * Plan a cross-chain split.
   *
   * Returns a `planId` (valid 60 seconds), a human-readable `summary`, per-leg
   * exchange `rates`, and any `warnings`. Review the summary and warnings before
   * calling `execute`.
   *
   * Required scope: `split:plan`
   *
   * @throws {ShurikenApiError} with code `SPLIT_DISABLED` (503) if the
   *   deployment does not have the `agent_kit/api_v2` feature flag enabled.
   */
  plan(params: PlanSplitBody): Promise<PlanSplitResult>

  /**
   * Execute a previously planned split.
   *
   * Submits the split to SplitNOW and returns a `taskId` for polling and a
   * `splitnowOrderId` for cross-referencing with the SplitNOW service.
   *
   * Required scope: `split:execute`
   *
   * @throws {ShurikenApiError} with code `SPLIT_DISABLED` (503) if the
   *   deployment does not have the `agent_kit/api_v2` feature flag enabled.
   */
  execute(params: ExecuteSplitBody): Promise<ExecuteSplitResult>
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

type ApiPost = <T>(path: string, body: unknown) => Promise<T>

/**
 * Create the `SplitsApi` implementation bound to the provided HTTP helper.
 *
 * @internal Used by `createShurikenClient`.
 */
export function createSplitsApi(apiPost: ApiPost): SplitsApi {
  return {
    plan: (params) => apiPost<PlanSplitResult>('/api/v2/splits/plan', params),

    execute: (params) => apiPost<ExecuteSplitResult>('/api/v2/splits/execute', params),
  }
}
