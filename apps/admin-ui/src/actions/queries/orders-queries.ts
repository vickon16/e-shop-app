import { axiosInstance } from '@/lib/axios';
import {
  TBaseServerResponse,
  TDiscountCodes,
  TOrderWithRelations,
} from '@e-shop-app/packages/types';
import { queryOptions } from '@tanstack/react-query';
import { GET_ORDER_DETAILS, GET_ADMIN_ORDERS } from '../base-action-constants';

export const getAdminOrders = () => {
  return queryOptions({
    queryKey: [GET_ADMIN_ORDERS],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<TOrderWithRelations[]>
      >('/order/get-admin-orders');

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch orders');
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
