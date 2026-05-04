import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createShurikenClient } from '../client.js'
import type { BulkArchiveEntry, WalletRecord } from './wallets.js'

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

const SAMPLE_WALLET: WalletRecord = {
  walletId: 'w_abc123',
  address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  chain: 'svm',
  label: 'treasury-1',
  state: 'ARCHIVED',
  archivedAt: '2026-05-01T12:00:00.000Z',
}

const ACTIVE_WALLET: WalletRecord = {
  walletId: 'w_abc123',
  address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  chain: 'svm',
  label: 'treasury-1',
  state: 'ACTIVE',
}

describe('wallets', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = mockFetch(200, {})
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('archive', () => {
    it('POSTs to /archive with empty body and returns wallet + clearedDefault', async () => {
      fetchSpy = mockFetch(200, {
        data: { wallet: SAMPLE_WALLET, clearedDefault: false },
      })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().wallets.archive('w_abc123')
      expect(result).toEqual({ wallet: SAMPLE_WALLET, clearedDefault: false })

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/wallets/w_abc123/archive`)
      expect(init?.method).toBe('POST')
      expect(JSON.parse(init?.body as string)).toEqual({})
    })

    it('url-encodes the walletId', async () => {
      fetchSpy = mockFetch(200, {
        data: { wallet: { ...SAMPLE_WALLET, walletId: 'w/special' }, clearedDefault: true },
      })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().wallets.archive('w/special')

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/wallets/w%2Fspecial/archive`)
    })

    it('reflects clearedDefault: true when the default wallet was cleared', async () => {
      fetchSpy = mockFetch(200, {
        data: { wallet: SAMPLE_WALLET, clearedDefault: true },
      })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().wallets.archive('w_abc123')
      expect(result.clearedDefault).toBe(true)
    })
  })

  describe('unarchive', () => {
    it('POSTs to /unarchive with empty body and returns wallet', async () => {
      fetchSpy = mockFetch(200, { data: { wallet: ACTIVE_WALLET } })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().wallets.unarchive('w_abc123')
      expect(result).toEqual({ wallet: ACTIVE_WALLET })

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/wallets/w_abc123/unarchive`)
      expect(init?.method).toBe('POST')
      expect(JSON.parse(init?.body as string)).toEqual({})
    })

    it('url-encodes the walletId', async () => {
      fetchSpy = mockFetch(200, { data: { wallet: ACTIVE_WALLET } })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().wallets.unarchive('w/special')

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/wallets/w%2Fspecial/unarchive`)
    })
  })

  describe('bulkArchive', () => {
    it('POSTs to /bulk-archive with walletIds array and returns results', async () => {
      const entries: BulkArchiveEntry[] = [
        { walletId: 'w1', status: 'archived', clearedDefault: false },
        { walletId: 'w2', status: 'already_archived' },
      ]
      fetchSpy = mockFetch(200, { data: { results: entries } })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().wallets.bulkArchive({ walletIds: ['w1', 'w2'] })
      expect(result).toEqual({ results: entries })

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/wallets/bulk-archive`)
      expect(init?.method).toBe('POST')
      expect(JSON.parse(init?.body as string)).toEqual({ walletIds: ['w1', 'w2'] })
    })

    it('sends all provided wallet IDs', async () => {
      fetchSpy = mockFetch(200, { data: { results: [] } })
      vi.stubGlobal('fetch', fetchSpy)

      const ids = Array.from({ length: 10 }, (_, i) => `w_${i}`)
      await createClient().wallets.bulkArchive({ walletIds: ids })

      const [, init] = fetchSpy.mock.calls[0]
      expect(JSON.parse(init?.body as string)).toEqual({ walletIds: ids })
    })
  })
})
