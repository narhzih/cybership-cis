import { CarrierProvider } from '../carrier.provider.js';
import { CarrierName, RateRequest, RateQuote } from '../carrier.types.js';
import { CarrierError, ErrorCode } from '../../types/errors.js';
import { HttpClient } from '../../http/client.js';
import { RateRequestSchema } from '../../validation/schemas.js';
import { UPSConfig, getUPSUrls } from './ups.config.js';
import { UPSTokenManager } from './ups.auth.js';
import { toUPSRateRequest, toRateQuotes } from './ups.mapper.js';
import { UPSRateResponse, UPSErrorResponse } from './ups.types.js';

export class UPSProvider extends CarrierProvider {
    readonly name = CarrierName.UPS;
    private tokenManager: UPSTokenManager;

    constructor(
        private config: UPSConfig,
        private httpClient: HttpClient,
    ) {
        super();
        this.tokenManager = new UPSTokenManager(httpClient);
    }

    async getRates(request: RateRequest): Promise<RateQuote[]> {
        const validated = this.validateRequest(request);
        const upsRequest = toUPSRateRequest(validated, this.config.accountNumber);
        const token = await this.tokenManager.getToken(this.config);

        const urls = getUPSUrls(this.config.useSandbox);
        const requestOption = validated.serviceLevel ? 'Rate' : 'Shop';
        const endpoint = `${urls.baseUrl}/rating/v2409/${requestOption}`;

        const response = await this.httpClient.request<UPSRateResponse | UPSErrorResponse>(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                transId: crypto.randomUUID(),
                transactionSrc: 'cybership',
            },
            body: JSON.stringify(upsRequest),
        });

        this.handleErrorResponse(response.status, response.data);

        return toRateQuotes(response.data as UPSRateResponse);
    }

    private validateRequest(request: RateRequest): RateRequest {
        const result = RateRequestSchema.safeParse(request);
        if (!result.success) {
            const messages = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
            throw new CarrierError(ErrorCode.VALIDATION_ERROR, this.name, `Invalid rate request: ${messages.join('; ')}`);
        }
        return result.data;
    }

    private handleErrorResponse(status: number, data: UPSRateResponse | UPSErrorResponse): void {
        if (status >= 200 && status < 300) return;

        const errorData = data as UPSErrorResponse;
        const firstError = errorData?.response?.errors?.[0];
        const message = firstError?.message ?? `UPS API error (HTTP ${status})`;
        const code = firstError?.code;

        if (status === 401) {
            this.tokenManager.clearCache();
            throw new CarrierError(ErrorCode.AUTH_ERROR, this.name, message, status, code);
        }

        if (status === 429) {
            throw new CarrierError(ErrorCode.RATE_LIMIT_ERROR, this.name, message, status, code);
        }

        throw new CarrierError(ErrorCode.CARRIER_ERROR, this.name, message, status, code);
    }
}
