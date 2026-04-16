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

describe('trigger', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = mockFetch(200, {})
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── create ───────────────────────────────────────────────────────────

  describe('create', () => {
    const order = {
      orderId: 'o_123',
      status: 'active',
      chain: 'solana',
      inputToken: 'So111...',
      outputToken: 'EPjF...',
      amount: '1000000000',
      createdAt: '2026-04-16T12:00:00Z',
      trigger: {
        metric: 'price_usd',
        direction: 'above',
        value: '0.001',
        trailingPercentage: null,
      },
    }

    it('posts order params and returns created order', async () => {
      fetchSpy = mockFetch(200, { data: order })
      vi.stubGlobal('fetch', fetchSpy)

      const params = {
        chain: 'solana',
        inputToken: 'So111...',
        outputToken: 'EPjF...',
        amount: '1000000000',
        walletId: 'w_123',
        triggerMetric: 'price_usd',
        triggerDirection: 'above',
        triggerValue: '0.001',
      }
      const result = await createClient().trigger.create(params)
      expect(result).toEqual(order)

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/trigger/order`)
      expect(init.method).toBe('POST')
      expect(JSON.parse(init.body)).toEqual(params)
    })
  })

  // ─── get ──────────────────────────────────────────────────────────────

  describe('get', () => {
    const orderView = {
      orderId: 'o_123',
      status: 'active',
      chain: 'solana',
      inputToken: 'So111...',
      outputToken: 'EPjF...',
      amount: '1000000000',
      createdAt: '2026-04-16T12:00:00Z',
      updatedAt: '2026-04-16T12:00:00Z',
      trigger: {
        metric: 'price_usd',
        direction: 'above',
        value: '0.001',
        trailingPercentage: null,
      },
    }

    it('returns order by ID', async () => {
      fetchSpy = mockFetch(200, { data: orderView })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().trigger.get('o_123')
      expect(result).toEqual(orderView)

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/trigger/order/o_123`)
    })

    it('throws ShurikenApiError on 404', async () => {
      fetchSpy = mockFetch(404, { error: 'not found' })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(createClient().trigger.get('o_missing')).rejects.toThrow(ShurikenApiError)
      await expect(createClient().trigger.get('o_missing')).rejects.toMatchObject({ status: 404 })
    })
  })

  // ─── list ─────────────────────────────────────────────────────────────

  describe('list', () => {
    const response = {
      orders: [],
      nextCursor: 'abc123',
    }

    it('returns orders list', async () => {
      fetchSpy = mockFetch(200, { data: response })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().trigger.list()
      expect(result).toEqual(response)
    })

    it('passes limit and cursor as query params', async () => {
      fetchSpy = mockFetch(200, { data: response })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().trigger.list({ limit: 50, cursor: 'abc123' })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('/api/v2/trigger/orders?')
      expect(url).toContain('limit=50')
      expect(url).toContain('cursor=abc123')
    })

    it('works without params', async () => {
      fetchSpy = mockFetch(200, { data: response })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().trigger.list()

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/trigger/orders`)
    })
  })

  // ─── cancel ───────────────────────────────────────────────────────────

  describe('cancel', () => {
    const cancelled = { orderId: 'o_123', status: 'cancelled' }

    it('sends DELETE and returns cancelled order', async () => {
      fetchSpy = mockFetch(200, { data: cancelled })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().trigger.cancel('o_123')
      expect(result).toEqual(cancelled)

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/trigger/order/o_123`)
      expect(init.method).toBe('DELETE')
    })
  })

  // ─── Error handling ───────────────────────────────────────────────────

  describe('error handling', () => {
    it('throws ShurikenAuthError on 401', async () => {
      fetchSpy = mockFetch(401, { error: 'unauthorized' })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(createClient().trigger.list()).rejects.toThrow(ShurikenAuthError)
    })
  })
})
