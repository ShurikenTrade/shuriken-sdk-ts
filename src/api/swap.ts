// ─────────────────────────────────────────────────────────────────────────────
// Swap domain types (mirrors shuriken-api /api/v2/swap/* DTOs)
// ─────────────────────────────────────────────────────────────────────────────

/** A single routing leg within a swap quote. */
export interface SwapRoute {
  /** DEX source (e.g. `Raydium CLMM`, `Uniswap V3`, `Jupiter Ultra`). */
  source: string
  /** Input amount for this leg. */
  inAmount: string | null
  /** Output amount for this leg. */
  outAmount: string | null
  /** Fee token address. */
  feeMint: string | null
  /** Pool fee tier (e.g. `3000` = 0.3%). */
  poolFeeTier: string | null
}

/** Fee breakdown for a swap quote. */
export interface SwapFees {
  /** Platform fee amount. */
  platformFeeAmount: string | null
  /** Platform fee in basis points. */
  platformFeeBps: number | null
  /** DEX fee in native token. */
  dexFeeInNative: string | null
}

/** A swap quote returned by {@link SwapApi.getQuote}. */
export interface SwapQuote {
  /** Unique quote identifier. */
  quoteId: string
  /** Chain: `solana`, `base`, `bsc`. */
  chain: string
  /** Token address being sold. */
  inputMint: string
  /** Token address being bought. */
  outputMint: string
  /** Input amount in base units. */
  inAmount: string
  /** Expected output amount in base units. */
  outAmount: string
  /** Slippage tolerance in basis points. */
  slippageBps: number
  /** ISO 8601 expiry timestamp. */
  expiresAt: string
  /** Estimated price impact as a percentage, or `null`. */
  priceImpactPct: string | null
  /** Fee breakdown. */
  fees: SwapFees
  /** Routing legs. */
  routes: SwapRoute[]
}

/** Execution status of a swap task. */
export interface SwapStatus {
  /** Task identifier (use with {@link TasksApi.getStatus}). */
  taskId: string
  /** Current status. */
  status: 'submitted' | 'pending' | 'success' | 'failed'
  /** On-chain transaction hash, once available. */
  txHash: string | null
  /** Error code if the swap failed. */
  errorCode: string | null
  /** Human-readable error message if the swap failed. */
  errorMessage: string | null
}

/** Summary of the quoted swap within a built transaction. */
export interface QuoteSummary {
  /** Input amount in base units. */
  inputAmount: string
  /** Expected output amount in base units. */
  outputAmount: string
  /** Minimum output after slippage. */
  minOutputAmount: string
  /** Slippage tolerance in basis points. */
  slippageBps: number
  /** Estimated price impact as a percentage. */
  priceImpactPct: string | null
}

/** EVM transaction fields for signing. */
export interface EvmTransactionData {
  /** Contract address. */
  to: string
  /** Calldata. */
  data: string
  /** Native value (wei). */
  value: string
  /** Gas limit. */
  gasLimit: string
  /** EIP-1559 max fee per gas (wei). */
  maxFeePerGas: string
  /** EIP-1559 max priority fee per gas (wei). */
  maxPriorityFeePerGas: string
}

/**
 * Response from {@link SwapApi.buildTransaction}.
 *
 * `transaction` is a base64 string for SVM or an {@link EvmTransactionData} object for EVM.
 */
export interface BuildTransactionResponse {
  /** Quote ID for correlation. */
  quoteId: string
  /** Chain identifier. */
  chain: string
  /** EVM chain ID (only present for EVM chains). */
  chainId?: number
  /** Unsigned transaction — base64 (SVM) or {@link EvmTransactionData} (EVM). */
  transaction: string | EvmTransactionData
  /** Whether an ERC-20 approval is needed before the swap (EVM only). */
  approvalRequired?: boolean
  /** Pre-built approval transaction if needed (EVM only). */
  approvalTransaction?: EvmTransactionData | null
  /** ISO 8601 expiry timestamp. */
  expiresAt: string
  /** Quote summary with amounts and slippage. */
  quoteSummary: QuoteSummary
}

/** Response from {@link SwapApi.submitTransaction}. */
export interface SubmitTransactionResponse {
  /** Task identifier for polling status. */
  taskId: string
  /** On-chain transaction hash. */
  txHash: string
  /** Initial status. */
  status: string
}

/** Response from {@link SwapApi.getApproveSpender}. */
export interface ApproveSpenderResponse {
  /** EVM chain ID. */
  chainId: number
  /** Router contract address to approve. */
  spenderAddress: string
}

/** Response from {@link SwapApi.getApproveAllowance}. */
export interface ApproveAllowanceResponse {
  /** EVM chain ID. */
  chainId: number
  /** ERC-20 token address. */
  tokenAddress: string
  /** Wallet address. */
  walletAddress: string
  /** Current allowance (raw integer string). */
  allowance: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Request parameter types
// ─────────────────────────────────────────────────────────────────────────────

/** Parameters for {@link SwapApi.getQuote}. */
export interface GetSwapQuoteParams {
  /** Chain: `solana`, `base`, `bsc`. */
  chain: string
  /** Token address to sell. */
  inputMint: string
  /** Token address to buy. */
  outputMint: string
  /** Amount in base units (e.g. lamports, wei). */
  amount: string
  /** Slippage tolerance in basis points (default: 100 = 1%). */
  slippageBps?: number
}

/** Parameters for {@link SwapApi.execute}. */
export interface ExecuteSwapParams {
  /** Chain: `solana`, `base`, `bsc`. */
  chain: string
  /** Token address to sell. */
  inputMint: string
  /** Token address to buy. */
  outputMint: string
  /** Amount in base units. */
  amount: string
  /** Shuriken wallet ID to use for the swap. */
  walletId: string
  /** Slippage tolerance in basis points (default: 100 = 1%). */
  slippageBps?: number
}

/** Parameters for {@link SwapApi.buildTransaction}. */
export interface BuildTransactionParams {
  /** Chain: `solana`, `base`, `bsc`. */
  chain: string
  /** Token address to sell. */
  inputMint: string
  /** Token address to buy. */
  outputMint: string
  /** Amount in base units. */
  amount: string
  /** Your own wallet address (not a Shuriken wallet ID). */
  walletAddress: string
  /** Slippage tolerance in basis points (default: 100 = 1%). */
  slippageBps?: number
}

/** Parameters for {@link SwapApi.submitTransaction}. */
export interface SubmitTransactionParams {
  /** Chain: `solana`, `base`, `bsc`. */
  chain: string
  /** Signed transaction — base64 (SVM) or hex-encoded RLP (EVM). */
  signedTransaction: string
  /** Wallet address for task tracking attribution. */
  walletAddress: string
  /** Optional quote ID for correlation with a previous {@link SwapApi.getQuote} call. */
  quoteId?: string
}

/** Parameters for {@link SwapApi.getApproveAllowance}. */
export interface GetApproveAllowanceParams {
  /** EVM chain ID (e.g. 8453 for Base, 56 for BSC). */
  chainId: number
  /** ERC-20 token contract address. */
  tokenAddress: string
  /** Wallet address to check allowance for. */
  walletAddress: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Swap namespace interface
// ─────────────────────────────────────────────────────────────────────────────

/** Swap execution endpoints (`client.swap.*`). */
export interface SwapApi {
  /** Get a swap quote (read-only, cacheable). */
  getQuote(params: GetSwapQuoteParams): Promise<SwapQuote>
  /** Execute a swap using a Shuriken managed wallet (signs and submits for you). */
  execute(params: ExecuteSwapParams): Promise<SwapStatus>
  /** Build an unsigned transaction for self-signing. */
  buildTransaction(params: BuildTransactionParams): Promise<BuildTransactionResponse>
  /** Submit a signed transaction for execution and monitoring. */
  submitTransaction(params: SubmitTransactionParams): Promise<SubmitTransactionResponse>
  /** Get the router contract address to approve for EVM swaps. */
  getApproveSpender(chainId: number): Promise<ApproveSpenderResponse>
  /** Check the current ERC-20 allowance for the swap router (EVM only). */
  getApproveAllowance(params: GetApproveAllowanceParams): Promise<ApproveAllowanceResponse>
}
