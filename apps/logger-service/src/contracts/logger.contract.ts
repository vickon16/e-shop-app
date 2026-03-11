import { userRoles } from '@e-shop-app/packages/constants';
import { isAdminAuthenticatedMiddleware } from '@e-shop-app/packages/middlewares';
import { RouteContract } from '@e-shop-app/packages/types';
import {
  addNewAdminSchema,
  baseApiResponse,
} from '@e-shop-app/packages/zod-schemas';

const baseContract = {
  tags: ['Logger'],
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
