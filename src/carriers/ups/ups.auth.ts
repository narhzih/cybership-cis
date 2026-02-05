import { HttpClient } from '../../http/client.js'
import { CarrierError, ErrorCode } from '../../types/errors.js'
import { UPSConfig, getUPSUrls } from './ups.config.js'
import { UPSTokenResponse, UPSErrorResponse } from './ups.types.js'

const CARRIER = 'ups'
const REFRESH_BUFFER_SECONDS = 300

interface CachedToken {
  accessToken: string
  expiresAt: number
}

export class UPSTokenManager {
  private cache: CachedToken | null = null
  private pendingRequest: Promise<string> | null = null

  constructor(private httpClient: HttpClient) {}

  async getToken(config: UPSConfig): Promise<string> {
    if (this.cache && this.isTokenValid(this.cache)) {
      return this.cache.accessToken
    }

    if (this.pendingRequest) {
      return this.pendingRequest
    }

    this.pendingRequest = this.fetchToken(config)

    try {
      return await this.pendingRequest
    } finally {
      this.pendingRequest = null
    }
  }

  clearCache(): void {
    this.cache = null
  }

  private isTokenValid(token: CachedToken): boolean {
    return Date.now() < token.expiresAt - REFRESH_BUFFER_SECONDS * 1000
  }

  private async fetchToken(config: UPSConfig): Promise<string> {
    const urls = getUPSUrls(config.useSandbox)
    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')

    const response = await this.httpClient.request<UPSTokenResponse | UPSErrorResponse>(
      urls.authUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
        body: 'grant_type=client_credentials',
      }
    )

    if (response.status !== 200) {
      const errorData = response.data as UPSErrorResponse
      const errorMessage = errorData?.response?.errors?.[0]?.message ?? 'Authentication failed'
      const errorCode = errorData?.response?.errors?.[0]?.code

      throw new CarrierError(ErrorCode.AUTH_ERROR, CARRIER, errorMessage, response.status, errorCode)
    }

    const data = response.data as UPSTokenResponse

    if (data.status !== 'approved' || !data.access_token) {
      throw new CarrierError(
        ErrorCode.AUTH_ERROR,
        CARRIER,
        `Token request failed with status: ${data.status}`,
        response.status
      )
    }

    const expiresInSeconds = parseInt(data.expires_in, 10)
    this.cache = {
      accessToken: data.access_token,
      expiresAt: Date.now() + expiresInSeconds * 1000,
    }

    return data.access_token
  }
}
