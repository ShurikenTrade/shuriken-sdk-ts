/** Base error class for all Shuriken SDK errors. */
export class ShurikenError extends Error {
  constructor(
    message: string,
    /** Error code (e.g. `AUTH_ERROR`, `API_ERROR`). */
    public readonly code: string
  ) {
    super(message)
    this.name = 'ShurikenError'
  }
}

/** Thrown when authentication fails (HTTP 401). */
export class ShurikenAuthError extends ShurikenError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR')
    this.name = 'ShurikenAuthError'
  }
}

/** Thrown when the WebSocket session bootstrap or connection fails. */
export class ShurikenSessionError extends ShurikenError {
  constructor(message: string) {
    super(message, 'SESSION_ERROR')
    this.name = 'ShurikenSessionError'
  }
}

/** Thrown when an HTTP API call returns a non-2xx response (other than 401). */
export class ShurikenApiError extends ShurikenError {
  constructor(
    message: string,
    /** HTTP status code. */
    public readonly status: number,
    /** API request ID for support reference. */
    public readonly requestId?: string
  ) {
    super(message, 'API_ERROR')
    this.name = 'ShurikenApiError'
  }
}

/** Thrown when a WebSocket message payload cannot be decoded. */
export class ShurikenDecodeError extends ShurikenError {
  constructor(
    message: string,
    /** Schema ID of the payload that failed to decode. */
    public readonly payloadSchemaId?: string
  ) {
    super(message, 'DECODE_ERROR')
    this.name = 'ShurikenDecodeError'
  }
}
