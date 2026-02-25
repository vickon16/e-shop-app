import { TCart } from 'src/types/product.type.js';
import { z } from './base-zod.js';

export const createPaymentIntentSchema = z.object({
  amount: z.number().min(1).openapi({
    description: 'Intent amount',
    example: '1000',
  }),
  sellerStripeAccountId: z.string().min(1).openapi({
    description: 'Seller account Id',
    example: '',
  }),
  sessionId: z.string().min(1).openapi({
    description: 'Session Id',
    example: '',
  }),
});

export type TCreatePaymentIntentSchema = z.infer<
  typeof createPaymentIntentSchema
>;

export const createPaymentSessionSchema = z.object({
  cart: z.array(z.any()),
  selectedAddressId: z.string().optional().openapi({
    description: 'Selected shipping address id',
    example: '',
  }),
  coupon: z
    .object({
      code: z.string().openapi({
        description: 'Coupon code if available',
        example: 'SAVE16',
      }),
      discountPercent: z.number().openapi({
        description: 'Discount percentage if applicable',
        example: 10,
      }),
      discountAmount: z.number().openapi({
        description: 'Discount amount if applicable',
        example: 100,
      }),
      discountedProductId: z.string().openapi({
        description: 'ID of the product eligible for discount',
        example: 'prod_12345',
      }),
    })
    .nullable(),
});

export type TCreatePaymentSessionSchema = Omit<
  z.infer<typeof createPaymentSessionSchema>,
  'cart'
> & {
  cart: TCart[];
};
