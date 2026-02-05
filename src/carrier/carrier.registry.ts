import { CarrierProvider, CarrierName } from './providers/carrier.provider';

export type ProviderConstructor = new (config: any) => CarrierProvider;

export class CarrierRegistry {
    private static providers = new Map<CarrierName, CarrierProvider>();
    private static providerClasses = new Map<CarrierName, ProviderConstructor>();

    /**
     * Registers a provider class (e.g., UPSProvider) with the registry
     */
    static register(name: CarrierName, providerClass: ProviderConstructor, config: any = {}): void {
        this.providerClasses.set(name, providerClass);
        // Auto-instantiate to keep a singleton instance
        this.providers.set(name, new providerClass(config));
        console.log(`[Registry] Registered carrier: ${name}`);
    }

    /**
     * Retrieves a specific carrier provider
     */
    static getProvider(name: CarrierName): CarrierProvider {
        const provider = this.providers.get(name);
        if (!provider) {
            throw new Error(`Carrier provider '${name}' is not registered.`);
        }
        return provider;
    }

    /**
     * Useful for "Rate Shopping" - getting all registered carriers
     */
    static getAllProviders(): CarrierProvider[] {
        return Array.from(this.providers.values());
    }
}
