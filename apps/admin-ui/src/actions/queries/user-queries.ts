import { queryOptions } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import {
  TBaseServerResponse,
  TUserWithRelations,
} from '@e-shop-app/packages/types';
import { TUserRoles } from '@e-shop-app/packages/constants';

export const GET_ADMIN_USERS = 'GET_ADMIN_USERS';

export const getAdminUsers = (type: TUserRoles | string = 'user') => {
  return queryOptions({
    queryKey: [GET_ADMIN_USERS, type],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<TUserWithRelations[]>
      >(`/admin/get-all-users?type=${type}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch users');
      }

      return response.data.data;
    },
  });
};
