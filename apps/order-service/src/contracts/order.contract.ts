import { isCombinedAuthenticatedMiddleware } from '@e-shop-app/packages/middlewares';
import { RouteContract } from '@e-shop-app/packages/types/base.type';
import {
  baseApiResponse,
  createPaymentIntentSchema,
  createPaymentSessionSchema,
} from '@e-shop-app/packages/zod-schemas';

const baseContract = {
  tags: ['Order'],
  responses: {
    200: baseApiResponse,
  },
};

export const createPaymentIntentContract = {
  ...baseContract,
  method: 'post',
  path: '/api/order/create-payment-intent',
  routePath: '/create-payment-intent',
  request: {
    body: createPaymentIntentSchema,
  },
  otherMiddlewares: [isCombinedAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const createPaymentSessionContract = {
  ...baseContract,
  method: 'post',
  path: '/api/order/create-payment-session',
  routePath: '/create-payment-session',
  request: {
    body: createPaymentSessionSchema,
  },
  otherMiddlewares: [isCombinedAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const verifyPaymentSessionContract = {
  ...baseContract,
  method: 'get',
  path: '/api/order/verify-payment-session/{sessionId}',
  routePath: '/verify-payment-session/:sessionId',
  request: {
    params: [{ name: 'sessionId', in: 'path', schema: { type: 'string' } }],
  },
  otherMiddlewares: [isCombinedAuthenticatedMiddleware],
} as const satisfies RouteContract;
