import { axiosInstance } from '@/lib/axios';
import {
  TBaseServerResponse,
  TDiscountCodes,
  TOrderWithRelations,
} from '@e-shop-app/packages/types';
import { queryOptions } from '@tanstack/react-query';
import { GET_ORDER_DETAILS, GET_SELLER_ORDERS } from '../base-action-constants';

export const getSellerOrders = () => {
  return queryOptions({
    queryKey: [GET_SELLER_ORDERS],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<TOrderWithRelations[]>
      >('/order/seller-orders');

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || 'Failed to fetch seller orders',
        );
      }

      return response.data.data;
    },
  });
};

export const getOrderDetails = (orderId: string) => {
  return queryOptions({
    queryKey: [GET_ORDER_DETAILS, orderId],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<{
          order: TOrderWithRelations;
          coupon: TDiscountCodes | null;
        }>
      >(`/order/order-details/${orderId}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || 'Failed to fetch order details',
        );
      }

      return response.data.data;
    },
    enabled: !!orderId,
  });
};
