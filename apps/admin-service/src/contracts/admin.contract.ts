import { userRoles } from '@e-shop-app/packages/constants';
import { isAdminAuthenticatedMiddleware } from '@e-shop-app/packages/middlewares';
import { RouteContract } from '@e-shop-app/packages/types/base.type';
import {
  addNewAdminSchema,
  baseApiResponse,
} from '@e-shop-app/packages/zod-schemas';

const baseContract = {
  tags: ['Admin'],
  responses: {
    200: baseApiResponse,
  },
};

export const getAdminInfoContract = {
  ...baseContract,
  method: 'get',
  path: '/api/admin/get-admin-info',
  routePath: '/get-admin-info',
  otherMiddlewares: [isAdminAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const getAllUsersContract = {
  ...baseContract,
  method: 'get',
  path: '/api/admin/get-all-users',
  routePath: '/get-all-users',
  request: {
    query: [
      {
        name: 'type',
        in: 'query',
        schema: {
          type: 'string',
          enum: [...userRoles],
          default: 'user',
        },
      },
    ],
  },
  otherMiddlewares: [isAdminAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const getAllSellersContract = {
  ...baseContract,
  method: 'get',
  path: '/api/admin/get-all-sellers',
  routePath: '/get-all-sellers',
  otherMiddlewares: [isAdminAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const addNewAdminContract = {
  ...baseContract,
  method: 'post',
  path: '/api/admin/add-new-admin',
  routePath: '/add-new-admin',
  request: {
    body: addNewAdminSchema,
  },
  otherMiddlewares: [isAdminAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const getAllNotificationsContract = {
  ...baseContract,
  method: 'get',
  path: '/api/admin/get-all-notifications',
  routePath: '/get-all-notifications',
  otherMiddlewares: [isAdminAuthenticatedMiddleware],
} as const satisfies RouteContract;

