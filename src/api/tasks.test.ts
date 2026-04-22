import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createShurikenClient } from '../client.js'

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

let fetchSpy: ReturnType<typeof mockFetch>

describe('tasks', () => {
  beforeEach(() => {
    fetchSpy = mockFetch(200, {})
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── getStatus ────────────────────────────────────────────────────────

  describe('getStatus', () => {
    const status = {
      taskId: 't_abc',
      taskType: 'swap',
      status: 'success',
      txHash: '5xyz...',
      errorCode: null,
      errorMessage: null,
    }

    it('returns task status by taskId', async () => {
      fetchSpy = mockFetch(200, { data: status })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().tasks.getStatus('t_abc')
      expect(result).toEqual(status)

      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/tasks/t_abc`)
    })
  })
})
