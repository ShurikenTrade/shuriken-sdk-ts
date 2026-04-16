// ─────────────────────────────────────────────────────────────────────────────
// Swap domain types (mirrors shuriken-api /api/v2/swap/* DTOs)
// ─────────────────────────────────────────────────────────────────────────────

export interface SwapRoute {
  source: string
  inAmount: string | null
  outAmount: string | null
  feeMint: string | null
  poolFeeTier: string | null
}

export interface SwapFees {
  platformFeeAmount: string | null
  platformFeeBps: number | null
  dexFeeInNative: string | null
}

export interface SwapQuote {
  quoteId: string
  chain: string
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  slippageBps: number
  expiresAt: string
  priceImpactPct: string | null
  fees: SwapFees
  routes: SwapRoute[]
}

export interface SwapStatus {
  taskId: string
  status: 'submitted' | 'pending' | 'success' | 'failed'
  txHash: string | null
  errorCode: string | null
  errorMessage: string | null
}

export interface QuoteSummary {
  inputAmount: string
  outputAmount: string
  minOutputAmount: string
  slippageBps: number
  priceImpactPct: string | null
}

export interface EvmTransactionData {
  to: string
  data: string
  value: string
  gasLimit: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
}

export interface BuildTransactionResponse {
  quoteId: string
  chain: string
  chainId?: number
  transaction: string | EvmTransactionData
  approvalRequired?: boolean
  approvalTransaction?: EvmTransactionData | null
  expiresAt: string
  quoteSummary: QuoteSummary
}

export interface SubmitTransactionResponse {
  taskId: string
  txHash: string
  status: string
}

export interface ApproveSpenderResponse {
  chainId: number
  spenderAddress: string
}

export interface ApproveAllowanceResponse {
  chainId: number
  tokenAddress: string
  walletAddress: string
  allowance: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Request parameter types
// ─────────────────────────────────────────────────────────────────────────────

export interface GetSwapQuoteParams {
  chain: string
  inputMint: string
  outputMint: string
  amount: string
  slippageBps?: number
}

export interface ExecuteSwapParams {
  chain: string
  inputMint: string
  outputMint: string
  amount: string
  walletId: string
  slippageBps?: number
}

export interface BuildTransactionParams {
  chain: string
  inputMint: string
  outputMint: string
  amount: string
  walletAddress: string
  slippageBps?: number
}

export interface SubmitTransactionParams {
  chain: string
  signedTransaction: string
  walletAddress: string
  quoteId?: string
}

export interface GetApproveAllowanceParams {
  chainId: number
  tokenAddress: string
  walletAddress: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Swap namespace interface
// ─────────────────────────────────────────────────────────────────────────────

export interface SwapApi {
  getQuote(params: GetSwapQuoteParams): Promise<SwapQuote>
  execute(params: ExecuteSwapParams): Promise<SwapStatus>
  buildTransaction(params: BuildTransactionParams): Promise<BuildTransactionResponse>
  submitTransaction(params: SubmitTransactionParams): Promise<SubmitTransactionResponse>
  getStatus(taskId: string): Promise<SwapStatus>
  getApproveSpender(chainId: number): Promise<ApproveSpenderResponse>
  getApproveAllowance(params: GetApproveAllowanceParams): Promise<ApproveAllowanceResponse>
}
