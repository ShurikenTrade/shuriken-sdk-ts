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

describe('perps', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = mockFetch(200, {})
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── getAccount ───────────────────────────────────────────────────────

  describe('getAccount', () => {
    const accountState = {
      accountValue: '10000.00',
      withdrawable: '5000.00',
      spotBalances: [{ coin: 'USDC', total: '10000.00', hold: '5000.00' }],
    }

    it('returns account state', async () => {
      fetchSpy = mockFetch(200, { data: accountState })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().perps.getAccount()
      expect(result).toEqual(accountState)
    })

    it('passes wallet_id as query param', async () => {
      fetchSpy = mockFetch(200, { data: accountState })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().perps.getAccount({ walletId: 'w_123' })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('wallet_id=w_123')
    })
  })

  // ─── getFees ──────────────────────────────────────────────────────────

  describe('getFees', () => {
    const fees = {
      dailyVolume: '50000',
      makerRate: '0.0002',
      takerRate: '0.0005',
      referralDiscount: '0',
    }

    it('returns fee schedule', async () => {
      fetchSpy = mockFetch(200, { data: fees })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().perps.getFees()
      expect(result).toEqual(fees)
    })
  })

  // ─── getFills ─────────────────────────────────────────────────────────

  describe('getFills', () => {
    const fills = [
      {
        coin: 'BTC',
        side: 'buy',
        px: '65000',
        sz: '0.1',
        fee: '3.25',
        closedPnl: '0',
        time: 1713200000000,
        oid: 12345,
        startPosition: '0',
        direction: 'Open Long',
      },
    ]

    it('returns fills with required startTime', async () => {
      fetchSpy = mockFetch(200, { data: fills })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().perps.getFills({ startTime: 1713200000000 })
      expect(result).toEqual(fills)

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('start_time=1713200000000')
    })

    it('passes all optional params', async () => {
      fetchSpy = mockFetch(200, { data: [] })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().perps.getFills({
        startTime: 1713200000000,
        endTime: 1713300000000,
        coin: 'ETH',
        walletId: 'w_123',
      })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('start_time=1713200000000')
      expect(url).toContain('end_time=1713300000000')
      expect(url).toContain('coin=ETH')
      expect(url).toContain('wallet_id=w_123')
    })
  })

  // ─── getFunding ───────────────────────────────────────────────────────

  describe('getFunding', () => {
    const funding = [
      {
        coin: 'BTC',
        usdc: '-1.25',
        fundingRate: '0.0001',
        szi: '0.1',
        time: 1713200000000,
      },
    ]

    it('returns funding payments', async () => {
      fetchSpy = mockFetch(200, { data: funding })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().perps.getFunding({ startTime: 1713200000000 })
      expect(result).toEqual(funding)
    })
  })

  // ─── getMarkets ───────────────────────────────────────────────────────

  describe('getMarkets', () => {
    const markets = [
      {
        meta: { name: 'BTC', assetIndex: 0, szDecimals: 5, maxLeverage: 50, onlyIsolated: false },
        ctx: {
          midPx: '65000',
          markPx: '65001',
          oraclePx: '64999',
          prevDayPx: '64000',
          dayNtlVlm: '500000000',
          funding: '0.0001',
          openInterest: '1000000',
          premium: '0.0002',
        },
        asks: [{ price: '65001', size: '1.5', numOrders: 3 }],
        bids: [{ price: '64999', size: '2.0', numOrders: 5 }],
      },
    ]

    it('returns all markets', async () => {
      fetchSpy = mockFetch(200, { data: markets })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().perps.getMarkets()
      expect(result).toEqual(markets)

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/perp/markets`)
    })
  })

  // ─── getMarket ────────────────────────────────────────────────────────

  describe('getMarket', () => {
    it('fetches single market by coin', async () => {
      const market = {
        meta: { name: 'ETH', assetIndex: 1, szDecimals: 4, maxLeverage: 50, onlyIsolated: false },
        ctx: {
          midPx: '3500',
          markPx: '3501',
          oraclePx: '3499',
          prevDayPx: '3400',
          dayNtlVlm: '200000000',
          funding: '0.00005',
          openInterest: '500000',
          premium: '0.0001',
        },
        asks: [],
        bids: [],
      }
      fetchSpy = mockFetch(200, { data: market })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().perps.getMarket('ETH')
      expect(result).toEqual(market)

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/perp/markets/ETH`)
    })
  })

  // ─── getOrders ────────────────────────────────────────────────────────

  describe('getOrders', () => {
    const orders = [
      {
        coin: 'BTC',
        side: 'buy',
        limitPx: '60000',
        sz: '0.1',
        oid: 123,
        timestamp: 1713200000000,
        orderType: 'limit',
      },
    ]

    it('returns open orders', async () => {
      fetchSpy = mockFetch(200, { data: orders })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().perps.getOrders()
      expect(result).toEqual(orders)
    })

    it('passes coin filter', async () => {
      fetchSpy = mockFetch(200, { data: [] })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().perps.getOrders({ coin: 'ETH' })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('coin=ETH')
    })
  })

  // ─── getPositions ─────────────────────────────────────────────────────

  describe('getPositions', () => {
    const positions = {
      positions: [
        {
          coin: 'BTC',
          szi: '0.1',
          entryPx: '65000',
          unrealizedPnl: '100',
          returnOnEquity: '0.015',
          liquidationPx: '55000',
          leverageType: 'cross',
          leverageValue: '10',
          marginUsed: '650',
          positionValue: '6500',
        },
      ],
      accountValue: '10000',
      totalMarginUsed: '650',
      totalNtlPos: '6500',
      withdrawable: '5000',
    }

    it('returns positions response', async () => {
      fetchSpy = mockFetch(200, { data: positions })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().perps.getPositions()
      expect(result).toEqual(positions)
    })
  })

  // ─── placeOrder ───────────────────────────────────────────────────────

  describe('placeOrder', () => {
    const orderResponse = { results: [{ status: 'success', oid: 456 }] }

    it('posts order and returns response', async () => {
      fetchSpy = mockFetch(200, { data: orderResponse })
      vi.stubGlobal('fetch', fetchSpy)

      const params = {
        walletId: 'w_123',
        coin: 'BTC',
        isBuy: true,
        sz: '0.1',
        limitPx: '60000',
        orderType: 'limit',
      }
      const result = await createClient().perps.placeOrder(params)
      expect(result).toEqual(orderResponse)

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/perp/order`)
      expect(init.method).toBe('POST')
      expect(JSON.parse(init.body)).toEqual(params)
    })
  })

  // ─── modifyOrder ──────────────────────────────────────────────────────

  describe('modifyOrder', () => {
    it('sends PATCH to /perp/order', async () => {
      fetchSpy = mockFetch(200, { data: { results: [{ status: 'success', oid: 456 }] } })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().perps.modifyOrder({
        walletId: 'w_123',
        coin: 'BTC',
        isBuy: true,
        sz: '0.2',
        limitPx: '61000',
        oid: 456,
        orderType: 'limit',
      })

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/perp/order`)
      expect(init.method).toBe('PATCH')
    })
  })

  // ─── cancelOrder ──────────────────────────────────────────────────────

  describe('cancelOrder', () => {
    it('sends DELETE with body to /perp/order', async () => {
      fetchSpy = mockFetch(200, { data: { results: [{ status: 'success' }] } })
      vi.stubGlobal('fetch', fetchSpy)

      const params = { walletId: 'w_123', coin: 'BTC', oid: 456 }
      await createClient().perps.cancelOrder(params)

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/perp/order`)
      expect(init.method).toBe('DELETE')
      expect(JSON.parse(init.body)).toEqual(params)
    })
  })

  // ─── batchModifyOrders ────────────────────────────────────────────────

  describe('batchModifyOrders', () => {
    it('sends PATCH to /perp/orders', async () => {
      fetchSpy = mockFetch(200, { data: { results: [{ status: 'success' }] } })
      vi.stubGlobal('fetch', fetchSpy)

      const params = {
        walletId: 'w_123',
        modifications: [
          { coin: 'BTC', isBuy: true, sz: '0.2', limitPx: '61000', oid: 456, orderType: 'limit' },
        ],
      }
      await createClient().perps.batchModifyOrders(params)

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/perp/orders`)
      expect(init.method).toBe('PATCH')
    })
  })

  // ─── closePosition ────────────────────────────────────────────────────

  describe('closePosition', () => {
    it('posts close params', async () => {
      fetchSpy = mockFetch(200, { data: { results: [{ status: 'success' }] } })
      vi.stubGlobal('fetch', fetchSpy)

      const params = { walletId: 'w_123', coin: 'BTC', percentage: 100 }
      await createClient().perps.closePosition(params)

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/perp/position/close`)
      expect(init.method).toBe('POST')
      expect(JSON.parse(init.body)).toEqual(params)
    })
  })

  // ─── updateLeverage ───────────────────────────────────────────────────

  describe('updateLeverage', () => {
    it('posts leverage update', async () => {
      fetchSpy = mockFetch(200, { data: { success: true } })
      vi.stubGlobal('fetch', fetchSpy)

      const params = { walletId: 'w_123', coin: 'BTC', leverage: 20, isCross: true }
      const result = await createClient().perps.updateLeverage(params)
      expect(result).toEqual({ success: true })

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/perp/leverage`)
      expect(init.method).toBe('POST')
    })
  })

  // ─── updateMargin ─────────────────────────────────────────────────────

  describe('updateMargin', () => {
    it('posts margin update', async () => {
      fetchSpy = mockFetch(200, { data: { success: true } })
      vi.stubGlobal('fetch', fetchSpy)

      const params = { walletId: 'w_123', coin: 'BTC', amount: '500' }
      const result = await createClient().perps.updateMargin(params)
      expect(result).toEqual({ success: true })

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/perp/position/margin`)
      expect(init.method).toBe('POST')
    })
  })

  // ─── Error handling ───────────────────────────────────────────────────

  describe('error handling', () => {
    it('throws ShurikenAuthError on 401', async () => {
      fetchSpy = mockFetch(401, { error: 'unauthorized' })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(createClient().perps.getAccount()).rejects.toThrow(ShurikenAuthError)
    })
  })
})
