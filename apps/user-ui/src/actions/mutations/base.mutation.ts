import { axiosInstance } from '@/lib/axios';
import { type TBaseServerResponse } from '@/types';
import { useMutation } from '@tanstack/react-query';

export const useBaseMutation = <TData, TResponse>(props: {
  endpoint: string;
  method?: 'post' | 'put' | 'patch';
  defaultMessage?: string;
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
      >(endpoint, data);

      if (!response.data.success) {
        throw new Error(response.data.message || defaultMessage);
      }

      return response.data;
    },
  });
};
