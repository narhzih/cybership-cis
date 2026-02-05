import { RateRequest, RateQuote, CarrierName } from './carrier.types.js';

export abstract class CarrierProvider {
    abstract readonly name: CarrierName;
    abstract getRates(request: RateRequest): Promise<RateQuote[]>;
}
