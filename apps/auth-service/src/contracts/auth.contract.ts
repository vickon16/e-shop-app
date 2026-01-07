import { isAuthenticatedMiddleware } from '@e-shop-app/packages/middlewares';
import { RouteContract } from '@e-shop-app/packages/types/base.type';
import {
  baseApiResponse,
  createUserSchema,
  emailSchema,
  loginSchema,
  resetPasswordSchema,
  verifyOtpSchema,
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

export const loginUserContract = {
  ...baseContract,
  method: 'post',
  path: '/api/auth/login',
  routePath: '/login',
  request: {
    body: loginSchema,
  },
} as const satisfies RouteContract;

export const forgotPasswordContract = {
  ...baseContract,
  method: 'post',
  path: '/api/auth/forgot-password',
  routePath: '/forgot-password',
  request: {
    body: emailSchema,
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
    ],
  },
} as const satisfies RouteContract;

export const refreshTokenContract = {
  ...baseContract,
  method: 'post',
  path: '/api/auth/refresh-token',
  routePath: '/refresh-token',
} as const satisfies RouteContract;

export const getUserContract = {
  ...baseContract,
  method: 'get',
  path: '/api/auth/get-me',
  routePath: '/get-me',
  otherMiddlewares: [isAuthenticatedMiddleware],
} as const satisfies RouteContract;
