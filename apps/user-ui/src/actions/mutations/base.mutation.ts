import { axiosInstance } from '@/lib/axios';
import { TBaseServerResponse } from '@e-shop-app/packages/types';
import { useMutation } from '@tanstack/react-query';
import { AxiosRequestConfig } from 'axios';
import { TKafkaProductEventSchemaType } from '@e-shop-app/packages/libs/kafka';

export const useBaseMutation = <TData, TResponse>(props: {
  endpoint: string;
  method?: 'post' | 'put' | 'patch';
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

export const useSendKafkaEvent = () => {
  return useMutation({
    mutationFn: async (event: TKafkaProductEventSchemaType) => {
      const response = await axiosInstance.post<TBaseServerResponse<null>>(
        '/kafka/send-event',
        event,
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send event');
      }

      return response.data;
    },
  });
};
