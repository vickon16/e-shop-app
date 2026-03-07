import { axiosInstance } from '@/lib/axios';
import { TBaseServerResponse } from '@e-shop-app/packages/types';

import { useMutation } from '@tanstack/react-query';
import { AxiosRequestConfig } from 'axios';

export const useBaseMutation = <TData, TResponse>(props: {
  endpoint: string;
  method?: 'post' | 'put' | 'patch' | 'delete';
  defaultMessage?: string;
  config?: AxiosRequestConfig<any>;
}) => {
  const {
    endpoint,
    method = 'post',
    defaultMessage = 'An error occurred',
  } = props;
  return useMutation({
    mutationFn: async (data: TData) => {
      const response = await axiosInstance[method]<
        TBaseServerResponse<TResponse>
      >(endpoint, data, props.config);

      if (!response.data.success) {
        throw new Error(response.data.message || defaultMessage);
      }

      return response.data;
    },
  });
};

export const useDeleteProductImageMutation = () => {
  return useMutation({
    mutationFn: async (data: { fileId: string }) => {
      const { fileId } = data;
      const response = await axiosInstance.delete<TBaseServerResponse<any>>(
        `/product/delete-product-image/${fileId}`,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            'An error occurred while deleting the product image',
        );
      }

      return response.data;
    },
  });
};
