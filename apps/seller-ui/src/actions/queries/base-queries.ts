import { queryOptions } from '@tanstack/react-query';
import { GET_SELLER } from '../base-action-constants';
import { axiosInstance } from '@/lib/axios';
import {
  TBaseServerResponse,
  TSellerWithRelations,
} from '@e-shop-app/packages/types';

export const getSellerOptions = () => {
  return queryOptions({
    queryKey: [GET_SELLER],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<TSellerWithRelations>
      >('/auth/get-seller-info');

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch seller data');
      }

      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
