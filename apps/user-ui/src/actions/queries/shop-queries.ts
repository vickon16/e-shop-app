import { axiosInstance } from '@/lib/axios';
import { TAvatar, TBaseServerResponse } from '@e-shop-app/packages/types';
import { queryOptions } from '@tanstack/react-query';
import { GET_TOP_SHOPS } from '../base-action-constants';

export const getTopShopsQueryOptions = () => {
  return queryOptions({
    queryKey: [GET_TOP_SHOPS],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<
          {
            id: string;
            name: string;
            ratings: number;
            coverBanner: string | null;
            address: string;
            category: string;
            avatar: TAvatar | null;
            totalSales: number;
          }[]
        >
      >(`/product/get-top-shops`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch top shops');
      }

      return response.data.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
