import { axiosInstance } from '@/lib/axios';
import { queryOptions } from '@tanstack/react-query';
import { GET_USER_ORDERS } from '../base-action-constants';
import {
  TBaseServerResponse,
  TOrderWithRelations,
} from '@e-shop-app/packages/types';

export const getUserOrdersOptions = () => {
  return queryOptions({
    queryKey: [GET_USER_ORDERS],
    queryFn: async () => {
      const response =
        await axiosInstance.get<TBaseServerResponse<TOrderWithRelations[]>>(
          '/order/user-orders',
        );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch user orders');
      }

      return response.data.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
