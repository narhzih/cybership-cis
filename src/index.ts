export * from './types/index.js';
export * from './carriers/index.js';
export * from './validation/schemas.js';
export { HttpClient } from './http/client.js';
export { loadAppConfig } from './config/index.js';
export type { AppConfig } from './config/index.js';

import { loadAppConfig } from './config/index.js';
import { HttpClient } from './http/client.js';
import { CarrierRegistry } from './carriers/carrier.registry.js';
import { UPSProvider, loadUPSConfig } from './carriers/ups/index.js';

export interface CarrierService {
    registry: CarrierRegistry;
    getRates: CarrierRegistry['getRatesFromAll'];
}

export function createCarrierService(): CarrierService {
    const appConfig = loadAppConfig();
    const httpClient = new HttpClient(appConfig.httpTimeoutMs);

    const registry = new CarrierRegistry();

    // Register UPS since that's the only thing we have right now.
    const upsConfig = loadUPSConfig();
    registry.register(new UPSProvider(upsConfig, httpClient));

    return {
        registry,
        getRates: registry.getRatesFromAll.bind(registry),
    };
}
