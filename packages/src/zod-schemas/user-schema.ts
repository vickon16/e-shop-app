import { z } from './base-zod.js';

export const shippingAddressSchema = z.object({
  label: z.string().min(1, 'Label is required').openapi({
    description: 'Label for the shipping address (e.g., Home, Work)',
    example: 'Home',
  }),
  name: z.string().min(1, 'Name is required').openapi({
    description: 'Name of the recipient for the shipping address',
    example: 'John Doe',
  }),
  street: z.string().min(1, 'Street is required').openapi({
    description: 'Street address for the shipping address',
    example: '123 Main St',
  }),
  city: z.string().min(1, 'City is required').openapi({
    description: 'City for the shipping address',
    example: 'New York',
  }),
  state: z.string().min(1, 'State is required').openapi({
    description: 'State for the shipping address',
    example: 'NY',
  }),
  zipCode: z.string().min(1, 'Zip code is required').openapi({
    description: 'Zip code for the shipping address',
    example: '10001',
  }),
  country: z.string().min(1, 'Country is required').openapi({
    description: 'Country for the shipping address',
    example: 'USA',
  }),
  isDefault: z.enum(['true', 'false']).openapi({
    description: 'Indicates if this is the default shipping address',
    example: 'true',
  }),
});

export type TShippingAddressSchema = z.infer<typeof shippingAddressSchema>;
