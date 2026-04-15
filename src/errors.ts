export class ShurikenError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message)
    this.name = 'ShurikenError'
  }
}

export class ShurikenAuthError extends ShurikenError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR')
    this.name = 'ShurikenAuthError'
  }
}

export class ShurikenSessionError extends ShurikenError {
  constructor(message: string) {
    super(message, 'SESSION_ERROR')
    this.name = 'ShurikenSessionError'
  }
}

export class ShurikenDecodeError extends ShurikenError {
  constructor(
    message: string,
    public readonly payloadSchemaId?: string
  ) {
    super(message, 'DECODE_ERROR')
    this.name = 'ShurikenDecodeError'
  }
}
