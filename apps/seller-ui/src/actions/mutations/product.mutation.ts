import { axiosInstance } from '@/lib/axios';
import { TBaseServerResponse } from '@e-shop-app/packages/types';

import { useMutation } from '@tanstack/react-query';

export const useDeleteDiscountCodeMutation = () => {
  return useMutation({
    mutationFn: async (discountCodeId: string) => {
      const response = await axiosInstance.delete<TBaseServerResponse<any>>(
        `/product/delete-discount-code/${discountCodeId}`,
      );

      if (response.status !== 204) {
        throw new Error(
          response.data.message || 'Failed to delete discount code',
        );
      }

      return response.data;
    },
  });
};

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
