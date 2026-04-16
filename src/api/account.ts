// ─────────────────────────────────────────────────────────────────────────────
// Account domain types (mirrors shuriken-api /api/v2/account/* DTOs)
// ─────────────────────────────────────────────────────────────────────────────

export interface AccountInfo {
  userId: string
  displayName: string | null
}

export interface AccountWallet {
  walletId: string
  address: string
  chain: string | null
  label: string | null
}

// ─── Settings ───────────────────────────────────────────────────────────

export interface SolanaSwapPreset {
  type: 'solana'
  slippageBps: number
  mevProtectionEnabled: boolean
  customPriorityFeeSol: string | null
  bribeAmountSol: string | null
  maxPriceImpactPct: number | null
}

export interface EvmSwapPreset {
  type: 'evm'
  slippageBps: number
  mevProtectionEnabled: boolean
  maxPriceImpactPct: number | null
  maxPriorityFeePerGasGwei: string | null
  bribeAmountNative: string | null
}

export type SwapPreset = SolanaSwapPreset | EvmSwapPreset

export interface ChainPresets {
  auto: SwapPreset
  p1: SwapPreset
  p2: SwapPreset
}

export interface WalletGroup {
  id: string
  name: string
  walletIds: string[]
  networkId: number
}

export interface OneClickModeSettings {
  enabled: boolean
  buyPresets: string[]
  sellPresets: string[]
}

export interface DefaultWallets {
  defaultWalletByNetwork: Record<string, string>
  selectedWalletIdsByNetwork: Record<string, { walletIds: string[] }>
}

export interface TradeSettings {
  autoEnableMultisend: boolean
  chainPresetsBuy: Record<string, ChainPresets>
  chainPresetsSell: Record<string, ChainPresets>
  defaultWallets: DefaultWallets
  oneClickMode: Record<string, OneClickModeSettings>
  walletGroups: WalletGroup[]
}

export interface AccountSettings {
  tradeSettings: TradeSettings
}

// ─── Usage / Constraints ────────────────────────────────────────────────

export interface AgentKeyConstraints {
  buysEnabled: boolean
  sellsEnabled: boolean
  maxExecutionsPerHour: number
  maxExecutionsPerDay: number
  maxConcurrentExecutions: number
  maxLimitOrdersPerDay: number
  allowCustomGas: boolean
  allowBribes: boolean
  allowedNetworks: number[]
  allowedWalletIds: string[]
  maxBuyUsdPerTrade: number | null
  maxBuyUsdPerDay: number | null
  maxSellUsdPerTrade: number | null
  maxSellUsdPerDay: number | null
  maxLimitOrderUsdPerOrder: number | null
  maxSlippageBps: number | null
  maxPriceImpactPct: number | null
  maxSellPositionPct: number | null
}

export interface AccountUsage {
  keyId: string
  scopes: string[]
  constraints: AgentKeyConstraints
}

// ─────────────────────────────────────────────────────────────────────────────
// Account namespace interface
// ─────────────────────────────────────────────────────────────────────────────

export interface AccountApi {
  getMe(): Promise<AccountInfo>
  getSettings(): Promise<AccountSettings>
  updateSettings(settings: AccountSettings): Promise<AccountSettings>
  getUsage(): Promise<AccountUsage>
  getWallets(): Promise<AccountWallet[]>
}
