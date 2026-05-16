import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createShurikenClient } from '../client.js'
import type {
  AlphaCallSignal,
  AlphaSourceItem,
  GlobalCallItem,
  RecentCallItem,
  TokenMentionItem,
} from './alpha.js'

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

const SAMPLE_SOURCE: AlphaSourceItem = {
  connectionId: 'conn_abc123',
  connectionType: 'discord',
  enabled: true,
  name: 'Alpha Discord',
  platform: 'discord',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const SAMPLE_RECENT_CALL: RecentCallItem = {
  tokenAddress: 'So11111111111111111111111111111111111111112',
  tokenSymbol: 'SOL',
  tokenName: 'Solana',
  chain: 'svm',
  firstSeenAt: 1716000000000,
  lastSeenAt: 1716001000000,
  mentionCount: 5,
  priceUsdAtCall: '150.00',
  currentPriceUsd: '155.00',
}

const SAMPLE_GLOBAL_CALL: GlobalCallItem = {
  tokenAddress: 'So11111111111111111111111111111111111111112',
  tokenSymbol: 'SOL',
  chain: 'svm',
  firstSeenAt: 1716000000000,
  lastSeenAt: 1716001000000,
  mentionCount: 10,
  currentPriceUsd: '155.00',
  priceChangeSinceCallPct: '3.33',
}

const SAMPLE_SIGNAL: AlphaCallSignal = {
  signalId: 'sig_xyz789',
  timestampMs: 1716000000000,
  platform: 'discord',
  isBot: false,
  priceUsd: 150.0,
  messagePreview: 'SOL looking strong here',
}

const SAMPLE_MENTION: TokenMentionItem = {
  messageId: 'msg_001',
  platform: 'discord',
  timestamp: 1716000000000,
  channelId: 'ch_123',
  guildId: 'gld_456',
  authorUsername: 'trader_dan',
}

describe('alpha', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = mockFetch(200, {})
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getSources', () => {
    it('fetches GET /api/v2/alpha/sources with auth header and returns sources', async () => {
      fetchSpy = mockFetch(200, { data: { sources: [SAMPLE_SOURCE] } })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().alpha.getSources()
      expect(result).toEqual({ sources: [SAMPLE_SOURCE] })

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/alpha/sources`)
      expect(init?.method).toBeUndefined() // GET has no method override
      expect(init?.headers?.Authorization).toBe(`Bearer ${API_KEY}`)
    })
  })

  describe('getRecentCalls', () => {
    it('fetches GET /api/v2/alpha/recent-calls with no params', async () => {
      fetchSpy = mockFetch(200, { data: { totalCount: 1, calls: [SAMPLE_RECENT_CALL] } })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().alpha.getRecentCalls()
      expect(result.totalCount).toBe(1)
      expect(result.calls).toEqual([SAMPLE_RECENT_CALL])

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/alpha/recent-calls`)
    })

    it('passes limit, sourceName, and connectionId as query params', async () => {
      fetchSpy = mockFetch(200, { data: { totalCount: 0, calls: [] } })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().alpha.getRecentCalls({
        limit: 25,
        sourceName: 'my-server',
        connectionId: 'conn_abc',
      })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(
        `${BASE_URL}/api/v2/alpha/recent-calls?limit=25&sourceName=my-server&connectionId=conn_abc`
      )
    })
  })

  describe('getGlobalCalls', () => {
    it('fetches GET /api/v2/alpha/global-calls with no params', async () => {
      fetchSpy = mockFetch(200, {
        data: { platform: 'all', totalCount: 1, calls: [SAMPLE_GLOBAL_CALL] },
      })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().alpha.getGlobalCalls()
      expect(result.platform).toBe('all')
      expect(result.calls).toEqual([SAMPLE_GLOBAL_CALL])

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/alpha/global-calls`)
    })

    it('passes platform and limit as query params', async () => {
      fetchSpy = mockFetch(200, { data: { platform: 'x', totalCount: 0, calls: [] } })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().alpha.getGlobalCalls({ platform: 'x', limit: 50 })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/alpha/global-calls?platform=x&limit=50`)
    })
  })

  describe('getCallContext', () => {
    const TOKEN = 'So11111111111111111111111111111111111111112'

    it('fetches GET /api/v2/alpha/tokens/{addr}/call-context with no params', async () => {
      fetchSpy = mockFetch(200, {
        data: {
          tokenAddress: TOKEN,
          totalSignals: 1,
          hasMore: false,
          signals: [SAMPLE_SIGNAL],
        },
      })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().alpha.getCallContext(TOKEN)
      expect(result.tokenAddress).toBe(TOKEN)
      expect(result.signals).toEqual([SAMPLE_SIGNAL])

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/alpha/tokens/${TOKEN}/call-context`)
    })

    it('cursor round-trip: cursor param appears in the URL', async () => {
      fetchSpy = mockFetch(200, {
        data: { tokenAddress: TOKEN, totalSignals: 0, hasMore: false, signals: [] },
      })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().alpha.getCallContext(TOKEN, { cursor: 12345 })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('cursor=12345')
    })

    it('sourceFilter array is serialised as CSV (comma-encoded)', async () => {
      fetchSpy = mockFetch(200, {
        data: { tokenAddress: TOKEN, totalSignals: 0, hasMore: false, signals: [] },
      })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().alpha.getCallContext(TOKEN, {
        sourceFilter: ['discord', 'telegram'],
      })

      const [url] = fetchSpy.mock.calls[0]
      // URL-encoded comma = %2C
      expect(url).toContain('sourceFilter=discord%2Ctelegram')
    })

    it('boolean params are serialised as strings', async () => {
      fetchSpy = mockFetch(200, {
        data: { tokenAddress: TOKEN, totalSignals: 0, hasMore: false, signals: [] },
      })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().alpha.getCallContext(TOKEN, {
        includeBotSignals: true,
        includeMessageContext: false,
      })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toContain('includeBotSignals=true')
      expect(url).toContain('includeMessageContext=false')
    })
  })

  describe('getTokenMentions', () => {
    const TOKEN = 'So11111111111111111111111111111111111111112'

    it('fetches GET /api/v2/alpha/tokens/{addr}/mentions with no params', async () => {
      fetchSpy = mockFetch(200, {
        data: {
          tokenAddress: TOKEN,
          chain: 'svm',
          totalMentions: 1,
          mentions: [SAMPLE_MENTION],
        },
      })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().alpha.getTokenMentions(TOKEN)
      expect(result.tokenAddress).toBe(TOKEN)
      expect(result.mentions).toEqual([SAMPLE_MENTION])

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/alpha/tokens/${TOKEN}/mentions`)
    })

    it('passes limit as query param', async () => {
      fetchSpy = mockFetch(200, {
        data: { tokenAddress: TOKEN, chain: 'svm', totalMentions: 0, mentions: [] },
      })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().alpha.getTokenMentions(TOKEN, { limit: 100 })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/alpha/tokens/${TOKEN}/mentions?limit=100`)
    })
  })
})
