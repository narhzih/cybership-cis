import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '../carriers/ups/__mocks__/server.js';
import { upsErrorHandlers } from '../carriers/ups/__mocks__/ups.handlers.js';
import { UPSProvider } from '../carriers/ups/ups.provider.js';
import { HttpClient } from '../http/client.js';
import { ErrorCode, isCarrierError } from '../types/errors.js';
import type { RateRequest } from '../carriers/carrier.types.js';
import type { UPSConfig } from '../carriers/ups/ups.config.js';

const testConfig: UPSConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    accountNumber: 'TEST123',
    useSandbox: true,
};

const testRequest: RateRequest = {
    origin: {
        street: ['123 Main St'],
        city: 'Atlanta',
        state: 'GA',
        postalCode: '30301',
        country: 'US',
    },
    destination: {
        street: ['456 Oak Ave'],
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'US',
    },
    packages: [
        {
            weight: 5,
            weightUnit: 'LBS',
            dimensions: { length: 10, width: 8, height: 6, unit: 'IN' },
        },
    ],
};

describe('UPSProvider', () => {
    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    it('returns rate quotes for a valid request', async () => {
        const provider = new UPSProvider(testConfig, new HttpClient());
        const quotes = await provider.getRates(testRequest);

        expect(quotes).toHaveLength(3);
        expect(quotes[0]).toMatchObject({
            carrier: 'ups',
            serviceCode: '03',
            serviceName: 'UPS Ground',
            currency: 'USD',
        });
        expect(quotes[0].totalAmount).toBe(15.45);
        expect(quotes[0].negotiatedAmount).toBe(12.35);
    });

    it('throws validation error for invalid request', async () => {
        const provider = new UPSProvider(testConfig, new HttpClient());
        const invalidRequest = { ...testRequest, packages: [] };

        await expect(provider.getRates(invalidRequest)).rejects.toMatchObject({
            code: ErrorCode.VALIDATION_ERROR,
        });
    });

    it('throws auth error on 401', async () => {
        server.use(upsErrorHandlers.authError);

        const provider = new UPSProvider({ ...testConfig, clientId: 'invalid' }, new HttpClient());

        try {
            await provider.getRates(testRequest);
            expect.fail('Should have thrown');
        } catch (error) {
            expect(isCarrierError(error)).toBe(true);
            if (isCarrierError(error)) {
                expect(error.code).toBe(ErrorCode.AUTH_ERROR);
                expect(error.httpStatus).toBe(401);
            }
        }
    });

    it('throws rate limit error on 429', async () => {
        server.use(upsErrorHandlers.rateLimitError);

        const provider = new UPSProvider(testConfig, new HttpClient());

        try {
            await provider.getRates(testRequest);
            expect.fail('Should have thrown');
        } catch (error) {
            expect(isCarrierError(error)).toBe(true);
            if (isCarrierError(error)) {
                expect(error.code).toBe(ErrorCode.RATE_LIMIT_ERROR);
                expect(error.httpStatus).toBe(429);
            }
        }
    });

    it('throws carrier error on 400', async () => {
        server.use(upsErrorHandlers.carrierError);

        const provider = new UPSProvider(testConfig, new HttpClient());

        try {
            await provider.getRates(testRequest);
            expect.fail('Should have thrown');
        } catch (error) {
            expect(isCarrierError(error)).toBe(true);
            if (isCarrierError(error)) {
                expect(error.code).toBe(ErrorCode.CARRIER_ERROR);
                expect(error.carrierCode).toBe('111057');
            }
        }
    });
});
