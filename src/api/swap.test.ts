import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createShurikenClient } from '../client.js'
import { ShurikenApiError, ShurikenAuthError } from '../errors.js'

const BASE_URL = 'https://api.test.shuriken.trade'
const API_KEY = 'sk_test_key'

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  })
}

function createClient() {
  return createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY })
}

describe('swap', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = mockFetch(200, {})
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── getQuote ─────────────────────────────────────────────────────────

  describe('getQuote', () => {
    const quote = {
      quoteId: 'q_123',
      chain: 'solana',
      inputMint: 'So111...',
      outputMint: 'EPjF...',
      inAmount: '1000000000',
      outAmount: '5000000',
      slippageBps: 100,
      expiresAt: '2026-04-16T12:00:00Z',
      priceImpactPct: '0.12',
      fees: { platformFeeAmount: null, platformFeeBps: null, dexFeeInNative: null },
      routes: [
        {
          source: 'Raydium CLMM',
          inAmount: '1000000000',
          outAmount: '5000000',
          feeMint: null,
          poolFeeTier: null,
        },
      ],
    }

    it('returns quote data', async () => {
      fetchSpy = mockFetch(200, { data: quote })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().swap.getQuote({
        chain: 'solana',
        inputMint: 'So111...',
        outputMint: 'EPjF...',
        amount: '1000000000',
      })
      expect(result).toEqual(quote)
    })

    it('builds query string with all params', async () => {
      fetchSpy = mockFetch(200, { data: quote })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().swap.getQuote({
        chain: 'solana',
        inputMint: 'So111...',
        outputMint: 'EPjF...',
        amount: '1000000000',
        slippageBps: 50,
      })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('/api/v2/swap/quote?')
      expect(url).toContain('chain=solana')
      expect(url).toContain('inputMint=So111...')
      expect(url).toContain('outputMint=EPjF...')
      expect(url).toContain('amount=1000000000')
      expect(url).toContain('slippageBps=50')
    })

    it('omits slippageBps when not provided', async () => {
      fetchSpy = mockFetch(200, { data: quote })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().swap.getQuote({
        chain: 'solana',
        inputMint: 'So111...',
        outputMint: 'EPjF...',
        amount: '1000000000',
      })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).not.toContain('slippageBps')
    })
  })

  // ─── execute ──────────────────────────────────────────────────────────

  describe('execute', () => {
    const swapStatus = {
      taskId: 't_abc',
      status: 'submitted',
      txHash: null,
      errorCode: null,
      errorMessage: null,
    }

    it('posts execute params and returns swap status', async () => {
      fetchSpy = mockFetch(200, { data: swapStatus })
      vi.stubGlobal('fetch', fetchSpy)

      const params = {
        chain: 'solana',
        inputMint: 'So111...',
        outputMint: 'EPjF...',
        amount: '1000000000',
        walletId: 'w_123',
        slippageBps: 100,
      }
      const result = await createClient().swap.execute(params)
      expect(result).toEqual(swapStatus)

      const [, init] = fetchSpy.mock.calls[0]
      expect(init.method).toBe('POST')
      expect(JSON.parse(init.body)).toEqual(params)
    })
  })

  // ─── buildTransaction ─────────────────────────────────────────────────

  describe('buildTransaction', () => {
    const txResponse = {
      quoteId: 'q_123',
      chain: 'solana',
      transaction: 'base64encodedtx...',
      expiresAt: '2026-04-16T12:00:00Z',
      quoteSummary: {
        inputAmount: '1000000000',
        outputAmount: '5000000',
        minOutputAmount: '4950000',
        slippageBps: 100,
        priceImpactPct: '0.12',
      },
    }

    it('posts build params and returns transaction response', async () => {
      fetchSpy = mockFetch(200, { data: txResponse })
      vi.stubGlobal('fetch', fetchSpy)

      const params = {
        chain: 'solana',
        inputMint: 'So111...',
        outputMint: 'EPjF...',
        amount: '1000000000',
        walletAddress: '7xKX...',
      }
      const result = await createClient().swap.buildTransaction(params)
      expect(result).toEqual(txResponse)

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/swap/transaction`)
      expect(init.method).toBe('POST')
    })
  })

  // ─── submitTransaction ────────────────────────────────────────────────

  describe('submitTransaction', () => {
    const submitResponse = { taskId: 't_abc', txHash: '5xyz...', status: 'submitted' }

    it('posts signed transaction and returns response', async () => {
      fetchSpy = mockFetch(200, { data: submitResponse })
      vi.stubGlobal('fetch', fetchSpy)

      const params = {
        chain: 'solana',
        signedTransaction: 'base64signed...',
        walletAddress: '7xKX...',
        quoteId: 'q_123',
      }
      const result = await createClient().swap.submitTransaction(params)
      expect(result).toEqual(submitResponse)

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/swap/submit`)
      expect(JSON.parse(init.body)).toEqual(params)
    })
  })

  // ─── getStatus ────────────────────────────────────────────────────────

  describe('getStatus', () => {
    const status = {
      taskId: 't_abc',
      status: 'success',
      txHash: '5xyz...',
      errorCode: null,
      errorMessage: null,
    }

    it('returns swap status by taskId', async () => {
      fetchSpy = mockFetch(200, { data: status })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().swap.getStatus('t_abc')
      expect(result).toEqual(status)

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/swap/status/t_abc`)
    })
  })

  // ─── getApproveSpender ────────────────────────────────────────────────

  describe('getApproveSpender', () => {
    const spender = { chainId: 8453, spenderAddress: '0xrouter...' }

    it('returns spender address for chain', async () => {
      fetchSpy = mockFetch(200, { data: spender })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().swap.getApproveSpender(8453)
      expect(result).toEqual(spender)

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('/api/v2/swap/approve/spender?')
      expect(url).toContain('chainId=8453')
    })
  })

  // ─── getApproveAllowance ──────────────────────────────────────────────

  describe('getApproveAllowance', () => {
    const allowance = {
      chainId: 8453,
      tokenAddress: '0xtoken...',
      walletAddress: '0xwallet...',
      allowance: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    }

    it('returns allowance data', async () => {
      fetchSpy = mockFetch(200, { data: allowance })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().swap.getApproveAllowance({
        chainId: 8453,
        tokenAddress: '0xtoken...',
        walletAddress: '0xwallet...',
      })
      expect(result).toEqual(allowance)

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('/api/v2/swap/approve/allowance?')
      expect(url).toContain('chainId=8453')
      expect(url).toContain('tokenAddress=0xtoken...')
      expect(url).toContain('walletAddress=0xwallet...')
    })
  })

  // ─── Error handling ───────────────────────────────────────────────────

  describe('error handling', () => {
    it('throws ShurikenAuthError on 401', async () => {
      fetchSpy = mockFetch(401, { error: 'unauthorized' })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(
        createClient().swap.getQuote({
          chain: 'solana',
          inputMint: 'So111...',
          outputMint: 'EPjF...',
          amount: '1000000000',
        })
      ).rejects.toThrow(ShurikenAuthError)
    })

    it('throws ShurikenApiError on 400', async () => {
      fetchSpy = mockFetch(400, { error: 'invalid params' })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(
        createClient().swap.execute({
          chain: 'solana',
          inputMint: 'So111...',
          outputMint: 'EPjF...',
          amount: '1000000000',
          walletId: 'w_123',
        })
      ).rejects.toThrow(ShurikenApiError)
      await expect(
        createClient().swap.execute({
          chain: 'solana',
          inputMint: 'So111...',
          outputMint: 'EPjF...',
          amount: '1000000000',
          walletId: 'w_123',
        })
      ).rejects.toMatchObject({ status: 400 })
    })
  })
})
