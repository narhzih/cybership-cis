import { CarrierProvider } from './carrier.provider.js';
import { CarrierName, RateQuote, RateRequest } from '../carriers/carrier.types.js';

export class CarrierRegistry {
    private providers = new Map<CarrierName, CarrierProvider>();

    register(provider: CarrierProvider): void {
        this.providers.set(provider.name, provider);
    }

    getProvider(name: CarrierName): CarrierProvider {
        const provider = this.providers.get(name);
        if (!provider) throw new Error(`Carrier provider '${name}' is not registered.`);
        return provider;
    }

    getAllProviders(): CarrierProvider[] {
        return Array.from(this.providers.values());
    }

    async getRatesFromAll(request: RateRequest): Promise<RateQuote[]> {
        const providers = this.getAllProviders();
        const results = await Promise.allSettled(providers.map((p) => p.getRates(request)));

        const quotes: RateQuote[] = [];
        for (const result of results) {
            if (result.status === 'fulfilled') quotes.push(...result.value);
        }
        return quotes;
    }
}
