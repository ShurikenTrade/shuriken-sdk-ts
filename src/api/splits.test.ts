import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createShurikenClient } from '../client.js'
import type { ExecuteSplitResult, PlanSplitResult } from './splits.js'

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

const SAMPLE_PLAN: PlanSplitResult = {
  planId: 'plan_abc123',
  destinationCount: 3,
  summary: 'Split 0.16 SOL equally across 3 wallets on Base',
  rates: [
    {
      exchangerId: 'splitnow',
      exchangeRate: '145.23',
      toAssetId: 'usdc',
      toNetworkId: 'base',
    },
  ],
  warnings: [],
  expiresAt: '2026-05-04T10:01:00.000Z',
  expiresInSeconds: 60,
}

const SAMPLE_EXECUTE: ExecuteSplitResult = {
  taskId: 'task_xyz789',
  splitnowOrderId: 'sn_order_123',
}

describe('splits', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = mockFetch(200, {})
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('plan', () => {
    it('POSTs to /splits/plan with destinationGroupId body shape', async () => {
      fetchSpy = mockFetch(200, { data: SAMPLE_PLAN })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().splits.plan({
        sourceWalletId: 'w_src',
        destinationGroupId: 'grp_abc',
        fromAmount: '0.16',
        fromAsset: 'sol',
      })

      expect(result).toEqual(SAMPLE_PLAN)

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/splits/plan`)
      expect(init?.method).toBe('POST')
      expect(JSON.parse(init?.body as string)).toEqual({
        sourceWalletId: 'w_src',
        destinationGroupId: 'grp_abc',
        fromAmount: '0.16',
        fromAsset: 'sol',
      })
    })

    it('POSTs to /splits/plan with explicit destinations array', async () => {
      fetchSpy = mockFetch(200, { data: SAMPLE_PLAN })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().splits.plan({
        sourceWalletId: 'w_src',
        destinations: [
          { walletId: 'w1', pctBips: 5000 },
          { walletId: 'w2', pctBips: 5000 },
        ],
        fromAmount: '1.0',
        fromAsset: 'eth',
        agentComment: 'even split',
      })

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/splits/plan`)
      expect(init?.method).toBe('POST')
      expect(JSON.parse(init?.body as string)).toEqual({
        sourceWalletId: 'w_src',
        destinations: [
          { walletId: 'w1', pctBips: 5000 },
          { walletId: 'w2', pctBips: 5000 },
        ],
        fromAmount: '1.0',
        fromAsset: 'eth',
        agentComment: 'even split',
      })
    })

    it('returns plan with all fields including rates and warnings', async () => {
      const planWithWarnings: PlanSplitResult = {
        ...SAMPLE_PLAN,
        warnings: ['Low liquidity on leg 2'],
      }
      fetchSpy = mockFetch(200, { data: planWithWarnings })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().splits.plan({
        sourceWalletId: 'w_src',
        destinationGroupId: 'grp_abc',
        fromAmount: '0.5',
        fromAsset: 'bnb',
      })

      expect(result.warnings).toEqual(['Low liquidity on leg 2'])
      expect(result.expiresInSeconds).toBe(60)
      expect(result.rates).toHaveLength(1)
    })
  })

  describe('execute', () => {
    it('POSTs to /splits/execute with planId', async () => {
      fetchSpy = mockFetch(200, { data: SAMPLE_EXECUTE })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().splits.execute({ planId: 'plan_abc123' })
      expect(result).toEqual(SAMPLE_EXECUTE)

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/splits/execute`)
      expect(init?.method).toBe('POST')
      expect(JSON.parse(init?.body as string)).toEqual({ planId: 'plan_abc123' })
    })

    it('includes optional agentComment when provided', async () => {
      fetchSpy = mockFetch(200, { data: SAMPLE_EXECUTE })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().splits.execute({
        planId: 'plan_abc123',
        agentComment: 'confirmed by user',
      })

      const [, init] = fetchSpy.mock.calls[0]
      expect(JSON.parse(init?.body as string)).toEqual({
        planId: 'plan_abc123',
        agentComment: 'confirmed by user',
      })
    })

    it('returns taskId and splitnowOrderId', async () => {
      fetchSpy = mockFetch(200, { data: SAMPLE_EXECUTE })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().splits.execute({ planId: 'plan_abc123' })
      expect(result.taskId).toBe('task_xyz789')
      expect(result.splitnowOrderId).toBe('sn_order_123')
    })
  })
})
