import { axiosInstance } from '@/lib/axios';
import { TBaseServerResponse } from '@e-shop-app/packages/types';
import { TCreateDiscountCodesSchema } from '@e-shop-app/packages/zod-schemas';

import { useMutation } from '@tanstack/react-query';

export const useCreateDiscountCodeMutation = () => {
  return useMutation({
    mutationFn: async (data: TCreateDiscountCodesSchema) => {
      const response = await axiosInstance.post<TBaseServerResponse<any>>(
        '/product/create-discount-codes',
        data,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to create discount code',
        );
      }

      return response.data;
    },
  });
};

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
