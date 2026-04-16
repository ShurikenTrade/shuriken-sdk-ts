import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createShurikenClient } from '../client.js'
import { ShurikenApiError, ShurikenAuthError } from '../errors.js'

const BASE_URL = 'https://api.test.shuriken.trade'
const API_KEY = 'sk_test_key'
const TOKEN_ID = 'solana:So11111111111111111111111111111111111111112'

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

describe('tokens', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = mockFetch(200, {})
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── Auth header ────────────────────────────────────────────────────

  it('sends Authorization header on every request', async () => {
    const tokenInfo = {
      tokenId: TOKEN_ID,
      chain: 'solana',
      address: 'So111...',
      name: 'SOL',
      symbol: 'SOL',
      decimals: 9,
    }
    fetchSpy = mockFetch(200, { data: tokenInfo })
    vi.stubGlobal('fetch', fetchSpy)

    const client = createClient()
    await client.tokens.get(TOKEN_ID)

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [, init] = fetchSpy.mock.calls[0]
    expect(init.headers.Authorization).toBe(`Bearer ${API_KEY}`)
  })

  // ─── get ────────────────────────────────────────────────────────────

  describe('get', () => {
    const tokenInfo = {
      tokenId: TOKEN_ID,
      chain: 'solana',
      address: 'So111...',
      name: 'Wrapped SOL',
      symbol: 'SOL',
      decimals: 9,
    }

    it('returns token info', async () => {
      fetchSpy = mockFetch(200, { data: tokenInfo })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().tokens.get(TOKEN_ID)
      expect(result).toEqual(tokenInfo)
    })

    it('encodes tokenId in the URL', async () => {
      fetchSpy = mockFetch(200, { data: tokenInfo })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().tokens.get(TOKEN_ID)

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/tokens/${encodeURIComponent(TOKEN_ID)}`)
    })

    it('throws ShurikenApiError on 404', async () => {
      fetchSpy = mockFetch(404, { error: 'not found' })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(createClient().tokens.get(TOKEN_ID)).rejects.toThrow(ShurikenApiError)
      await expect(createClient().tokens.get(TOKEN_ID)).rejects.toMatchObject({ status: 404 })
    })
  })

  // ─── search ─────────────────────────────────────────────────────────

  describe('search', () => {
    const tokens = [
      {
        tokenId: 'solana:bonk',
        chain: 'solana',
        address: 'bonk',
        name: 'Bonk',
        symbol: 'BONK',
        decimals: 5,
      },
    ]

    it('returns token array from wrapped response', async () => {
      fetchSpy = mockFetch(200, { data: { tokens } })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().tokens.search({ q: 'bonk' })
      expect(result).toEqual(tokens)
    })

    it('builds query string with all params', async () => {
      fetchSpy = mockFetch(200, { data: { tokens: [] } })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().tokens.search({ q: 'bonk', chain: 'solana', page: 2, limit: 10 })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('/api/v2/tokens/search?')
      expect(url).toContain('q=bonk')
      expect(url).toContain('chain=solana')
      expect(url).toContain('page=2')
      expect(url).toContain('limit=10')
    })

    it('omits undefined optional params', async () => {
      fetchSpy = mockFetch(200, { data: { tokens: [] } })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().tokens.search({ q: 'bonk' })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).not.toContain('chain=')
      expect(url).not.toContain('page=')
      expect(url).not.toContain('limit=')
    })
  })

  // ─── batch ──────────────────────────────────────────────────────────

  describe('batch', () => {
    const batchResponse = { tokens: [], notFound: ['solana:missing'], invalid: [], errors: [] }

    it('posts token IDs and returns batch response', async () => {
      fetchSpy = mockFetch(200, { data: batchResponse })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().tokens.batch({ tokens: [TOKEN_ID, 'solana:missing'] })
      expect(result).toEqual(batchResponse)

      const [, init] = fetchSpy.mock.calls[0]
      expect(init.method).toBe('POST')
      expect(JSON.parse(init.body)).toEqual({ tokens: [TOKEN_ID, 'solana:missing'] })
    })
  })

  // ─── getPrice ───────────────────────────────────────────────────────

  describe('getPrice', () => {
    it('returns token price', async () => {
      const price = { tokenId: TOKEN_ID, decimals: 9, priceUsd: 145.32 }
      fetchSpy = mockFetch(200, { data: price })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().tokens.getPrice(TOKEN_ID)
      expect(result).toEqual(price)
    })
  })

  // ─── getChart ───────────────────────────────────────────────────────

  describe('getChart', () => {
    const chart = { tokenId: TOKEN_ID, resolution: '1h', candles: [] }

    it('returns chart data', async () => {
      fetchSpy = mockFetch(200, { data: chart })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().tokens.getChart({ tokenId: TOKEN_ID })
      expect(result).toEqual(chart)
    })

    it('passes resolution and count as query params', async () => {
      fetchSpy = mockFetch(200, { data: chart })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().tokens.getChart({ tokenId: TOKEN_ID, resolution: '5m', count: 50 })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('resolution=5m')
      expect(url).toContain('count=50')
    })
  })

  // ─── getStats ───────────────────────────────────────────────────────

  describe('getStats', () => {
    it('returns token stats', async () => {
      const stats = { tokenId: TOKEN_ID, volume: {}, txns: {}, uniqueTraders: {}, priceChange: {} }
      fetchSpy = mockFetch(200, { data: stats })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().tokens.getStats(TOKEN_ID)
      expect(result).toEqual(stats)
    })
  })

  // ─── getPools ───────────────────────────────────────────────────────

  describe('getPools', () => {
    it('returns token pools', async () => {
      const pools = {
        tokenId: TOKEN_ID,
        pools: [{ address: '0x...', liquidityUsd: '1000', marketCapUsd: '5000', priceUsd: '1.5' }],
      }
      fetchSpy = mockFetch(200, { data: pools })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().tokens.getPools(TOKEN_ID)
      expect(result).toEqual(pools)
    })
  })

  // ─── Error handling ─────────────────────────────────────────────────

  describe('error handling', () => {
    it('throws ShurikenAuthError on 401', async () => {
      fetchSpy = mockFetch(401, { error: 'unauthorized' })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(createClient().tokens.get(TOKEN_ID)).rejects.toThrow(ShurikenAuthError)
    })

    it('throws ShurikenApiError with status on 500', async () => {
      fetchSpy = mockFetch(500, { error: 'internal' })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(createClient().tokens.get(TOKEN_ID)).rejects.toThrow(ShurikenApiError)
      await expect(createClient().tokens.get(TOKEN_ID)).rejects.toMatchObject({ status: 500 })
    })
  })
})
