import {
  isSellerAuthenticatedMiddleware,
  isUserAuthenticatedMiddleware,
} from '@e-shop-app/packages/middlewares';
import { RouteContract } from '@e-shop-app/packages/types/base.type';
import {
  baseApiResponse,
  createSellerSchema,
  createShopSchema,
  createStripeConnectLinkSchema,
  createUserSchema,
  emailSchema,
  loginSchema,
  resetPasswordSchema,
  verifyOtpSchema,
  verifySellerSchema,
  verifyUserSchema,
} from '@e-shop-app/packages/zod-schemas';

const baseContract = {
  tags: ['Auth'],
  responses: {
    200: baseApiResponse,
  },
};

export const userRegistrationContract = {
  ...baseContract,
  method: 'post',
  path: '/api/auth/user-registration',
  routePath: '/user-registration',
  request: {
    body: createUserSchema,
  },
} as const satisfies RouteContract;

export const sellerRegistrationContract = {
  ...baseContract,
  method: 'post',
  path: '/api/auth/seller-registration',
  routePath: '/seller-registration',
  request: {
    body: createSellerSchema,
  },
} as const satisfies RouteContract;

export const verifyUserContract = {
  ...baseContract,
  method: 'post',
  path: '/api/auth/verify-user',
  routePath: '/verify-user',
  request: {
    body: verifyUserSchema,
  },
  responses: {
    201: baseApiResponse,
  },
} as const satisfies RouteContract;

export const verifySellerContract = {
  ...baseContract,
  method: 'post',
  path: '/api/auth/verify-seller',
  routePath: '/verify-seller',
  request: {
    body: verifySellerSchema,
  },
  responses: {
    201: baseApiResponse,
  },
} as const satisfies RouteContract;

export const loginUserContract = {
  ...baseContract,
  method: 'post',
  path: '/api/auth/login',
  routePath: '/login',
  request: {
    body: loginSchema,
    query: [
      {
        name: 'accountType',
        schema: { type: 'string' },
        in: 'query',
      },
    ],
  },
} as const satisfies RouteContract;

export const forgotPasswordContract = {
  ...baseContract,
  method: 'post',
  path: '/api/auth/forgot-password',
  routePath: '/forgot-password',
  request: {
    body: emailSchema,
    query: [
      {
        name: 'asSeller',
        schema: { type: 'string' },
        in: 'query',
      },
    ],
  },
} as const satisfies RouteContract;

export const resetPasswordContract = {
  ...baseContract,
  method: 'post',
  path: '/api/auth/reset-password',
  routePath: '/reset-password',
  request: {
    body: resetPasswordSchema,
  },
} as const satisfies RouteContract;

export const verifyOtpContract = {
  ...baseContract,
  method: 'post',
  path: '/api/auth/verify-otp',
  routePath: '/verify-otp',
  request: {
    body: verifyOtpSchema,
  },
} as const satisfies RouteContract;

export const resendOtpContract = {
  ...baseContract,
  method: 'post',
  path: '/api/auth/resend-otp',
  routePath: '/resend-otp',
  request: {
    body: emailSchema,
    query: [
      {
        name: 'withUserName',
        schema: { type: 'string' },
        in: 'query',
      },
      {
        name: 'asSeller',
        schema: { type: 'string' },
        in: 'query',
      },
    ],
  },
} as const satisfies RouteContract;

export const refreshTokenContract = {
  ...baseContract,
  method: 'post',
  path: '/api/auth/refresh-token',
  request: {
    query: [
      {
        name: 'accountType',
        schema: { type: 'string' },
        in: 'query',
      },
    ],
  },
  routePath: '/refresh-token',
} as const satisfies RouteContract;

export const getUserContract = {
  ...baseContract,
  method: 'get',
  path: '/api/auth/get-user-info',
  routePath: '/get-user-info',
  otherMiddlewares: [isUserAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const getSellerContract = {
  ...baseContract,
  method: 'get',
  path: '/api/auth/get-seller-info',
  routePath: '/get-seller-info',
  otherMiddlewares: [isSellerAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const createShopContract = {
  ...baseContract,
  method: 'post',
  path: '/api/auth/create-shop',
  routePath: '/create-shop',
  request: {
    body: createShopSchema,
  },
  responses: {
    201: baseApiResponse,
  },
} as const satisfies RouteContract;

export const createStripeConnectLinkContract = {
  ...baseContract,
  method: 'post',
  path: '/api/auth/create-stripe-connect-link',
  routePath: '/create-stripe-connect-link',
  request: {
    body: createStripeConnectLinkSchema,
  },
  responses: {
    201: baseApiResponse,
  },
} as const satisfies RouteContract;
