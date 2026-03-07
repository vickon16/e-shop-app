import { queryOptions } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import {
  TBaseServerResponse,
  TSellerWithRelations,
} from '@e-shop-app/packages/types';

export const GET_ADMIN_SELLERS = 'GET_ADMIN_SELLERS';

export const getAdminSellers = () => {
  return queryOptions({
    queryKey: [GET_ADMIN_SELLERS],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<TSellerWithRelations[]>
      >('/admin/get-all-sellers');

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch sellers');
      }

      return response.data.data;
    },
  });
};
