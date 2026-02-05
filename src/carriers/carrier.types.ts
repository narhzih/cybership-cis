export enum ServiceLevel {
    GROUND = 'GROUND',
    THREE_DAY_SELECT = 'THREE_DAY_SELECT',
    SECOND_DAY_AIR = 'SECOND_DAY_AIR',
    SECOND_DAY_AIR_AM = 'SECOND_DAY_AIR_AM',
    NEXT_DAY_AIR_SAVER = 'NEXT_DAY_AIR_SAVER',
    NEXT_DAY_AIR = 'NEXT_DAY_AIR',
    NEXT_DAY_AIR_EARLY = 'NEXT_DAY_AIR_EARLY',
    WORLDWIDE_EXPRESS = 'WORLDWIDE_EXPRESS',
    WORLDWIDE_EXPEDITED = 'WORLDWIDE_EXPEDITED',
    WORLDWIDE_SAVER = 'WORLDWIDE_SAVER',
    STANDARD_INTERNATIONAL = 'STANDARD_INTERNATIONAL',
}

export enum CarrierName {
    UPS = 'ups',
    FEDEX = 'fedex',
    USPS = 'usps',
}

export interface Address {
    name?: string;
    street: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isResidential?: boolean;
}

export interface PackageDimensions {
    length: number;
    width: number;
    height: number;
    unit: 'IN' | 'CM';
}

export interface Package {
    weight: number;
    weightUnit: 'LBS' | 'KGS';
    dimensions?: PackageDimensions;
    packagingType?: 'CUSTOMER' | 'LETTER' | 'TUBE' | 'PAK' | 'BOX';
}

export interface RateRequest {
    origin: Address;
    destination: Address;
    packages: Package[];
    serviceLevel?: ServiceLevel;
    shipDate?: Date;
}

export interface RateQuote {
    carrier: CarrierName;
    serviceName: string;
    serviceCode: string;
    serviceLevel: ServiceLevel | null;
    totalAmount: number;
    currency: string;
    estimatedDeliveryDate?: Date;
    businessDaysInTransit?: number;
    negotiatedAmount?: number;
    warnings?: string[];
}
