import { http, HttpResponse } from 'msw';

const SANDBOX_AUTH_URL = 'https://wwwcie.ups.com/security/v1/oauth/token';
const SANDBOX_RATE_URL = 'https://wwwcie.ups.com/api/rating/v2409/*';

const mockTokenResponse = {
    token_type: 'Bearer',
    issued_at: String(Date.now()),
    client_id: 'test-client-id',
    access_token: 'mock-access-token-12345',
    scope: '',
    expires_in: '14399',
    refresh_count: '0',
    status: 'approved',
};

const mockRateResponse = {
    RateResponse: {
        Response: {
            ResponseStatus: { Code: '1', Description: 'Success' },
            Alert: [{ Code: '110971', Description: 'Your invoice may vary from the displayed reference rates' }],
        },
        RatedShipment: [
            {
                Service: { Code: '03', Description: 'UPS Ground' },
                TotalCharges: { CurrencyCode: 'USD', MonetaryValue: '15.45' },
                NegotiatedRateCharges: {
                    TotalCharge: { CurrencyCode: 'USD', MonetaryValue: '12.35' },
                },
                GuaranteedDelivery: {
                    BusinessDaysInTransit: '5',
                    ScheduledDeliveryDate: '20250215',
                },
            },
            {
                Service: { Code: '02', Description: 'UPS 2nd Day Air' },
                TotalCharges: { CurrencyCode: 'USD', MonetaryValue: '28.90' },
                NegotiatedRateCharges: {
                    TotalCharge: { CurrencyCode: 'USD', MonetaryValue: '24.50' },
                },
                GuaranteedDelivery: {
                    BusinessDaysInTransit: '2',
                    ScheduledDeliveryDate: '20250212',
                },
            },
            {
                Service: { Code: '01', Description: 'UPS Next Day Air' },
                TotalCharges: { CurrencyCode: 'USD', MonetaryValue: '45.60' },
                NegotiatedRateCharges: {
                    TotalCharge: { CurrencyCode: 'USD', MonetaryValue: '38.75' },
                },
                GuaranteedDelivery: {
                    BusinessDaysInTransit: '1',
                    ScheduledDeliveryDate: '20250211',
                },
            },
        ],
    },
};

const mockAuthErrorResponse = {
    response: {
        errors: [{ code: '10401', message: 'Invalid/Missing Authorization Header' }],
    },
};

const mockRateLimitResponse = {
    response: {
        errors: [{ code: '10429', message: 'Too Many Requests' }],
    },
};

const mockCarrierErrorResponse = {
    response: {
        errors: [{ code: '111057', message: 'The postal code 99999 is invalid for US.' }],
    },
};

export const upsHandlers = [
    // OAuth token endpoint
    http.post(SANDBOX_AUTH_URL, ({ request }) => {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader?.startsWith('Basic ')) {
            return HttpResponse.json(mockAuthErrorResponse, { status: 401 });
        }

        // Simulate invalid credentials
        const decoded = atob(authHeader.replace('Basic ', ''));
        if (decoded.includes('invalid')) {
            return HttpResponse.json(mockAuthErrorResponse, { status: 401 });
        }

        return HttpResponse.json(mockTokenResponse);
    }),

    // Rating endpoint - success
    http.post(SANDBOX_RATE_URL, ({ request }) => {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return HttpResponse.json(mockAuthErrorResponse, { status: 401 });
        }

        return HttpResponse.json(mockRateResponse);
    }),
];

export const upsErrorHandlers = {
    authError: http.post(SANDBOX_AUTH_URL, () => {
        return HttpResponse.json(mockAuthErrorResponse, { status: 401 });
    }),

    rateLimitError: http.post(SANDBOX_RATE_URL, () => {
        return HttpResponse.json(mockRateLimitResponse, { status: 429 });
    }),

    carrierError: http.post(SANDBOX_RATE_URL, () => {
        return HttpResponse.json(mockCarrierErrorResponse, { status: 400 });
    }),

    networkError: http.post(SANDBOX_RATE_URL, () => {
        return HttpResponse.networkError('Connection refused');
    }),

    timeout: http.post(SANDBOX_RATE_URL, async () => {
        await new Promise((resolve) => setTimeout(resolve, 60000));
        return HttpResponse.json(mockRateResponse);
    }),
};

export { mockTokenResponse, mockRateResponse };
