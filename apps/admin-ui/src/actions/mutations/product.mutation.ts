import { axiosInstance } from '@/lib/axios';
import { TBaseServerResponse } from '@e-shop-app/packages/types';

import { useMutation } from '@tanstack/react-query';

export const useDeleteRestoreProductMutation = () => {
  return useMutation({
    mutationFn: async (payload: {
      productId: string;
      type: 'delete' | 'restore';
    }) => {
      const { productId, type } = payload;
      const response = await axiosInstance.put<TBaseServerResponse<any>>(
        `/product/${type}-product/${productId}`,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            `An error occurred while ${type === 'delete' ? 'deleting' : 'restoring'} this product`,
        );
      }

      return response.data;
    },
  });
};

export const useDeleteRestoreShopMutation = () => {
  return useMutation({
    mutationFn: async (type: 'delete' | 'restore') => {
      const response = await axiosInstance.put<TBaseServerResponse<any>>(
        `/product/${type}-shop`,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            `An error occurred while ${type === 'delete' ? 'deleting' : 'restoring'} your shop`,
        );
      }

      return response.data;
    },
  });
};
