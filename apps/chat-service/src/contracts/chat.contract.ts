import { userRoles } from '@e-shop-app/packages/constants';
import {
  isAdminAuthenticatedMiddleware,
  isCombinedAuthenticatedMiddleware,
  isUserAuthenticatedMiddleware,
} from '@e-shop-app/packages/middlewares';
import { RouteContract } from '@e-shop-app/packages/types';
import { paginationDtoQueryArray } from '@e-shop-app/packages/utils';
import {
  addNewAdminSchema,
  baseApiResponse,
  createNewConversationSchema,
} from '@e-shop-app/packages/zod-schemas';

const baseContract = {
  tags: ['Chat'],
  responses: {
    200: baseApiResponse,
  },
};

export const createNewConversationContract = {
  ...baseContract,
  method: 'post',
  path: '/api/chat/create-new-conversation',
  routePath: '/create-new-conversation',
  request: {
    body: createNewConversationSchema,
  },
  otherMiddlewares: [isCombinedAuthenticatedMiddleware],
  responses: {
    201: baseApiResponse,
  },
} as const satisfies RouteContract;

export const getConversationsContract = {
  ...baseContract,
  method: 'get',
  path: '/api/chat/get-conversations',
  routePath: '/get-conversations',
  otherMiddlewares: [isCombinedAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const getMessagesContract = {
  ...baseContract,
  method: 'get',
  path: '/api/chat/get-messages/{conversationId}',
  routePath: '/get-messages/:conversationId',
  request: {
    params: [
      { name: 'conversationId', in: 'path', schema: { type: 'string' } },
    ],
    query: [...paginationDtoQueryArray],
  },
  otherMiddlewares: [isCombinedAuthenticatedMiddleware],
} as const satisfies RouteContract;
