import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createShurikenClient } from '../client.js'
import type { TransferResult } from './transfers.js'

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

const SUCCESS_RESULT: TransferResult = {
  taskId: 'task_abc',
  status: 'SUCCESS',
  willArchiveOnSuccess: false,
  transaction: {
    hash: '5wHn...xyz',
    explorerUrl: 'https://solscan.io/tx/5wHn...xyz',
  },
}

const PENDING_RESULT: TransferResult = {
  taskId: 'task_def',
  status: 'PENDING',
  willArchiveOnSuccess: false,
}

describe('transfers', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = mockFetch(200, {})
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('send', () => {
    it('POSTs to /transfers/send with correct body shape', async () => {
      fetchSpy = mockFetch(200, { data: SUCCESS_RESULT })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().transfers.send({
        fromWalletId: 'w_from',
        toWalletId: 'w_to',
        token: 'SOL',
        amount: '1000000',
        chain: 'SVM',
      })

      expect(result).toEqual(SUCCESS_RESULT)

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/transfers/send`)
      expect(init?.method).toBe('POST')
      expect(JSON.parse(init?.body as string)).toEqual({
        fromWalletId: 'w_from',
        toWalletId: 'w_to',
        token: 'SOL',
        amount: '1000000',
        chain: 'SVM',
      })
    })

    it('includes optional fields when provided', async () => {
      fetchSpy = mockFetch(200, { data: SUCCESS_RESULT })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().transfers.send({
        fromWalletId: 'w_from',
        toWalletId: 'w_to',
        token: 'USDC',
        amount: '1000000',
        chain: 'EVM',
        chainId: 8453,
        awaitResult: false,
        correlationId: 'corr_123',
        agentComment: 'rebalance run',
      })

      const [, init] = fetchSpy.mock.calls[0]
      expect(JSON.parse(init?.body as string)).toEqual({
        fromWalletId: 'w_from',
        toWalletId: 'w_to',
        token: 'USDC',
        amount: '1000000',
        chain: 'EVM',
        chainId: 8453,
        awaitResult: false,
        correlationId: 'corr_123',
        agentComment: 'rebalance run',
      })
    })

    it('returns PENDING result when awaitResult is false', async () => {
      fetchSpy = mockFetch(200, { data: PENDING_RESULT })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().transfers.send({
        fromWalletId: 'w_from',
        toWalletId: 'w_to',
        token: 'SOL',
        amount: '500000',
        chain: 'SVM',
        awaitResult: false,
      })

      expect(result.status).toBe('PENDING')
      expect(result.taskId).toBe('task_def')
    })
  })

  describe('retireWallet', () => {
    it('POSTs to /transfers/retire-wallet with correct body shape', async () => {
      const retireResult: TransferResult = {
        ...SUCCESS_RESULT,
        willArchiveOnSuccess: true,
      }
      fetchSpy = mockFetch(200, { data: retireResult })
      vi.stubGlobal('fetch', fetchSpy)

      const result = await createClient().transfers.retireWallet({
        fromWalletId: 'w_old',
        toWalletId: 'w_new',
        token: 'SOL',
        chain: 'SVM',
      })

      expect(result).toEqual(retireResult)
      expect(result.willArchiveOnSuccess).toBe(true)

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe(`${BASE_URL}/api/v2/transfers/retire-wallet`)
      expect(init?.method).toBe('POST')
      expect(JSON.parse(init?.body as string)).toEqual({
        fromWalletId: 'w_old',
        toWalletId: 'w_new',
        token: 'SOL',
        chain: 'SVM',
      })
    })

    it('includes optional fields when provided', async () => {
      fetchSpy = mockFetch(200, { data: { ...SUCCESS_RESULT, willArchiveOnSuccess: true } })
      vi.stubGlobal('fetch', fetchSpy)

      await createClient().transfers.retireWallet({
        fromWalletId: 'w_old',
        toWalletId: 'w_new',
        token: 'ETH',
        chain: 'EVM',
        chainId: 56,
        awaitResult: true,
        correlationId: 'retire_456',
        agentComment: 'retiring old wallet',
      })

      const [, init] = fetchSpy.mock.calls[0]
      expect(JSON.parse(init?.body as string)).toEqual({
        fromWalletId: 'w_old',
        toWalletId: 'w_new',
        token: 'ETH',
        chain: 'EVM',
        chainId: 56,
        awaitResult: true,
        correlationId: 'retire_456',
        agentComment: 'retiring old wallet',
      })
    })
  })
})
