import { describe, expect, it } from 'vitest'
import {
  ShurikenApiError,
  ShurikenAuthError,
  ShurikenDecodeError,
  ShurikenError,
  ShurikenSessionError,
} from './errors.js'

describe('errors', () => {
  describe('ShurikenError', () => {
    it('sets message and code', () => {
      const err = new ShurikenError('test', 'TEST_CODE')
      expect(err.message).toBe('test')
      expect(err.code).toBe('TEST_CODE')
      expect(err.name).toBe('ShurikenError')
    })

    it('extends Error', () => {
      const err = new ShurikenError('test', 'TEST_CODE')
      expect(err).toBeInstanceOf(Error)
      expect(err).toBeInstanceOf(ShurikenError)
    })
  })

  describe('ShurikenAuthError', () => {
    it('has AUTH_ERROR code', () => {
      const err = new ShurikenAuthError('unauthorized')
      expect(err.code).toBe('AUTH_ERROR')
      expect(err.name).toBe('ShurikenAuthError')
    })

    it('is instanceof ShurikenError and Error', () => {
      const err = new ShurikenAuthError('unauthorized')
      expect(err).toBeInstanceOf(ShurikenError)
      expect(err).toBeInstanceOf(Error)
    })
  })

  describe('ShurikenSessionError', () => {
    it('has SESSION_ERROR code', () => {
      const err = new ShurikenSessionError('timeout')
      expect(err.code).toBe('SESSION_ERROR')
      expect(err.name).toBe('ShurikenSessionError')
    })

    it('is instanceof ShurikenError', () => {
      expect(new ShurikenSessionError('x')).toBeInstanceOf(ShurikenError)
    })
  })

  describe('ShurikenApiError', () => {
    it('preserves status, apiCode, and requestId', () => {
      const err = new ShurikenApiError('not found', 404, 'NOT_FOUND', 'req_123')
      expect(err.code).toBe('API_ERROR')
      expect(err.name).toBe('ShurikenApiError')
      expect(err.status).toBe(404)
      expect(err.apiCode).toBe('NOT_FOUND')
      expect(err.requestId).toBe('req_123')
    })

    it('requestId is optional', () => {
      const err = new ShurikenApiError('error', 500, 'INTERNAL_ERROR')
      expect(err.requestId).toBeUndefined()
    })

    it('is instanceof ShurikenError', () => {
      expect(new ShurikenApiError('x', 500, 'INTERNAL_ERROR')).toBeInstanceOf(ShurikenError)
    })
  })

  describe('ShurikenDecodeError', () => {
    it('preserves payloadSchemaId', () => {
      const err = new ShurikenDecodeError('bad payload', 'svm.token.swaps')
      expect(err.code).toBe('DECODE_ERROR')
      expect(err.name).toBe('ShurikenDecodeError')
      expect(err.payloadSchemaId).toBe('svm.token.swaps')
    })

    it('payloadSchemaId is optional', () => {
      const err = new ShurikenDecodeError('bad payload')
      expect(err.payloadSchemaId).toBeUndefined()
    })

    it('is instanceof ShurikenError', () => {
      expect(new ShurikenDecodeError('x')).toBeInstanceOf(ShurikenError)
    })
  })
})
