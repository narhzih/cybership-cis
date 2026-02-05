export interface UPSRateRequest {
    RateRequest: {
        Request: {
            RequestOption: 'Rate' | 'Shop'; // 'Rate' for specific service, 'Shop' for all available
            TransactionReference?: {
                CustomerContext?: string;
            };
        };
        PickupType?: {
            Code: string;
        };
        Shipment: UPSShipment;
    };
}

export interface UPSShipment {
    Shipper: UPSParty;
    ShipTo: UPSParty;
    ShipFrom: UPSParty;
    Service?: {
        Code: string;
        Description?: string;
    };
    Package: UPSPackage[];
    ShipmentRatingOptions?: {
        NegotiatedRatesIndicator?: string; // Presence indicates request for discounted rates
    };
}

export interface UPSParty {
    Name?: string;
    Address: {
        AddressLine: string[];
        City: string;
        StateProvinceCode: string;
        PostalCode: string;
        CountryCode: string;
    };
}

export interface UPSPackage {
    PackagingType: {
        Code: string;
    };
    Dimensions?: {
        UnitOfMeasurement: {
            Code: string;
        };
        Length: string;
        Width: string;
        Height: string;
    };
    PackageWeight: {
        UnitOfMeasurement: {
            Code: string;
        };
        Weight: string;
    };
}

export interface UPSRateResponse {
    RateResponse: {
        Response: {
            ResponseStatus: {
                Code: string;
                Description: string;
            };
            Alert?: UPSAlert | UPSAlert[];
            TransactionReference?: {
                CustomerContext?: string;
            };
        };
        RatedShipment: UPSRatedShipment[];
    };
}

export interface UPSRatedShipment {
    Service: {
        Code: string;
    };
    TotalCharges: {
        CurrencyCode: string;
        MonetaryValue: string;
    };
    NegotiatedRateCharges?: {
        TotalCharge: {
            CurrencyCode: string;
            MonetaryValue: string;
        };
    };
    GuaranteedDelivery?: {
        BusinessDaysInTransit: string;
        DeliveryByTime: string;
    };
}

export interface UPSAlert {
    Code: string;
    Description: string;
}

export interface UPSAuthResponse {
    token_type: string;
    issued_at: string;
    client_id: string;
    access_token: string;
    expires_in: string;
    status: string;
}
