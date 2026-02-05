export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CARRIER_ERROR = 'CARRIER_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class CarrierError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly carrier: string,
    message: string,
    public readonly httpStatus?: number,
    public readonly carrierCode?: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'CarrierError'
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      carrier: this.carrier,
      message: this.message,
      httpStatus: this.httpStatus,
      carrierCode: this.carrierCode,
    }
  }
}

export function isCarrierError(error: unknown): error is CarrierError {
  return error instanceof CarrierError
}
