import { RateRequest, RateQuote, ServiceLevel, CarrierName, Address, Package } from '../carrier.types.js';
import { UPSRateRequest, UPSRateResponse, UPSRatedShipment, UPSParty, UPSPackage, UPSAlert, UPS_SERVICE_CODES, UPS_PACKAGING_CODES } from './ups.types.js';

const SERVICE_LEVEL_TO_CODE: Record<ServiceLevel, string> = {
    [ServiceLevel.GROUND]: '03',
    [ServiceLevel.THREE_DAY_SELECT]: '12',
    [ServiceLevel.SECOND_DAY_AIR]: '02',
    [ServiceLevel.SECOND_DAY_AIR_AM]: '59',
    [ServiceLevel.NEXT_DAY_AIR_SAVER]: '13',
    [ServiceLevel.NEXT_DAY_AIR]: '01',
    [ServiceLevel.NEXT_DAY_AIR_EARLY]: '14',
    [ServiceLevel.WORLDWIDE_EXPRESS]: '07',
    [ServiceLevel.WORLDWIDE_EXPEDITED]: '08',
    [ServiceLevel.WORLDWIDE_SAVER]: '65',
    [ServiceLevel.STANDARD_INTERNATIONAL]: '11',
};

const CODE_TO_SERVICE_LEVEL: Record<string, ServiceLevel> = {
    '01': ServiceLevel.NEXT_DAY_AIR,
    '02': ServiceLevel.SECOND_DAY_AIR,
    '03': ServiceLevel.GROUND,
    '07': ServiceLevel.WORLDWIDE_EXPRESS,
    '08': ServiceLevel.WORLDWIDE_EXPEDITED,
    '11': ServiceLevel.STANDARD_INTERNATIONAL,
    '12': ServiceLevel.THREE_DAY_SELECT,
    '13': ServiceLevel.NEXT_DAY_AIR_SAVER,
    '14': ServiceLevel.NEXT_DAY_AIR_EARLY,
    '54': ServiceLevel.WORLDWIDE_EXPRESS,
    '59': ServiceLevel.SECOND_DAY_AIR_AM,
    '65': ServiceLevel.WORLDWIDE_SAVER,
};

function toUPSParty(address: Address, shipperNumber?: string): UPSParty {
    const party: UPSParty = {
        Name: address.name,
        Address: {
            AddressLine: address.street,
            City: address.city,
            StateProvinceCode: address.state,
            PostalCode: address.postalCode,
            CountryCode: address.country,
        },
    };
    if (shipperNumber) party.ShipperNumber = shipperNumber;
    if (address.isResidential) party.Address.ResidentialAddressIndicator = '';
    return party;
}

function toUPSPackage(pkg: Package): UPSPackage {
    const code = pkg.packagingType ? UPS_PACKAGING_CODES[pkg.packagingType] : UPS_PACKAGING_CODES.CUSTOMER;

    const upsPackage: UPSPackage = {
        PackagingType: { Code: code },
        PackageWeight: {
            UnitOfMeasurement: { Code: pkg.weightUnit },
            Weight: pkg.weight.toString(),
        },
    };

    if (pkg.dimensions) {
        upsPackage.Dimensions = {
            UnitOfMeasurement: { Code: pkg.dimensions.unit },
            Length: pkg.dimensions.length.toString(),
            Width: pkg.dimensions.width.toString(),
            Height: pkg.dimensions.height.toString(),
        };
    }

    return upsPackage;
}

export function toUPSRateRequest(request: RateRequest, accountNumber: string): UPSRateRequest {
    const isShop = !request.serviceLevel;

    const shipment: UPSRateRequest['RateRequest']['Shipment'] = {
        Shipper: toUPSParty(request.origin, accountNumber),
        ShipTo: toUPSParty(request.destination),
        ShipFrom: toUPSParty(request.origin),
        Package: request.packages.map(toUPSPackage),
        ShipmentRatingOptions: { NegotiatedRatesIndicator: '' },
    };

    if (request.serviceLevel) {
        shipment.Service = { Code: SERVICE_LEVEL_TO_CODE[request.serviceLevel] };
    }

    return {
        RateRequest: {
            Request: {
                RequestOption: isShop ? 'Shop' : 'Rate',
                SubVersion: '2409',
            },
            Shipment: shipment,
        },
    };
}

function normalizeArray<T>(value: T | T[] | undefined): T[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function parseDeliveryDate(dateStr?: string): Date | undefined {
    if (!dateStr || dateStr.length !== 8) return undefined;
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1;
    const day = parseInt(dateStr.substring(6, 8), 10);
    return new Date(year, month, day);
}

function toRateQuote(rated: UPSRatedShipment): RateQuote {
    const serviceCode = rated.Service.Code;
    const serviceName = UPS_SERVICE_CODES[serviceCode] ?? rated.Service.Description ?? `UPS Service ${serviceCode}`;

    const alerts = normalizeArray(rated.RatedShipmentAlert);
    const warnings = alerts.map((a: UPSAlert) => a.Description).filter(Boolean);

    const quote: RateQuote = {
        carrier: CarrierName.UPS,
        serviceName,
        serviceCode,
        serviceLevel: CODE_TO_SERVICE_LEVEL[serviceCode] ?? null,
        totalAmount: parseFloat(rated.TotalCharges.MonetaryValue),
        currency: rated.TotalCharges.CurrencyCode,
        warnings: warnings.length > 0 ? warnings : undefined,
    };

    if (rated.NegotiatedRateCharges?.TotalCharge) {
        quote.negotiatedAmount = parseFloat(rated.NegotiatedRateCharges.TotalCharge.MonetaryValue);
    }

    if (rated.GuaranteedDelivery) {
        quote.estimatedDeliveryDate = parseDeliveryDate(rated.GuaranteedDelivery.ScheduledDeliveryDate);
        if (rated.GuaranteedDelivery.BusinessDaysInTransit) {
            quote.businessDaysInTransit = parseInt(rated.GuaranteedDelivery.BusinessDaysInTransit, 10);
        }
    }

    return quote;
}

export function toRateQuotes(response: UPSRateResponse): RateQuote[] {
    const ratedShipments = normalizeArray(response.RateResponse.RatedShipment);
    return ratedShipments.map(toRateQuote);
}
