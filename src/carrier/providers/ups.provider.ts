import { CarrierProvider, CarrierName } from './carrier.provider';
import { RateRequest, RateQuote } from './carrier.dto';
import { UPSRateRequest } from './ups.dto';

/**
 * UPS API Data Structures
 * Based on: https://developer.ups.com
 */

export class UPSProvider extends CarrierProvider {
    readonly name = CarrierName.UPS;
    private config: any;

    constructor(config: any) {
        super();
        this.config = config;
    }

    async getRates(request: RateRequest): Promise<RateQuote[]> {
        // 1. Validate internal request (e.g., via Zod)
        // 2. Map Internal -> UPS Request Format
        const upsRequest = this.mapToUPSRequest(request);

        // 3. Get Auth Token (Internal UPS logic)
        // 4. Make HTTP Call to UPS

        // 5. Map UPS Response -> Internal RateQuote[]
        // return this.mapToInternalResponse(rawUpsResponse);
        return []; // Placeholder
    }

    private mapToUPSRequest(internal: RateRequest): UPSRateRequest {
        // Logic to turn numbers into strings and nested objects
        return {} as UPSRateRequest;
    }
}
