# @shuriken-trade/sdk

TypeScript SDK for the [Shuriken](https://shuriken.trade) API.

> **Status:** Early development — API surface may change.

## Install

```bash
npm install @shuriken-trade/sdk
```

## Quick start

```typescript
import { createShurikenClient } from '@shuriken-trade/sdk'

const client = createShurikenClient({
  apiKey: process.env.SHURIKEN_API_KEY!,
})

await client.ws.connect()

client.ws.subscribe('svm.token.swaps', { tokenAddress: 'So1111...' }, (event) => {
  console.log('Swap:', event.priceUsd, event.sizeSol)
})
```

## Available streams

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

Get an API key from your [Shuriken dashboard](https://shuriken.trade). The SDK uses agent keys (`sk_...`) for authentication.

## License

MIT
