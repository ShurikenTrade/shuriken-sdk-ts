import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createShurikenClient } from '../client.js'
import { ShurikenAuthError } from '../errors.js'

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

describe('portfolio', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = mockFetch(200, {})
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── getBalances ──────────────────────────────────────────────────────

  describe('getBalances', () => {
    const wallets = [
      {
        chain: 'solana',
        walletAddress: '7xKX...',
        nativeBalance: '1500000000',
        nativeBalanceUsd: 225.5,
        nativeSymbol: 'SOL',
      },
    ]

    it('returns wallet balances array', async () => {
      fetchSpy = mockFetch(200, { data: { wallets } })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().portfolio.getBalances()
      expect(result).toEqual(wallets)
    })

    it('passes chain filter as query param', async () => {
      fetchSpy = mockFetch(200, { data: { wallets: [] } })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().portfolio.getBalances({ chain: 'solana' })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('/api/v2/portfolio/balances?')
      expect(url).toContain('chain=solana')
    })

    it('works without params', async () => {
      fetchSpy = mockFetch(200, { data: { wallets: [] } })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().portfolio.getBalances()

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/portfolio/balances`)
    })
  })

  // ─── getHistory ───────────────────────────────────────────────────────

  describe('getHistory', () => {
    const trades = [
      {
        chain: 'solana',
        txHash: '5abc...',
        timestamp: 1713200000,
        walletAddress: '7xKX...',
        inputToken: 'So111...',
        inputAmount: '1000000000',
        outputToken: 'EPjF...',
        outputAmount: '5000000',
        token: 'EPjF...',
        sizeUsd: '150.00',
        priceUsd: '0.00003',
        isBuy: true,
      },
    ]

    it('returns trades array', async () => {
      fetchSpy = mockFetch(200, { data: { trades } })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().portfolio.getHistory()
      expect(result).toEqual(trades)
    })

    it('passes all query params', async () => {
      fetchSpy = mockFetch(200, { data: { trades: [] } })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().portfolio.getHistory({ chain: 'base', page: 2, limit: 50 })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('chain=base')
      expect(url).toContain('page=2')
      expect(url).toContain('limit=50')
    })
  })

  // ─── getPnl ───────────────────────────────────────────────────────────

  describe('getPnl', () => {
    const pnl = {
      totalValueUsd: 10000,
      totalBoughtUsd: 8000,
      totalSoldUsd: 5000,
      totalPnlUsd: 2000,
      totalRealizedPnlUsd: 1500,
      totalUnrealizedPnlUsd: 500,
      positionCount: 12,
      portfolioHistory: [{ timestamp: 1713200000, valueUsd: 9500 }],
    }

    it('returns pnl data', async () => {
      fetchSpy = mockFetch(200, { data: pnl })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().portfolio.getPnl()
      expect(result).toEqual(pnl)
    })

    it('passes timeframe param', async () => {
      fetchSpy = mockFetch(200, { data: pnl })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().portfolio.getPnl({ timeframe: '7d' })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('timeframe=7d')
    })
  })

  // ─── getPositions ─────────────────────────────────────────────────────

  describe('getPositions', () => {
    const positions = {
      positions: [
        {
          walletAddress: '7xKX...',
          tokenAddress: 'EPjF...',
          latestBalanceRaw: '5000000',
          latestTokenUsdPrice: 0.00003,
          tokenDecimal: 6,
          boughtUsd: 150,
          soldUsd: 50,
          boughtNative: 1.0,
          soldNative: 0.33,
          buyCount: 3,
          sellCount: 1,
          balanceUsd: 100,
          balanceNative: 0.67,
          realisedPnlPct: -10,
          totalPnlPct: 5,
          network: 'solana',
        },
      ],
      totalValueUsd: 100,
      positionCount: 1,
    }

    it('returns positions response', async () => {
      fetchSpy = mockFetch(200, { data: positions })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().portfolio.getPositions()
      expect(result).toEqual(positions)
    })

    it('passes chain and status filters', async () => {
      fetchSpy = mockFetch(200, { data: positions })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().portfolio.getPositions({ chain: 'solana', status: 'open' })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('chain=solana')
      expect(url).toContain('status=open')
    })
  })

  // ─── Error handling ───────────────────────────────────────────────────

  describe('error handling', () => {
    it('throws ShurikenAuthError on 401', async () => {
      fetchSpy = mockFetch(401, { error: 'unauthorized' })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(createClient().portfolio.getBalances()).rejects.toThrow(ShurikenAuthError)
    })
  })
})
