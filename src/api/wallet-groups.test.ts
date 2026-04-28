import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createShurikenClient } from '../client.js'
import type { WalletGroupRecord } from './wallet-groups.js'

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

const SAMPLE_GROUP: WalletGroupRecord = {
  groupId: 'cmoige9wn0006glkr8bdr123d',
  name: 'treasury',
  chain: 'svm',
  walletIds: ['w1', 'w2'],
  createdAt: '2026-04-28T09:58:37.224Z',
  updatedAt: '2026-04-28T10:51:37.162Z',
}

describe('walletGroups', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = mockFetch(200, {})
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('list', () => {
    it('returns groups (unwraps `groups` envelope)', async () => {
      fetchSpy = mockFetch(200, { data: { groups: [SAMPLE_GROUP] } })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().walletGroups.list()
      expect(result).toEqual([SAMPLE_GROUP])

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/wallet-groups`)
    })

    it('passes chain filter as query param', async () => {
      fetchSpy = mockFetch(200, { data: { groups: [] } })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().walletGroups.list({ chain: 'svm' })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/wallet-groups?chain=svm`)
    })
  })

  describe('get', () => {
    it('fetches a single group by ID and url-encodes', async () => {
      fetchSpy = mockFetch(200, { data: SAMPLE_GROUP })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().walletGroups.get(SAMPLE_GROUP.groupId)
      expect(result).toEqual(SAMPLE_GROUP)

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/wallet-groups/${SAMPLE_GROUP.groupId}`)
    })
  })

  describe('create', () => {
    it('POSTs the create body', async () => {
      fetchSpy = mockFetch(200, { data: SAMPLE_GROUP })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().walletGroups.create({ name: 'treasury', chain: 'svm' })

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/wallet-groups`)
      expect(init?.method).toBe('POST')
      expect(JSON.parse(init?.body as string)).toEqual({ name: 'treasury', chain: 'svm' })
    })
  })

  describe('createWithWallets', () => {
    it('POSTs to /with-wallets with the body', async () => {
      fetchSpy = mockFetch(200, { data: SAMPLE_GROUP })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().walletGroups.createWithWallets({
        name: 'treasury',
        chain: 'svm',
        walletCount: 4,
      })

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/wallet-groups/with-wallets`)
      expect(init?.method).toBe('POST')
      expect(JSON.parse(init?.body as string)).toEqual({
        name: 'treasury',
        chain: 'svm',
        walletCount: 4,
      })
    })
  })

  describe('update', () => {
    it('PATCHes with the rename body', async () => {
      fetchSpy = mockFetch(200, { data: { ...SAMPLE_GROUP, name: 'renamed' } })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().walletGroups.update(SAMPLE_GROUP.groupId, { name: 'renamed' })

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/wallet-groups/${SAMPLE_GROUP.groupId}`)
      expect(init?.method).toBe('PATCH')
      expect(JSON.parse(init?.body as string)).toEqual({ name: 'renamed' })
    })
  })

  describe('delete', () => {
    it('DELETEs and returns the deleted group ID', async () => {
      fetchSpy = mockFetch(200, { data: { groupId: SAMPLE_GROUP.groupId } })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().walletGroups.delete(SAMPLE_GROUP.groupId)
      expect(result).toEqual({ groupId: SAMPLE_GROUP.groupId })

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/wallet-groups/${SAMPLE_GROUP.groupId}`)
      expect(init?.method).toBe('DELETE')
    })
  })

  describe('addWallets', () => {
    it('POSTs to /wallets with the body', async () => {
      fetchSpy = mockFetch(200, { data: SAMPLE_GROUP })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().walletGroups.addWallets(SAMPLE_GROUP.groupId, {
        walletIds: ['w1', 'w2'],
      })

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/wallet-groups/${SAMPLE_GROUP.groupId}/wallets`)
      expect(init?.method).toBe('POST')
      expect(JSON.parse(init?.body as string)).toEqual({ walletIds: ['w1', 'w2'] })
    })
  })

  describe('removeWallets', () => {
    it('DELETEs /wallets with the body', async () => {
      fetchSpy = mockFetch(200, { data: SAMPLE_GROUP })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().walletGroups.removeWallets(SAMPLE_GROUP.groupId, {
        walletIds: ['w1'],
      })

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/wallet-groups/${SAMPLE_GROUP.groupId}/wallets`)
      expect(init?.method).toBe('DELETE')
      expect(JSON.parse(init?.body as string)).toEqual({ walletIds: ['w1'] })
    })
  })

  describe('reorderWallets', () => {
    it('PUTs /wallets/order with the new order', async () => {
      fetchSpy = mockFetch(200, { data: SAMPLE_GROUP })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().walletGroups.reorderWallets(SAMPLE_GROUP.groupId, {
        walletIds: ['w2', 'w1'],
      })

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/wallet-groups/${SAMPLE_GROUP.groupId}/wallets/order`)
      expect(init?.method).toBe('PUT')
      expect(JSON.parse(init?.body as string)).toEqual({ walletIds: ['w2', 'w1'] })
    })
  })

  describe('moveWallet', () => {
    it('POSTs to /wallets/{id}/move with from/to params', async () => {
      fetchSpy = mockFetch(200, { data: SAMPLE_GROUP })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().walletGroups.moveWallet('w1', {
        fromGroupId: 'g1',
        toGroupId: 'g2',
      })

      expect(result).toEqual(SAMPLE_GROUP)

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/wallets/w1/move`)
      expect(init?.method).toBe('POST')
      expect(JSON.parse(init?.body as string)).toEqual({ fromGroupId: 'g1', toGroupId: 'g2' })
    })
  })
})
