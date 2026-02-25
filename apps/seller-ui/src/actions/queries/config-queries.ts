import { queryOptions } from '@tanstack/react-query';
import { GET_CATEGORIES } from '../base-action-constants';
import { axiosInstance } from '@/lib/axios';
import { TBaseServerResponse, TSiteConfig } from '@e-shop-app/packages/types';

export const getCategories = () => {
  return queryOptions({
    queryKey: [GET_CATEGORIES],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<Pick<TSiteConfig, 'categories' | 'subCategories'>>
      >('/product/get-categories');

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || 'Failed to fetch categories data',
        );
      }

      return response.data.data;
    },
  });
};
