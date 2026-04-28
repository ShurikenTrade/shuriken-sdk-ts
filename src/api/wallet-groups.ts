// ─────────────────────────────────────────────────────────────────────────────
// Wallet Groups domain types (mirrors shuriken-api /api/v2/wallet-groups/* DTOs)
//
// Each endpoint accepts EITHER the legacy `read:wallets` / `write:wallets`
// scope OR the focused `manage:wallet-groups` scope. Treasury-management keys
// can be issued with `manage:wallet-groups` only — they get full group CRUD
// without the broader wallet-address read surface that `read:wallets` grants.
//
// Naming: this module exports `WalletGroupRecord` rather than `WalletGroup`
// because the legacy in-settings `WalletGroup` (in `./account.js`) carries a
// different shape and is still referenced by `TradeSettings.walletGroups`.
// `WalletGroupRecord` is the canonical entity returned by the v2 REST surface.
// ─────────────────────────────────────────────────────────────────────────────

/** A user-defined named group of wallets on a single chain. */
export interface WalletGroupRecord {
  /** Group ID (cuid). */
  groupId: string
  /** Group name (1-32 chars). */
  name: string
  /** Chain string. `svm` | `base` | `bsc` for the generate pathway; arbitrary for others. */
  chain: string
  /** Member wallet IDs in display order. */
  walletIds: string[]
  /** ISO 8601 creation timestamp. */
  createdAt: string
  /** ISO 8601 last-update timestamp. */
  updatedAt: string
}

/** Parameters for {@link WalletGroupsApi.list}. */
export interface ListWalletGroupsParams {
  /** Optional chain filter. */
  chain?: string
}

/** Parameters for {@link WalletGroupsApi.create}. */
export interface CreateWalletGroupParams {
  /** Group name (1-32 chars). */
  name: string
  /** Chain. Required when `walletIds` is provided. */
  chain?: string
  /** Optional initial members. Wallets must already exist on `chain`. */
  walletIds?: string[]
}

/** Parameters for {@link WalletGroupsApi.createWithWallets}. */
export interface CreateWalletGroupWithWalletsParams {
  /** Group name (1-32 chars). Wallets are auto-named `<name> 1..N`. */
  name: string
  /** Chain. `svm` | `base` | `bsc` only. */
  chain: 'svm' | 'base' | 'bsc'
  /** Number of fresh wallets to create. 1..=16. */
  walletCount: number
}

/** Parameters for {@link WalletGroupsApi.update}. */
export interface UpdateWalletGroupParams {
  /** New name. */
  name?: string
}

/** Response from {@link WalletGroupsApi.delete}. */
export interface DeleteWalletGroupResponse {
  /** ID of the group that was deleted. Idempotent — also returned if the group was already gone. */
  groupId: string
}

/** Parameters for {@link WalletGroupsApi.addWallets}. */
export interface AddWalletsToGroupParams {
  /** Wallet IDs to add. Must exist on the group's chain. */
  walletIds: string[]
  /** Insert at this position; appends if absent. */
  position?: number
}

/** Parameters for {@link WalletGroupsApi.removeWallets}. */
export interface RemoveWalletsFromGroupParams {
  /** Wallet IDs to remove. Wallets are not deleted. */
  walletIds: string[]
}

/** Parameters for {@link WalletGroupsApi.reorderWallets}. */
export interface ReorderWalletsInGroupParams {
  /** Complete ordered list — must match current membership exactly. */
  walletIds: string[]
}

/** Parameters for {@link WalletGroupsApi.moveWallet}. */
export interface MoveWalletParams {
  /** Source group, or `null` to detach from current group. */
  fromGroupId?: string | null
  /** Destination group, or `null` to detach. */
  toGroupId?: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Wallet Groups namespace interface
// ─────────────────────────────────────────────────────────────────────────────

/** Wallet-group management endpoints (`client.walletGroups.*`). */
export interface WalletGroupsApi {
  /** List wallet groups for the authenticated user. */
  list(params?: ListWalletGroupsParams): Promise<WalletGroupRecord[]>
  /** Get a single group by ID. */
  get(groupId: string): Promise<WalletGroupRecord>
  /** Create an empty (or pre-populated) group. */
  create(params: CreateWalletGroupParams): Promise<WalletGroupRecord>
  /** Atomically create N fresh wallets and a new group containing them. Single transaction — no orphans on partial failure. */
  createWithWallets(params: CreateWalletGroupWithWalletsParams): Promise<WalletGroupRecord>
  /** Rename an existing group. */
  update(groupId: string, params: UpdateWalletGroupParams): Promise<WalletGroupRecord>
  /** Delete a group. Idempotent; member wallets are not affected. */
  delete(groupId: string): Promise<DeleteWalletGroupResponse>
  /** Add existing wallets to a group. */
  addWallets(groupId: string, params: AddWalletsToGroupParams): Promise<WalletGroupRecord>
  /** Remove wallets from a group. Wallets themselves stay; only membership is removed. */
  removeWallets(groupId: string, params: RemoveWalletsFromGroupParams): Promise<WalletGroupRecord>
  /** Reorder a group's wallets. Provided list must match current membership exactly. */
  reorderWallets(groupId: string, params: ReorderWalletsInGroupParams): Promise<WalletGroupRecord>
  /**
   * Move a wallet between groups (or detach from a group). Returns the
   * destination group's new state, or the source group's state if detaching.
   */
  moveWallet(walletId: string, params: MoveWalletParams): Promise<WalletGroupRecord>
}
