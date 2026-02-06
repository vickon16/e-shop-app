import { axiosInstance } from '@/lib/axios';
import {
  TBaseServerResponse,
  TPaginatedServerResponse,
  TProduct,
  TProductQueryType,
  TProductWithImagesAndShop,
} from '@e-shop-app/packages/types';
import { queryOptions } from '@tanstack/react-query';
import { GET_PRODUCTS } from '../base-action-constants';

export const getProductsQueryOptions = (type: TProductQueryType) => {
  return queryOptions({
    queryKey: [GET_PRODUCTS, type],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<{
          paginatedResult: TPaginatedServerResponse<
            TProductWithImagesAndShop[]
          >;
          top10By: TProductQueryType;
          top10Results: TProduct[];
        }>
      >(`/product/get-all-products?page=1&limit=10&type=${type}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch products');
      }

      return response.data.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
