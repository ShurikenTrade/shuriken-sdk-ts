import { afterEach, describe, expect, it, vi } from 'vitest'
import { ShurikenAuthError, ShurikenSessionError } from './errors.js'

const BASE_URL = 'https://api.test.shuriken.trade'
const API_KEY = 'sk_test_key'

const mockSessionResponse = {
  data: {
    connection: {
      provider: 'pusher',
      appKey: 'test-app-key',
      wsHost: 'ws.test.shuriken.trade',
      wsPort: 443,
      forceTls: true,
      authEndpoint: 'https://api.test.shuriken.trade/api/v2/ws/auth',
    },
    session: {
      recommendedReconnectBackoffMs: [1000, 2000, 4000],
    },
    subscriptions: [
      {
        stream: 'alpha.signalFeedGlobal',
        channel: 'private-signal-global',
        event: 'signal',
        visibility: 'public',
        payloadFormat: 'json',
        payloadSchemaId: 'alpha.signalFeedGlobal',
      },
    ],
  },
}

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  })
}

// Pusher mock state — shared between factory and tests
let pusherConnectionHandlers: Record<string, ((...args: unknown[]) => void)[]> = {}
let pusherDisconnectSpy = vi.fn()

vi.mock('pusher-js', () => {
  class PusherMock {
    connection: {
      state: string
      bind: (event: string, handler: (...args: unknown[]) => void) => void
    }
    subscribe: ReturnType<typeof vi.fn>
    unsubscribe: ReturnType<typeof vi.fn>

    constructor() {
      pusherConnectionHandlers = {}
      pusherDisconnectSpy = vi.fn()
      this.connection = {
        state: 'initialized',
        bind(event: string, handler: (...args: unknown[]) => void) {
          if (!pusherConnectionHandlers[event]) pusherConnectionHandlers[event] = []
          pusherConnectionHandlers[event].push(handler)
        },
      }
      this.subscribe = vi.fn().mockReturnValue({ bind: vi.fn() })
      this.unsubscribe = vi.fn()
    }

    disconnect(...args: unknown[]) {
      pusherDisconnectSpy(...args)
    }
  }
  return { default: PusherMock }
})

function emitPusherEvent(event: string, ...args: unknown[]) {
  for (const h of pusherConnectionHandlers[event] ?? []) h(...args)
}

async function connectClient() {
  const fetchSpy = mockFetch(200, mockSessionResponse)
  vi.stubGlobal('fetch', fetchSpy)

  const { createShurikenClient } = await import('./client.js')
  const client = createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY })

  const connectPromise = client.ws.connect()
  await new Promise((r) => setTimeout(r, 0))
  emitPusherEvent('connected')
  await connectPromise

  return { client, fetchSpy, createShurikenClient }
}

describe('WebSocket', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('connect', () => {
    it('calls session bootstrap endpoint with correct payload', async () => {
      const { fetchSpy } = await connectClient()

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/ws/session`)
      expect(init.method).toBe('POST')
      expect(init.headers['Content-Type']).toBe('application/json')

      const body = JSON.parse(init.body)
      expect(body.subscriptions).toEqual([{ stream: 'alpha.signalFeedGlobal', filter: {} }])
    })

    it('sends Authorization header on session bootstrap', async () => {
      const { fetchSpy } = await connectClient()

      const [, init] = fetchSpy.mock.calls[0]
      expect(init.headers.Authorization).toBe(`Bearer ${API_KEY}`)
    })

    it('throws ShurikenAuthError on 401', async () => {
      vi.stubGlobal('fetch', mockFetch(401, { error: 'unauthorized' }))

      const { createShurikenClient } = await import('./client.js')
      const client = createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY })
      await expect(client.ws.connect()).rejects.toThrow(ShurikenAuthError)
    })

    it('throws ShurikenSessionError on non-401 error', async () => {
      vi.stubGlobal('fetch', mockFetch(500, { error: 'internal' }))

      const { createShurikenClient } = await import('./client.js')
      const client = createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY })
      await expect(client.ws.connect()).rejects.toThrow(ShurikenSessionError)
    })

    it('throws ShurikenSessionError when already connected', async () => {
      const { client } = await connectClient()

      await expect(client.ws.connect()).rejects.toThrow(ShurikenSessionError)
      await expect(client.ws.connect()).rejects.toThrow('already connected')
    })

    it('stores session after successful connect', async () => {
      const { client } = await connectClient()

      expect(client.ws.getSession()).not.toBeNull()
      expect(client.ws.getSession()?.connection.appKey).toBe('test-app-key')
    })
  })

  describe('disconnect', () => {
    it('clears session after disconnect', async () => {
      const { client } = await connectClient()

      expect(client.ws.getSession()).not.toBeNull()
      client.ws.disconnect()
      expect(client.ws.getSession()).toBeNull()
    })

    it('calls pusher.disconnect()', async () => {
      const { client } = await connectClient()

      client.ws.disconnect()
      expect(pusherDisconnectSpy).toHaveBeenCalledOnce()
    })
  })

  describe('subscribe', () => {
    it('throws when not connected', async () => {
      const { createShurikenClient } = await import('./client.js')
      const client = createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY })

      expect(() => {
        client.ws.subscribe(
          { stream: 'svm.token.swaps', filter: { tokenAddress: 'So111...' } },
          () => {}
        )
      }).toThrow(ShurikenSessionError)

      expect(() => {
        client.ws.subscribe(
          { stream: 'svm.token.swaps', filter: { tokenAddress: 'So111...' } },
          () => {}
        )
      }).toThrow('not connected')
    })
  })

  describe('onConnectionStateChange', () => {
    it('returns an unsubscribe function', async () => {
      const { createShurikenClient } = await import('./client.js')
      const client = createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY })
      const unsub = client.ws.onConnectionStateChange(() => {})
      expect(typeof unsub).toBe('function')
    })
  })

  describe('getSession', () => {
    it('returns null before connect', async () => {
      const { createShurikenClient } = await import('./client.js')
      const client = createShurikenClient({ apiBaseUrl: BASE_URL, apiKey: API_KEY })
      expect(client.ws.getSession()).toBeNull()
    })
  })
})
