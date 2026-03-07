import { queryOptions } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { TBaseServerResponse, TNotification } from '@e-shop-app/packages/types';

export const GET_ALL_NOTIFICATIONS = 'GET_ALL_NOTIFICATIONS';

export const getAllNotifications = () => {
  return queryOptions({
    queryKey: [GET_ALL_NOTIFICATIONS],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<TNotification[]>
      >('/admin/get-all-notifications');

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || 'Failed to fetch notifications',
        );
      }

      return response.data.data;
    },
  });
};
