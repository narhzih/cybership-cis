// UPS OAuth types
export interface UPSTokenResponse {
  token_type: string
  issued_at: string
  client_id: string
  access_token: string
  scope: string
  expires_in: string
  refresh_count: string
  status: string
}

// UPS Rating API types
export interface UPSRateRequest {
  RateRequest: {
    Request: {
      RequestOption: 'Rate' | 'Shop'
      SubVersion?: string
      TransactionReference?: { CustomerContext?: string }
    }
    Shipment: UPSShipment
  }
}

export interface UPSShipment {
  Shipper: UPSParty
  ShipTo: UPSParty
  ShipFrom: UPSParty
  Service?: { Code: string; Description?: string }
  Package: UPSPackage[]
  ShipmentRatingOptions?: { NegotiatedRatesIndicator?: string }
}

export interface UPSParty {
  Name?: string
  ShipperNumber?: string
  Address: {
    AddressLine: string[]
    City: string
    StateProvinceCode: string
    PostalCode: string
    CountryCode: string
    ResidentialAddressIndicator?: string
  }
}

export interface UPSPackage {
  PackagingType: { Code: string; Description?: string }
  Dimensions?: {
    UnitOfMeasurement: { Code: string }
    Length: string
    Width: string
    Height: string
  }
  PackageWeight: {
    UnitOfMeasurement: { Code: string }
    Weight: string
  }
}

export interface UPSRateResponse {
  RateResponse: {
    Response: {
      ResponseStatus: { Code: string; Description: string }
      Alert?: UPSAlert | UPSAlert[]
      TransactionReference?: { CustomerContext?: string }
    }
    RatedShipment: UPSRatedShipment | UPSRatedShipment[]
  }
}

export interface UPSRatedShipment {
  Service: { Code: string; Description?: string }
  TotalCharges: { CurrencyCode: string; MonetaryValue: string }
  NegotiatedRateCharges?: {
    TotalCharge: { CurrencyCode: string; MonetaryValue: string }
  }
  GuaranteedDelivery?: {
    BusinessDaysInTransit?: string
    DeliveryByTime?: string
    ScheduledDeliveryDate?: string
  }
  RatedShipmentAlert?: UPSAlert | UPSAlert[]
}

export interface UPSAlert {
  Code: string
  Description: string
}

export interface UPSErrorResponse {
  response: {
    errors: Array<{ code: string; message: string }>
  }
}

// UPS code mappings
export const UPS_SERVICE_CODES: Record<string, string> = {
  '01': 'UPS Next Day Air',
  '02': 'UPS 2nd Day Air',
  '03': 'UPS Ground',
  '07': 'UPS Worldwide Express',
  '08': 'UPS Worldwide Expedited',
  '11': 'UPS Standard',
  '12': 'UPS 3 Day Select',
  '13': 'UPS Next Day Air Saver',
  '14': 'UPS Next Day Air Early',
  '54': 'UPS Worldwide Express Plus',
  '59': 'UPS 2nd Day Air A.M.',
  '65': 'UPS Worldwide Saver',
}

export const UPS_PACKAGING_CODES: Record<string, string> = {
  CUSTOMER: '02',
  LETTER: '01',
  TUBE: '03',
  PAK: '04',
  BOX: '21',
}
