import { isSellerAuthenticatedMiddleware } from '@e-shop-app/packages/middlewares';
import { RouteContract } from '@e-shop-app/packages/types/base.type';
import {
  baseApiResponse,
  createDiscountCodesSchema,
} from '@e-shop-app/packages/zod-schemas';

const baseContract = {
  tags: ['Product'],
  responses: {
    200: baseApiResponse,
  },
};

export const getCategoriesContract = {
  ...baseContract,
  method: 'get',
  path: '/api/product/get-categories',
  routePath: '/get-categories',
} as const satisfies RouteContract;

export const createDiscountCodesContract = {
  ...baseContract,
  method: 'post',
  path: '/api/product/create-discount-codes',
  routePath: '/create-discount-codes',
  request: {
    body: createDiscountCodesSchema,
  },
  otherMiddlewares: [isSellerAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const getDiscountCodesContract = {
  ...baseContract,
  method: 'get',
  path: '/api/product/get-discount-codes',
  routePath: '/get-discount-codes',
  otherMiddlewares: [isSellerAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const deleteDiscountCodeContract = {
  ...baseContract,
  method: 'delete',
  path: '/api/product/delete-discount-code/:id',
  routePath: '/delete-discount-code/:id',
  request: {
    params: [
      { name: 'id', in: 'path', schema: { type: 'string', format: 'uuid' } },
    ],
  },
  otherMiddlewares: [isSellerAuthenticatedMiddleware],
} as const satisfies RouteContract;
