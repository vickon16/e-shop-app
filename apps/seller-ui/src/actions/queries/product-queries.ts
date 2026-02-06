import { queryOptions } from '@tanstack/react-query';
import {
  GET_DISCOUNT_CODES,
  GET_SHOP_PRODUCTS,
} from '../base-action-constants';
import { axiosInstance } from '@/lib/axios';
import {
  TBaseServerResponse,
  TDiscountCodes,
  TProductWithImagesAndShop,
} from '@e-shop-app/packages/types';

export const getDiscountCodes = () => {
  return queryOptions({
    queryKey: [GET_DISCOUNT_CODES],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<TDiscountCodes[]>
      >('/product/get-discount-codes');

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || 'Failed to fetch discount codes',
        );
      }

      return response.data.data;
    },
  });
};

export const getShopProducts = () => {
  return queryOptions({
    queryKey: [GET_SHOP_PRODUCTS],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<TProductWithImagesAndShop[]>
      >('/product/get-shop-products');

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || 'Failed to fetch discount codes',
        );
      }

      return response.data.data;
    },
  });
};
