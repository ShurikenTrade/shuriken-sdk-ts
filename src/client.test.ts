import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createShurikenClient } from './client.js'
import { ShurikenApiError, ShurikenAuthError } from './errors.js'

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

describe('createShurikenClient', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = mockFetch(200, { data: {} })
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── Client factory ─────────────────────────────────────────────────

  describe('factory', () => {
    it('returns all expected namespaces', () => {
      const client = createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY })
      expect(client.account).toBeDefined()
      expect(client.perps).toBeDefined()
      expect(client.portfolio).toBeDefined()
      expect(client.swap).toBeDefined()
      expect(client.tokens).toBeDefined()
      expect(client.trigger).toBeDefined()
      expect(client.ws).toBeDefined()
    })

    it('ws namespace has all methods', () => {
      const client = createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY })
      expect(typeof client.ws.connect).toBe('function')
      expect(typeof client.ws.disconnect).toBe('function')
      expect(typeof client.ws.subscribe).toBe('function')
      expect(typeof client.ws.onConnectionStateChange).toBe('function')
      expect(typeof client.ws.getSession).toBe('function')
    })
  })

  // ─── apiBaseUrl default ─────────────────────────────────────────────

  describe('apiBaseUrl', () => {
    it('defaults to https://api.shuriken.trade', async () => {
      fetchSpy = mockFetch(200, { data: { userId: 'u_1', displayName: null } })
      vi.stubGlobal('fetch', fetchSpy)

      const client = createShurikenClient({ apiKey: API_KEY })
      await client.account.getMe()

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe('https://api.shuriken.trade/api/v2/account/me')
    })

    it('can be overridden', async () => {
      fetchSpy = mockFetch(200, { data: { userId: 'u_1', displayName: null } })
      vi.stubGlobal('fetch', fetchSpy)

      const client = createShurikenClient({
        apiBaseUrl: 'https://staging.example.com',
        apiKey: API_KEY,
      })
      await client.account.getMe()

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe('https://staging.example.com/api/v2/account/me')
    })
  })

  // ─── Auth header ────────────────────────────────────────────────────

  describe('auth header', () => {
    it('sends Bearer token on GET requests', async () => {
      fetchSpy = mockFetch(200, { data: { userId: 'u_1', displayName: null } })
      vi.stubGlobal('fetch', fetchSpy)

      await createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY }).account.getMe()

      const [, init] = fetchSpy.mock.calls[0]
      expect(init.headers.Authorization).toBe('Bearer sk_test_key')
    })

    it('sends Bearer token on POST requests', async () => {
      fetchSpy = mockFetch(200, { data: { tokens: [], notFound: [], invalid: [], errors: [] } })
      vi.stubGlobal('fetch', fetchSpy)

      await createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY }).tokens.batch({
        tokens: ['solana:So111...'],
      })

      const [, init] = fetchSpy.mock.calls[0]
      expect(init.headers.Authorization).toBe('Bearer sk_test_key')
    })
  })

  // ─── Shared HTTP helpers ────────────────────────────────────────────

  describe('HTTP helpers', () => {
    it('unwraps data envelope', async () => {
      fetchSpy = mockFetch(200, { data: { userId: 'u_1', displayName: 'alice' } })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createShurikenClient({
        apiBaseUrl: BASE_URL,
        apiKey: API_KEY,
      }).account.getMe()
      expect(result).toEqual({ userId: 'u_1', displayName: 'alice' })
    })

    it('falls back to raw json when data is absent', async () => {
      fetchSpy = mockFetch(200, { userId: 'u_1', displayName: null })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createShurikenClient({
        apiBaseUrl: BASE_URL,
        apiKey: API_KEY,
      }).account.getMe()
      expect(result).toEqual({ userId: 'u_1', displayName: null })
    })

    it('throws ShurikenAuthError on 401 for GET', async () => {
      fetchSpy = mockFetch(401, { error: 'unauthorized' })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(
        createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY }).account.getMe()
      ).rejects.toThrow(ShurikenAuthError)
    })

    it('throws ShurikenAuthError on 401 for POST', async () => {
      fetchSpy = mockFetch(401, { error: 'unauthorized' })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(
        createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY }).tokens.batch({ tokens: [] })
      ).rejects.toThrow(ShurikenAuthError)
    })

    it('throws ShurikenAuthError on 401 for PUT', async () => {
      fetchSpy = mockFetch(401, { error: 'unauthorized' })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(
        createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY }).account.updateSettings({
          tradeSettings: {} as never,
        })
      ).rejects.toThrow(ShurikenAuthError)
    })

    it('throws ShurikenAuthError on 401 for DELETE', async () => {
      fetchSpy = mockFetch(401, { error: 'unauthorized' })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(
        createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY }).trigger.cancel('o_123')
      ).rejects.toThrow(ShurikenAuthError)
    })

    it('throws ShurikenAuthError on 401 for PATCH', async () => {
      fetchSpy = mockFetch(401, { error: 'unauthorized' })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(
        createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY }).perps.modifyOrder({
          walletId: 'w_1',
          coin: 'BTC',
          isBuy: true,
          sz: '0.1',
          limitPx: '60000',
          orderType: 'limit',
        })
      ).rejects.toThrow(ShurikenAuthError)
    })

    it('throws ShurikenApiError with status on non-401 errors', async () => {
      fetchSpy = mockFetch(500, { error: 'internal server error' })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(
        createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY }).account.getMe()
      ).rejects.toThrow(ShurikenApiError)

      await expect(
        createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY }).account.getMe()
      ).rejects.toMatchObject({ status: 500 })
    })

    it('handles network errors (fetch throws)', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

      await expect(
        createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY }).account.getMe()
      ).rejects.toThrow(TypeError)
    })

    it('handles res.text() failure gracefully on error responses', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 502,
          text: () => Promise.reject(new Error('body stream already read')),
        })
      )

      await expect(
        createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY }).account.getMe()
      ).rejects.toThrow(ShurikenApiError)
    })

    it('DELETE sends body with Content-Type when body is provided', async () => {
      fetchSpy = mockFetch(200, { data: { results: [{ status: 'success' }] } })
      vi.stubGlobal('fetch', fetchSpy)

      await createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY }).perps.cancelOrder({
        walletId: 'w_1',
        coin: 'BTC',
        oid: 123,
      })

      const [, init] = fetchSpy.mock.calls[0]
      expect(init.method).toBe('DELETE')
      expect(init.headers['Content-Type']).toBe('application/json')
      expect(JSON.parse(init.body)).toEqual({ walletId: 'w_1', coin: 'BTC', oid: 123 })
    })

    it('DELETE sends no body when body is omitted', async () => {
      fetchSpy = mockFetch(200, { data: { orderId: 'o_1', status: 'cancelled' } })
      vi.stubGlobal('fetch', fetchSpy)

      await createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY }).trigger.cancel('o_1')

      const [, init] = fetchSpy.mock.calls[0]
      expect(init.method).toBe('DELETE')
      expect(init.body).toBeUndefined()
    })
  })

  // ─── buildQuery ─────────────────────────────────────────────────────

  describe('buildQuery', () => {
    it('returns empty string when all params are undefined', async () => {
      fetchSpy = mockFetch(200, { data: { wallets: [] } })
      vi.stubGlobal('fetch', fetchSpy)

      await createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY }).portfolio.getBalances()

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/portfolio/balances`)
    })

    it('encodes special characters in values', async () => {
      fetchSpy = mockFetch(200, { data: { tokens: [] } })
      vi.stubGlobal('fetch', fetchSpy)

      await createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY }).tokens.search({
        q: 'hello world&foo=bar',
      })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('q=hello%20world%26foo%3Dbar')
    })

    it('handles numeric values', async () => {
      fetchSpy = mockFetch(200, { data: { tokens: [] } })
      vi.stubGlobal('fetch', fetchSpy)

      await createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY }).tokens.search({
        q: 'test',
        page: 3,
        limit: 25,
      })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('page=3')
      expect(url).toContain('limit=25')
    })
  })
})
