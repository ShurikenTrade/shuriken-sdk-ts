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

describe('account', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = mockFetch(200, {})
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── getMe ────────────────────────────────────────────────────────────

  describe('getMe', () => {
    const me = { userId: 'u_123', displayName: 'alice' }

    it('returns account info', async () => {
      fetchSpy = mockFetch(200, { data: me })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().account.getMe()
      expect(result).toEqual(me)

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/account/me`)
    })
  })

  // ─── getSettings ──────────────────────────────────────────────────────

  describe('getSettings', () => {
    const settings = {
      tradeSettings: {
        autoEnableMultisend: false,
        chainPresetsBuy: {},
        chainPresetsSell: {},
        defaultWallets: {
          defaultWalletByNetwork: {},
          selectedWalletIdsByNetwork: {},
        },
        oneClickMode: {},
        walletGroups: [],
      },
    }

    it('returns account settings', async () => {
      fetchSpy = mockFetch(200, { data: settings })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().account.getSettings()
      expect(result).toEqual(settings)
    })
  })

  // ─── updateSettings ───────────────────────────────────────────────────

  describe('updateSettings', () => {
    const settings = {
      tradeSettings: {
        autoEnableMultisend: true,
        chainPresetsBuy: {},
        chainPresetsSell: {},
        defaultWallets: {
          defaultWalletByNetwork: {},
          selectedWalletIdsByNetwork: {},
        },
        oneClickMode: {},
        walletGroups: [],
      },
    }

    it('sends PUT with settings and returns updated settings', async () => {
      fetchSpy = mockFetch(200, { data: settings })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().account.updateSettings(settings)
      expect(result).toEqual(settings)

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/account/settings`)
      expect(init.method).toBe('PUT')
      expect(JSON.parse(init.body)).toEqual(settings)
    })
  })

  // ─── getUsage ─────────────────────────────────────────────────────────

  describe('getUsage', () => {
    const usage = {
      keyId: 'k_abc',
      scopes: ['trade:swap:execute'],
      constraints: {
        buysEnabled: true,
        sellsEnabled: true,
        maxExecutionsPerHour: 100,
        maxExecutionsPerDay: 1000,
        maxConcurrentExecutions: 5,
        maxLimitOrdersPerDay: 50,
        allowCustomGas: false,
        allowBribes: false,
        allowedNetworks: [1],
        allowedWalletIds: [],
        maxBuyUsdPerTrade: null,
        maxBuyUsdPerDay: null,
        maxSellUsdPerTrade: null,
        maxSellUsdPerDay: null,
        maxLimitOrderUsdPerOrder: null,
        maxSlippageBps: null,
        maxPriceImpactPct: null,
        maxSellPositionPct: null,
      },
    }

    it('returns usage and constraints', async () => {
      fetchSpy = mockFetch(200, { data: usage })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().account.getUsage()
      expect(result).toEqual(usage)

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/account/usage`)
    })
  })

  // ─── getWallets ───────────────────────────────────────────────────────

  describe('getWallets', () => {
    const wallets = [
      { walletId: 'w_1', address: '7xKX...', chain: 'solana', label: 'Main' },
      { walletId: 'w_2', address: '0xabc...', chain: 'base', label: null },
    ]

    it('returns wallets array', async () => {
      fetchSpy = mockFetch(200, { data: wallets })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().account.getWallets()
      expect(result).toEqual(wallets)

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/account/wallets`)
    })
  })

  // ─── Error handling ───────────────────────────────────────────────────

  describe('error handling', () => {
    it('throws ShurikenAuthError on 401', async () => {
      fetchSpy = mockFetch(401, { error: 'unauthorized' })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(createClient().account.getMe()).rejects.toThrow(ShurikenAuthError)
    })
  })
})
