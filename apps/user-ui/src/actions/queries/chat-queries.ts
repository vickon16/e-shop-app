import { axiosInstance } from '@/lib/axios';
import {
  TBaseServerResponse,
  TConversationResponse,
  TMessage,
  TPaginatedServerResponse,
} from '@e-shop-app/packages/types';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { GET_CONVERSATIONS, GET_MESSAGES } from '../base-action-constants';

export const getConversationsOptions = () => {
  return queryOptions({
    queryKey: [GET_CONVERSATIONS],
    queryFn: async () => {
      const response = await axiosInstance.get<
        TBaseServerResponse<TConversationResponse[]>
      >('/chat/get-conversations');

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || 'Failed to fetch conversations data',
        );
      }

      return response.data.data;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
  });
};

export const getMessagesInfiniteOptions = (conversationId: string) => {
  return infiniteQueryOptions({
    enabled: !!conversationId,
    queryKey: [GET_MESSAGES, conversationId],
    queryFn: async ({ pageParam }) => {
      const response = await axiosInstance.get<
        TBaseServerResponse<{
          paginatedResult: TPaginatedServerResponse<TMessage[]>;
          participants: Array<TConversationResponse['participants'][number]>;
        }>
      >(`/chat/get-messages/${conversationId}?page=${pageParam}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || 'Failed to fetch messages',
        );
      }

      return response.data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.paginatedResult.meta;
      return meta.hasNextPage ? meta.page + 1 : undefined;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
  });
};
