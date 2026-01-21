import { queryOptions } from '@tanstack/react-query';
import { GET_USER } from '../base-action-constants';
import { axiosInstance } from '@/lib/axios';
import { TUser, TBaseServerResponse } from '@e-shop-app/packages/types';

export const getUserOptions = () => {
  return queryOptions({
    queryKey: [GET_USER],
    queryFn: async () => {
      const response = await axiosInstance.get<TBaseServerResponse<TUser>>(
        '/auth/get-user-info',
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch user data');
      }

      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
