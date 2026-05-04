// ─────────────────────────────────────────────────────────────────────────────
// Wallets domain types (mirrors shuriken-api /api/v2/wallets/* DTOs)
//
// All three endpoints require `write:wallets` scope.
//
// Naming: this module exports `WalletRecord` as the canonical archive-lifecycle
// entity. The existing `AccountWallet` in `./account.ts` is an older, narrower
// shape used by the account-listing surface — it lacks `state` and `archivedAt`
// fields. `WalletRecord` maps directly to the Rust `account::Wallet` struct
// (with `state` + `archivedAt`) returned by the v2 archive/unarchive endpoints.
// The two types are intentionally separate; do not merge or extend `AccountWallet`.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full wallet entity returned by archive/unarchive endpoints.
 *
 * Distinct from `AccountWallet` (from `./account.ts`), which is the narrower
 * shape returned by the account-listing surface and does not carry `state` or
 * `archivedAt`. Use `WalletRecord` anywhere you need lifecycle state.
 */
export interface WalletRecord {
  /** Wallet ID (cuid). */
  walletId: string
  /** On-chain address. */
  address: string
  /** Chain identifier. Omitted for multi-chain wallets. */
  chain?: string
  /** Optional human-readable label. */
  label?: string
  /** Current lifecycle state. */
  state: 'ACTIVE' | 'ARCHIVED'
  /** ISO 8601 timestamp of when the wallet was archived. Omitted when `state` is `ACTIVE`. */
  archivedAt?: string
}

/**
 * Per-wallet result within a {@link BulkArchiveResponse}.
 */
export interface BulkArchiveEntry {
  /** Wallet ID. */
  walletId: string
  /** Outcome for this wallet. */
  status: 'archived' | 'already_archived'
  /**
   * Present and `true` when archiving this wallet cleared the user's
   * account-level default wallet. Omitted unless the default was cleared.
   */
  clearedDefault?: boolean
}

/** Response from {@link WalletsApi.archive}. */
export interface ArchiveWalletResponse {
  /** Updated wallet record. */
  wallet: WalletRecord
  /**
   * `true` when archiving this wallet cleared the user's account-level
   * default wallet setting.
   */
  clearedDefault: boolean
}

/** Response from {@link WalletsApi.unarchive}. */
export interface UnarchiveWalletResponse {
  /** Updated wallet record. */
  wallet: WalletRecord
}

/** Request body for {@link WalletsApi.bulkArchive}. */
export interface BulkArchiveParams {
  /** Wallet IDs to archive. Maximum 100 per request. */
  walletIds: string[]
}

/** Response from {@link WalletsApi.bulkArchive}. */
export interface BulkArchiveResponse {
  /** Per-wallet outcome, one entry per requested wallet ID. */
  results: BulkArchiveEntry[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Wallets namespace interface
// ─────────────────────────────────────────────────────────────────────────────

/** Wallet archive-lifecycle endpoints (`client.wallets.*`). */
export interface WalletsApi {
  /**
   * Archive a wallet by ID.
   *
   * The wallet transitions from `ACTIVE` to `ARCHIVED`. If the wallet was
   * the account-level default, `clearedDefault` will be `true` in the response.
   *
   * Required scope: `write:wallets`
   */
  archive(walletId: string): Promise<ArchiveWalletResponse>

  /**
   * Unarchive a previously archived wallet.
   *
   * The wallet transitions from `ARCHIVED` back to `ACTIVE`.
   *
   * Required scope: `write:wallets`
   */
  unarchive(walletId: string): Promise<UnarchiveWalletResponse>

  /**
   * Archive up to 100 wallets in a single request.
   *
   * Each entry in the result carries an `'archived'` or `'already_archived'`
   * status so callers can distinguish wallets that were newly archived from
   * those that were already in the archived state.
   *
   * Required scope: `write:wallets`
   */
  bulkArchive(params: BulkArchiveParams): Promise<BulkArchiveResponse>
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

type ApiPost = <T>(path: string, body: unknown) => Promise<T>

/**
 * Create the `WalletsApi` implementation bound to the provided HTTP helper.
 *
 * @internal Used by `createShurikenClient`.
 */
export function createWalletsApi(apiPost: ApiPost): WalletsApi {
  return {
    archive: (walletId) =>
      apiPost<ArchiveWalletResponse>(`/api/v2/wallets/${encodeURIComponent(walletId)}/archive`, {}),

    unarchive: (walletId) =>
      apiPost<UnarchiveWalletResponse>(
        `/api/v2/wallets/${encodeURIComponent(walletId)}/unarchive`,
        {}
      ),

    bulkArchive: (params) => apiPost<BulkArchiveResponse>('/api/v2/wallets/bulk-archive', params),
  }
}
