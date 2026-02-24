import { queryOptions } from '@tanstack/react-query';
import {
  GET_CATEGORIES,
  GET_USER,
  GET_USER_ADDRESS,
} from '../base-action-constants';
import { axiosInstance } from '@/lib/axios';
import {
  TUserWithRelations,
  TBaseServerResponse,
  TSiteConfig,
  TUserAddress,
} from '@e-shop-app/packages/types';

export const getUserOptions = () => {
  return queryOptions({
    queryKey: [GET_USER],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<TUserWithRelations>
      >('/auth/get-user-info');

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch user data');
      }

      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const getCategoriesOptions = () => {
  return queryOptions({
    queryKey: [GET_CATEGORIES],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<{
          categories: TSiteConfig['categories'];
          subCategories: TSiteConfig['subCategories'];
        }>
      >(`/product/get-categories`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch categories');
      }

      return response.data.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const getUserAddressOptions = () => {
  return queryOptions({
    queryKey: [GET_USER_ADDRESS],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<TUserAddress[]>
      >(`/auth/get-user-addresses`);

      if (!response.data.success || !Array.isArray(response.data.data)) {
        throw new Error(
          response.data.message || 'Failed to fetch user addresses',
        );
      }

      return response.data.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
