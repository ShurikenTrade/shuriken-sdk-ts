import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createShurikenClient } from '../client.js'
import { ShurikenApiError } from '../errors.js'
import type { TradeSuggestion } from './suggestions.js'

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

const SAMPLE_SUGGESTION: TradeSuggestion = {
  id: 'sug_01h8mxnkv1qz3sb0r5e0f7n4ck',
  state: 'OPEN',
  createdAt: '2026-05-09T12:00:00.000Z',
  expiresAt: '2026-05-09T18:00:00.000Z',
  actedAt: null,
  dismissedAt: null,
  dismissReason: null,
  linkedTaskId: null,
  side: 'BUY',
  networkId: 'SOL',
  asset: {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    priceUsd: 162.34,
  },
  rationale: 'Funding flipped positive after a flush; reclaim of yesterdays range.',
  amountInUsd: 250,
  confidence: 'MEDIUM',
  agentKey: { id: 'ak_123', name: 'alpha-scout' },
}

describe('suggestions', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = mockFetch(200, {})
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('create', () => {
    it('POSTs to /api/v2/agents/suggestions with body', async () => {
      fetchSpy = mockFetch(201, { data: SAMPLE_SUGGESTION })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().suggestions.create({
        side: 'BUY',
        networkId: 'SOL',
        asset: 'So11111111111111111111111111111111111111112',
        rationale: 'Funding flipped positive after a flush.',
        amountInUsd: 250,
        confidence: 'MEDIUM',
      })

      expect(result).toEqual(SAMPLE_SUGGESTION)

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/agents/suggestions`)
      expect(init?.method).toBe('POST')
      expect(JSON.parse(init?.body as string)).toEqual({
        side: 'BUY',
        networkId: 'SOL',
        asset: 'So11111111111111111111111111111111111111112',
        rationale: 'Funding flipped positive after a flush.',
        amountInUsd: 250,
        confidence: 'MEDIUM',
      })
    })

    it('handles 400 MISSING_REQUIRED_FIELDS error envelope', async () => {
      fetchSpy = mockFetch(400, {
        error: { code: 'MISSING_REQUIRED_FIELDS', message: 'rationale is required' },
        requestId: 'req_abc',
      })
      vi.stubGlobal('fetch', fetchSpy)

      await expect(
        createClient().suggestions.create({
          side: 'BUY',
          networkId: 'SOL',
          asset: 'So111...',
          rationale: '',
        })
      ).rejects.toMatchObject({
        name: 'ShurikenApiError',
        status: 400,
        apiCode: 'MISSING_REQUIRED_FIELDS',
        requestId: 'req_abc',
      })
    })
  })

  describe('list', () => {
    it('returns the envelope (suggestions + nextCursor)', async () => {
      fetchSpy = mockFetch(200, {
        data: { suggestions: [SAMPLE_SUGGESTION], nextCursor: 'cursor_abc' },
      })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().suggestions.list()

      expect(result).toEqual({
        suggestions: [SAMPLE_SUGGESTION],
        nextCursor: 'cursor_abc',
      })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/agents/suggestions`)
    })

    it('builds query string for state/limit/cursor', async () => {
      fetchSpy = mockFetch(200, { data: { suggestions: [] } })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().suggestions.list({
        state: 'OPEN',
        limit: 25,
        cursor: 'c1',
      })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/agents/suggestions?state=OPEN&limit=25&cursor=c1`)
    })

    it('omits absent query params', async () => {
      fetchSpy = mockFetch(200, { data: { suggestions: [] } })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().suggestions.list({ state: 'ALL' })

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/agents/suggestions?state=ALL`)
    })
  })

})
