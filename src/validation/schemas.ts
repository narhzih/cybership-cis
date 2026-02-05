import { z } from 'zod';
import { ServiceLevel } from '../carriers/carrier.types.js';

export const AddressSchema = z.object({
    name: z.string().optional(),
    street: z.array(z.string().min(1)).min(1).max(3),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().length(2),
    isResidential: z.boolean().optional(),
});

export const PackageDimensionsSchema = z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(['IN', 'CM']),
});

export const PackageSchema = z.object({
    weight: z.number().positive().max(150),
    weightUnit: z.enum(['LBS', 'KGS']),
    dimensions: PackageDimensionsSchema.optional(),
    packagingType: z.enum(['CUSTOMER', 'LETTER', 'TUBE', 'PAK', 'BOX']).optional(),
});

export const RateRequestSchema = z.object({
    origin: AddressSchema,
    destination: AddressSchema,
    packages: z.array(PackageSchema).min(1),
    serviceLevel: z.nativeEnum(ServiceLevel).optional(),
    shipDate: z.date().optional(),
});

export type ValidatedRateRequest = z.infer<typeof RateRequestSchema>;
