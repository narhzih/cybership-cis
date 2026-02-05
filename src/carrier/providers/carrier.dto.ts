/**
 * Cybership Internal Domain Models
 * These are the "Clean" types used by our application.
 */

export enum ServiceLevel {
    GROUND = 'GROUND',
    NEXT_DAY_AIR = 'NEXT_DAY_AIR',
    SECOND_DAY_AIR = 'SECOND_DAY_AIR',
    // Abstracted names that map to specific carrier codes
}

export interface Address {
    street: string[];
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isResidential?: boolean;
}

export interface Package {
    weight: number; // Actual number, not string
    dimensions: {
        length: number;
        width: number;
        height: number;
        unit: 'IN' | 'CM';
    };
}

/**
 * The unified request object our service accepts
 */
export interface RateRequest {
    origin: Address;
    destination: Address;
    packages: Package[];
    serviceLevel?: ServiceLevel;
}

/**
 * The unified response object our service returns
 */
export interface RateQuote {
    carrier: string; // e.g., 'UPS'
    serviceName: string; // e.g., 'Ground'
    serviceCode: string; // The raw carrier code (03)
    totalAmount: number; // Clean number for math
    currency: string; // 'USD'
    estimatedDelivery?: Date;
}
