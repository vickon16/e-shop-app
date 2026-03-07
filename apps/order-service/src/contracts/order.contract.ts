import {
  isAdminAuthenticatedMiddleware,
  isCombinedAuthenticatedMiddleware,
  isSellerAuthenticatedMiddleware,
  isUserAuthenticatedMiddleware,
} from '@e-shop-app/packages/middlewares';
import { RouteContract } from '@e-shop-app/packages/types/base.type';
import {
  baseApiResponse,
  createPaymentIntentSchema,
  createPaymentSessionSchema,
  updateOrderStatusSchema,
  verifyCouponSchema,
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

export const getSellerOrdersContract = {
  ...baseContract,
  method: 'get',
  path: '/api/order/seller-orders',
  routePath: '/seller-orders',
  otherMiddlewares: [isSellerAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const getAdminOrdersContract = {
  ...baseContract,
  method: 'get',
  path: '/api/order/get-admin-orders',
  routePath: '/get-admin-orders',
  otherMiddlewares: [isAdminAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const getUserOrdersContract = {
  ...baseContract,
  method: 'get',
  path: '/api/order/user-orders',
  routePath: '/user-orders',
  otherMiddlewares: [isUserAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const getOrderDetailsContract = {
  ...baseContract,
  method: 'get',
  path: '/api/order/order-details/{orderId}',
  routePath: '/order-details/:orderId',
  request: {
    params: [{ name: 'orderId', in: 'path', schema: { type: 'string' } }],
  },
  otherMiddlewares: [isCombinedAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const updateOrderStatusContract = {
  ...baseContract,
  method: 'put',
  path: '/api/order/update-status/{orderId}',
  routePath: '/update-status/:orderId',
  request: {
    params: [{ name: 'orderId', in: 'path', schema: { type: 'string' } }],
    body: updateOrderStatusSchema,
  },
  otherMiddlewares: [isSellerAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const verifyCouponContract = {
  ...baseContract,
  method: 'post',
  path: '/api/order/verify-coupon',
  routePath: '/verify-coupon',
  request: {
    body: verifyCouponSchema,
  },
  otherMiddlewares: [isCombinedAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const getUserOrderStatsContract = {
  ...baseContract,
  method: 'get',
  path: '/api/order/user-order-stats',
  routePath: '/user-order-stats',
  otherMiddlewares: [isUserAuthenticatedMiddleware],
} as const satisfies RouteContract;
