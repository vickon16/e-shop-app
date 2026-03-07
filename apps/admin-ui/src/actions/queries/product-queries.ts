import { axiosInstance } from '@/lib/axios';
import {
  TBaseServerResponse,
  TBaseServerResponseWithPagination,
  TPaginatedServerResponse,
  TProduct,
  TProductQueryType,
  TProductWithImagesAndShop,
} from '@e-shop-app/packages/types';
import { queryOptions } from '@tanstack/react-query';
import {
  GET_ADMIN_PRODUCTS,
  GET_ADMIN_PRODUCT_EVENTS,
} from '../base-action-constants';

export const getAdminProducts = () => {
  return queryOptions({
    queryKey: [GET_ADMIN_PRODUCTS],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<{
          paginatedResult: TPaginatedServerResponse<
            TProductWithImagesAndShop[]
          >;
          top10By: TProductQueryType;
          top10Results: TProduct[];
        }>
      >(`/product/get-all-products?page=1&limit=10&type=all&isAdmin=true`);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || 'Failed to fetch discount codes',
        );
      }

      return response.data.data;
    },
  });
};

export const getAdminProductEvents = () => {
  return queryOptions({
    queryKey: [GET_ADMIN_PRODUCT_EVENTS],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponseWithPagination<TProductWithImagesAndShop[]>
      >(`/product/get-filtered-products?page=1&limit=20&type=event`);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || 'Failed to fetch discount codes',
        );
      }

      return response.data.data;
    },
  });
};
