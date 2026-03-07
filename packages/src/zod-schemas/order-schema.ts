import { TCart } from 'src/types/product.type.js';
import { z } from './base-zod.js';
import { discountTypes, ORDER_STATUSES } from '../constants/other-constants.js';
import { requiredString } from './base.schemas.js';

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
  cart: z.array(z.any()).nonempty('Cart cannot be empty'),
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
      discountValue: z.number().openapi({
        description: 'Discount value if applicable',
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
      discountType: z.enum(discountTypes).openapi({
        description: 'Type of discount',
        example: 'percentage',
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

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(ORDER_STATUSES).openapi({
    description: 'New order status',
    example: ORDER_STATUSES[0],
  }),
});

export type TUpdateOrderStatusSchema = z.infer<typeof updateOrderStatusSchema>;

export const verifyCouponSchema = z.object({
  couponCode: requiredString('Coupon Code', 3, 20),
  cart: createPaymentSessionSchema.shape.cart,
});

export type TVerifyCouponSchema = Omit<
  z.infer<typeof verifyCouponSchema>,
  'cart'
> & {
  cart: TCart[];
};
