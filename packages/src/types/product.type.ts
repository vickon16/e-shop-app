import { TCreatePaymentSessionSchema } from 'src/zod-schemas/order-schema.js';
import { TImages, TProduct } from './drizzle.type.js';

export type TProductQueryType =
  | 'all'
  | 'latest'
  | 'top-sales'
  | 'on-sale'
  | 'new-arrivals';

export type TFilteredProductType = 'default' | 'event';

export type TCart = Pick<TProduct, 'id' | 'title' | 'shopId' | 'salePrice'> & {
  images: TImages[];
  quantity?: number;
  selectedOptions?: {
    color?: string;
    size?: string;
  };
};

export type TPaymentSession = {
  cart: TCart[];
  sessionId: string;
  userId: string;
  totalAmount: number;
  sellersData: {
    shopId: string;
    stripeAccountId: string | null;
    sellerId: string;
  }[];
  shippingAddressId?: string | null;
  coupon?: TCreatePaymentSessionSchema['coupon'];
};
