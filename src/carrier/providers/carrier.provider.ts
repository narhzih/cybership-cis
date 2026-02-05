import { RateRequest, RateQuote } from './carrier.dto';

export enum CarrierName {
    UPS = 'ups',
    FEDEX = 'fedex',
    USPS = 'usps',
}

export abstract class CarrierProvider {
    /**
     * Every provider must identify itself
     */
    abstract readonly name: CarrierName;

    /**
     * The core method required by the Cybership service.
     * Implementation handles mapping, auth, and network calls.
     */
    abstract getRates(request: RateRequest): Promise<RateQuote[]>;

    /**
     * Optional: Generic health check to see if the carrier API is up
     */
    async initialize?(): Promise<void>;
}
