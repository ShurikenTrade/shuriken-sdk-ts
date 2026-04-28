// ─────────────────────────────────────────────────────────────────────────────
// Account domain types (mirrors shuriken-api /api/v2/account/* DTOs)
// ─────────────────────────────────────────────────────────────────────────────

/** Basic user profile. */
export interface AccountInfo {
  /** User ID. */
  userId: string
  /** Display name, or `null` if not set. */
  displayName: string | null
}

/** A wallet registered to the user's account. */
export interface AccountWallet {
  /** Shuriken wallet ID. */
  walletId: string
  /** On-chain wallet address. */
  address: string
  /** Chain the wallet is on, or `null` if multi-chain. */
  chain: string | null
  /** User-defined label, or `null`. */
  label: string | null
}

// ─── Settings ───────────────────────────────────────────────────────────

/** Solana-specific swap preset configuration. */
export interface SolanaSwapPreset {
  type: 'solana'
  /** Slippage tolerance in basis points. */
  slippageBps: number
  /** Whether MEV protection is enabled. */
  mevProtectionEnabled: boolean
  /** Custom priority fee in SOL, or `null` for default. */
  customPriorityFeeSol: string | null
  /** Jito bribe amount in SOL, or `null`. */
  bribeAmountSol: string | null
  /** Max acceptable price impact percentage, or `null`. */
  maxPriceImpactPct: number | null
}

/** EVM-specific swap preset configuration. */
export interface EvmSwapPreset {
  type: 'evm'
  /** Slippage tolerance in basis points. */
  slippageBps: number
  /** Whether MEV protection is enabled. */
  mevProtectionEnabled: boolean
  /** Max acceptable price impact percentage, or `null`. */
  maxPriceImpactPct: number | null
  /** Max priority fee per gas in gwei, or `null`. */
  maxPriorityFeePerGasGwei: string | null
  /** Bribe amount in native token, or `null`. */
  bribeAmountNative: string | null
}

/** A swap preset — either Solana or EVM specific. */
export type SwapPreset = SolanaSwapPreset | EvmSwapPreset

/** Buy/sell preset slots for a chain (auto, preset 1, preset 2). */
export interface ChainPresets {
  /** Default preset. */
  auto: SwapPreset
  /** User preset 1. */
  p1: SwapPreset
  /** User preset 2. */
  p2: SwapPreset
}

/**
 * In-settings reference to a wallet group. This is the legacy shape carried
 * inside `TradeSettings.walletGroups` and kept here for backwards compatibility.
 *
 * For first-class wallet-group CRUD use `client.walletGroups.*` and the
 * {@link WalletGroupRecord} type from `./wallet-groups.js` — that is the
 * canonical entity returned by the `/api/v2/wallet-groups/*` REST surface.
 */
export interface WalletGroup {
  /** Group ID. */
  id: string
  /** Group name. */
  name: string
  /** Wallet IDs in this group. */
  walletIds: string[]
  /** Network ID this group belongs to. */
  networkId: number
}

/** One-click trading mode settings for a network. */
export interface OneClickModeSettings {
  /** Whether one-click mode is enabled. */
  enabled: boolean
  /** Buy preset identifiers. */
  buyPresets: string[]
  /** Sell preset identifiers. */
  sellPresets: string[]
}

/** Default wallet selections per network. */
export interface DefaultWallets {
  /** Default wallet ID keyed by network ID. */
  defaultWalletByNetwork: Record<string, string>
  /** Selected wallet IDs keyed by network ID. */
  selectedWalletIdsByNetwork: Record<string, { walletIds: string[] }>
}

/** Trade settings including presets, wallets, and one-click mode. */
export interface TradeSettings {
  /** Auto-enable multisend for new wallets. */
  autoEnableMultisend: boolean
  /** Buy presets keyed by network ID. */
  chainPresetsBuy: Record<string, ChainPresets>
  /** Sell presets keyed by network ID. */
  chainPresetsSell: Record<string, ChainPresets>
  /** Default wallet selections. */
  defaultWallets: DefaultWallets
  /** One-click mode settings keyed by network ID. */
  oneClickMode: Record<string, OneClickModeSettings>
  /** Named wallet groups. */
  walletGroups: WalletGroup[]
}

/** Full account settings object. */
export interface AccountSettings {
  /** Trade-related settings. */
  tradeSettings: TradeSettings
}

// ─── Usage / Constraints ────────────────────────────────────────────────

/** Rate limits and permission constraints for an agent key. */
export interface AgentKeyConstraints {
  /** Whether buys are allowed. */
  buysEnabled: boolean
  /** Whether sells are allowed. */
  sellsEnabled: boolean
  /** Max swap executions per hour. */
  maxExecutionsPerHour: number
  /** Max swap executions per day. */
  maxExecutionsPerDay: number
  /** Max concurrent swap executions. */
  maxConcurrentExecutions: number
  /** Max limit/trigger orders per day. */
  maxLimitOrdersPerDay: number
  /** Whether custom gas settings are allowed. */
  allowCustomGas: boolean
  /** Whether bribes/tips are allowed. */
  allowBribes: boolean
  /** Network IDs this key can operate on. */
  allowedNetworks: number[]
  /** Wallet IDs this key can use (empty = all). */
  allowedWalletIds: string[]
  /** Max buy size per trade in USD, or `null` for unlimited. */
  maxBuyUsdPerTrade: number | null
  /** Max total buy volume per day in USD, or `null` for unlimited. */
  maxBuyUsdPerDay: number | null
  /** Max sell size per trade in USD, or `null` for unlimited. */
  maxSellUsdPerTrade: number | null
  /** Max total sell volume per day in USD, or `null` for unlimited. */
  maxSellUsdPerDay: number | null
  /** Max limit order size in USD, or `null` for unlimited. */
  maxLimitOrderUsdPerOrder: number | null
  /** Max slippage in basis points, or `null` for unlimited. */
  maxSlippageBps: number | null
  /** Max price impact percentage, or `null` for unlimited. */
  maxPriceImpactPct: number | null
  /** Max percentage of a position that can be sold, or `null` for unlimited. */
  maxSellPositionPct: number | null
}

/** Response from enabling multisend (durable nonce) on a wallet. */
export interface EnableMultisendResponse {
  /** Task ID for tracking the nonce initialization. */
  taskId: string
  /** Human-readable status message. */
  message: string
}

/** Agent key usage info and constraints. */
export interface AccountUsage {
  /** Agent key ID. */
  keyId: string
  /** Granted scopes (e.g. `trade:swap:execute`). */
  scopes: string[]
  /** Rate limits and permission constraints. */
  constraints: AgentKeyConstraints
}

// ─────────────────────────────────────────────────────────────────────────────
// Account namespace interface
// ─────────────────────────────────────────────────────────────────────────────

/** Account management endpoints (`client.account.*`). */
export interface AccountApi {
  /** Get the authenticated user's profile. */
  getMe(): Promise<AccountInfo>
  /** Get current trade settings. */
  getSettings(): Promise<AccountSettings>
  /** Update trade settings. Returns the updated settings. */
  updateSettings(settings: AccountSettings): Promise<AccountSettings>
  /** Get agent key usage info and constraints (agent keys only). */
  getUsage(): Promise<AccountUsage>
  /** List all wallets on the account. */
  getWallets(): Promise<AccountWallet[]>
  /** Enable multisend (durable nonce) on a Solana wallet. Returns a task ID for tracking. */
  enableMultisend(walletId: string): Promise<EnableMultisendResponse>
}
