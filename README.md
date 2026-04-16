# @shuriken-trade/sdk

TypeScript SDK for the [Shuriken](https://app.shuriken.trade) API.

> **Status:** Early development — API surface may change.

## Install

```bash
npm install @shuriken-trade/sdk
```

## Quick start

```typescript
import { createShurikenClient } from '@shuriken-trade/sdk'

const client = createShurikenClient({
  apiBaseUrl: 'https://api.shuriken.trade',
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

## WebSocket streams

| Stream | Filter | Description |
|--------|--------|-------------|
| `svm.token.swaps` | `tokenAddress` | Solana token swap events |
| `svm.token.poolInfo` | `tokenAddress` | Solana token/pool info updates |
| `svm.wallet.nativeBalance` | `walletAddress` | SOL balance changes |
| `svm.wallet.tokenBalance` | `tokenAddress` | SPL token balance changes |
| `svm.token.distributionStats` | `tokenAddress` | Token distribution analytics |
| `svm.token.holderStats` | `tokenAddress` | Holder count analytics |
| `svm.bondingCurve.creations` | — | New bonding curve tokens |
| `svm.bondingCurve.graduations` | — | Bonding curve graduations |
| `evm.token.swaps` | `chainId`, `tokenAddress` | EVM token swap events |
| `evm.token.poolInfo` | `chainId`, `tokenAddress` | EVM token/pool info updates |
| `alpha.signalFeedGlobal` | — | Global signal feed |

## Authentication

Get an API key from the [Shuriken Agents dashboard](https://app.shuriken.trade/agents). The SDK uses agent keys (`sk_...`) for authentication.

## License

MIT
