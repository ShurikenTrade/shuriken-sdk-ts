# @shuriken/sdk

[![npm](https://img.shields.io/npm/v/@shuriken/sdk)](https://www.npmjs.com/package/@shuriken/sdk)

TypeScript SDK for the [Shuriken](https://app.shuriken.trade) API.

> **Status:** Early development — API surface may change.

## Install

```bash
npm install @shuriken/sdk
```

## Quick start

```typescript
import { createShurikenClient } from '@shuriken/sdk'

const client = createShurikenClient({
  apiKey: process.env.SHURIKEN_API_KEY!,
})

// HTTP — works immediately, no connection step
const token = await client.tokens.get('solana:So11111111111111111111111111111111111111112')
console.log(token.name, token.symbol)

// WebSocket — call connect() first, then subscribe to streams
await client.ws.connect()

client.ws.subscribe('svm.token.swaps', { tokenAddress: 'So1111...' }, (event) => {
  console.log('Swap:', event.priceUsd, event.sizeSol)
})
```

## Tokens

```typescript
// Search tokens
const results = await client.tokens.search({ q: 'bonk', chain: 'solana' })

// Get token metadata
const token = await client.tokens.get('solana:So111...')

// Batch lookup (up to 100)
const batch = await client.tokens.batch({ tokens: ['solana:So111...', 'solana:EPjF...'] })

// Price
const price = await client.tokens.getPrice('solana:So111...')

// OHLCV chart data
const chart = await client.tokens.getChart({
  tokenId: 'solana:So111...',
  resolution: '1h',
  count: 50,
})

// Trading stats (volume, txns, unique traders, price change)
const stats = await client.tokens.getStats('solana:So111...')

// Liquidity pools
const pools = await client.tokens.getPools('solana:So111...')
```

## Swap

```typescript
// Get a quote
const quote = await client.swap.getQuote({
  chain: 'solana',
  inputMint: 'So11111111111111111111111111111111111111112',
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  amount: '1000000000', // in base units (lamports)
  slippageBps: 100,
})

// Managed execution (Shuriken signs & submits)
const status = await client.swap.execute({
  chain: 'solana',
  inputMint: 'So111...',
  outputMint: 'EPjF...',
  amount: '1000000000',
  walletId: 'w_123',
})

// Build unsigned transaction (for self-signing)
const tx = await client.swap.buildTransaction({
  chain: 'solana',
  inputMint: 'So111...',
  outputMint: 'EPjF...',
  amount: '1000000000',
  walletAddress: '7xKX...',
})

// Submit a signed transaction
const submitted = await client.swap.submitTransaction({
  chain: 'solana',
  signedTransaction: 'base64...',
  walletAddress: '7xKX...',
})

// Poll execution status
const result = await client.swap.getStatus('task_id')

// EVM approval helpers
const spender = await client.swap.getApproveSpender(8453) // Base
const allowance = await client.swap.getApproveAllowance({
  chainId: 8453,
  tokenAddress: '0xtoken...',
  walletAddress: '0xwallet...',
})
```

## Portfolio

```typescript
// Cross-chain balances
const balances = await client.portfolio.getBalances({ chain: 'solana' })

// Trade history
const trades = await client.portfolio.getHistory({ chain: 'solana', limit: 50 })

// PnL summary
const pnl = await client.portfolio.getPnl({ timeframe: '7d' })

// Open positions with PnL
const positions = await client.portfolio.getPositions({ chain: 'solana' })
```

## Account

```typescript
// User profile
const me = await client.account.getMe()

// Wallets
const wallets = await client.account.getWallets()

// Agent key usage and constraints
const usage = await client.account.getUsage()

// Trade settings
const settings = await client.account.getSettings()
await client.account.updateSettings(settings)
```

## Trigger orders

```typescript
// Create a trigger order
const order = await client.trigger.create({
  chain: 'solana',
  inputToken: 'So111...',
  outputToken: 'EPjF...',
  amount: '1000000000',
  walletId: 'w_123',
  triggerMetric: 'price_usd',
  triggerDirection: 'above',
  triggerValue: '0.001',
})

// List orders (cursor-paginated)
const orders = await client.trigger.list({ limit: 50 })

// Get order details
const detail = await client.trigger.get('order_id')

// Cancel
await client.trigger.cancel('order_id')
```

## Perps

```typescript
// Markets
const markets = await client.perps.getMarkets()
const btc = await client.perps.getMarket('BTC')

// Account state
const account = await client.perps.getAccount()
const fees = await client.perps.getFees()

// Positions & orders
const positions = await client.perps.getPositions()
const openOrders = await client.perps.getOrders({ coin: 'BTC' })

// Place an order
const result = await client.perps.placeOrder({
  walletId: 'w_123',
  coin: 'BTC',
  isBuy: true,
  sz: '0.1',
  limitPx: '60000',
  orderType: 'limit',
})

// Modify / cancel
await client.perps.modifyOrder({ walletId: 'w_123', coin: 'BTC', isBuy: true, sz: '0.2', limitPx: '61000', oid: 456, orderType: 'limit' })
await client.perps.cancelOrder({ walletId: 'w_123', coin: 'BTC', oid: 456 })

// Batch modify
await client.perps.batchModifyOrders({
  walletId: 'w_123',
  modifications: [
    { coin: 'BTC', isBuy: true, sz: '0.2', limitPx: '61000', oid: 456, orderType: 'limit' },
  ],
})

// Close position / adjust margin / update leverage
await client.perps.closePosition({ walletId: 'w_123', coin: 'BTC', percentage: 100 })
await client.perps.updateMargin({ walletId: 'w_123', coin: 'BTC', amount: '500' })
await client.perps.updateLeverage({ walletId: 'w_123', coin: 'BTC', leverage: 20, isCross: true })

// History
const fills = await client.perps.getFills({ startTime: Date.now() - 86400000 })
const funding = await client.perps.getFunding({ startTime: Date.now() - 86400000 })
```

## WebSocket streams

| Stream | Filter | Description |
|--------|--------|-------------|
| `svm.token.swaps` | `tokenAddress` | Solana token swap events |
| `svm.token.poolInfo` | `tokenAddress` | Solana token/pool info updates |
| `svm.token.balances` | `tokenAddress` | Token holder balance changes |
| `svm.token.distributionStats` | `tokenAddress` | Token distribution analytics |
| `svm.token.holderStats` | `tokenAddress` | Holder count analytics |
| `svm.wallet.nativeBalance` | `walletAddress` | SOL balance changes |
| `svm.wallet.tokenBalances` | `walletAddress` | SPL token balance changes |
| `svm.bondingCurve.creations` | — | New bonding curve tokens |
| `svm.bondingCurve.graduations` | — | Bonding curve graduations |
| `evm.token.swaps` | `chainId`, `tokenAddress` | EVM token swap events |
| `evm.token.poolInfo` | `chainId`, `tokenAddress` | EVM token/pool info updates |
| `evm.token.balances` | `tokenAddress` | EVM token holder balance changes |
| `evm.wallet.nativeBalance` | `walletAddress` | Native balance changes (ETH/BNB) |
| `evm.wallet.tokenBalances` | `walletAddress` | ERC-20 token balance changes |

## Authentication

Get an API key from the [Shuriken Agents dashboard](https://app.shuriken.trade/agents). The SDK uses agent keys (`sk_...`) for authentication.

## License

MIT
