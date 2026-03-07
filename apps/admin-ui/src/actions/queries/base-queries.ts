import { axiosInstance } from '@/lib/axios';
import {
  TBaseServerResponse,
  TUserWithRelations,
} from '@e-shop-app/packages/types';
import { queryOptions } from '@tanstack/react-query';
import { GET_ADMIN } from '../base-action-constants';

export const getAdminOptions = () => {
  return queryOptions({
    queryKey: [GET_ADMIN],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<TUserWithRelations>
      >('/admin/get-admin-info');

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch admin data');
      }

      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
