import { multerUpload } from '@e-shop-app/packages/libs/multer';
import {
  isSellerAuthenticatedMiddleware,
  isUserAuthenticatedMiddleware,
} from '@e-shop-app/packages/middlewares';
import {
  TFilteredProductType,
  TProductQueryType,
} from '@e-shop-app/packages/types';
import { RouteContract } from '@e-shop-app/packages/types/base.type';
import { paginationDtoQueryArray } from '@e-shop-app/packages/utils';
import {
  baseApiResponse,
  createDiscountCodesSchema,
  productSchema,
  uploadProductImageResponseSchema,
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
  path: '/api/product/delete-discount-code/{id}',
  routePath: '/delete-discount-code/:id',
  request: {
    params: [
      { name: 'id', in: 'path', schema: { type: 'string', format: 'uuid' } },
    ],
  },
  otherMiddlewares: [isSellerAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const uploadProductImageContract = {
  ...baseContract,
  method: 'post',
  path: '/api/product/upload-product-image',
  routePath: '/upload-product-image',
  otherMiddlewares: [
    isSellerAuthenticatedMiddleware,
    multerUpload.single('image'),
  ],
} as const satisfies RouteContract;

export const deleteProductImageContract = {
  ...baseContract,
  method: 'delete',
  path: '/api/product/delete-product-image/{fileId}',
  routePath: '/delete-product-image/:fileId',
  request: {
    params: [{ name: 'fileId', in: 'path', schema: { type: 'string' } }],
  },
  otherMiddlewares: [isSellerAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const createProductContract = {
  ...baseContract,
  method: 'post',
  path: '/api/product/create-product',
  routePath: '/create-product',
  request: {
    body: productSchema.extend({
      images: uploadProductImageResponseSchema.array().nonempty(),
    }),
  },
  otherMiddlewares: [isSellerAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const getShopProductContract = {
  ...baseContract,
  method: 'get',
  path: '/api/product/get-shop-products',
  routePath: '/get-shop-products',
  otherMiddlewares: [isSellerAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const getAllProductsContract = {
  ...baseContract,
  method: 'get',
  path: '/api/product/get-all-products',
  routePath: '/get-all-products',
  request: {
    query: [
      ...paginationDtoQueryArray,
      {
        name: 'type',
        in: 'query',
        schema: {
          type: 'string',
          enum: ['all', 'latest', 'top-sales'] satisfies TProductQueryType[],
          default: 'latest',
        },
      },
    ],
  },
  otherMiddlewares: [isUserAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const getFilteredProductsContract = {
  ...baseContract,
  method: 'get',
  path: '/api/product/get-filtered-products',
  routePath: '/get-filtered-products',
  request: {
    query: [
      ...paginationDtoQueryArray,
      {
        name: 'type',
        in: 'query',
        schema: {
          type: 'string',
          enum: ['default', 'event'] satisfies TFilteredProductType[],
          default: 'default',
        },
      },
      {
        name: 'priceRange',
        in: 'query',
        schema: {
          type: 'string',
        },
      },
      {
        name: 'sizes',
        in: 'query',
        schema: {
          type: 'string',
        },
      },
      {
        name: 'colors',
        in: 'query',
        schema: {
          type: 'string',
        },
      },
      {
        name: 'categories',
        in: 'query',
        schema: {
          type: 'string',
        },
      },
    ],
  },
  otherMiddlewares: [],
} as const satisfies RouteContract;

export const getSearchedProductsContract = {
  ...baseContract,
  method: 'get',
  path: '/api/product/get-searched-products',
  routePath: '/get-searched-products',
  request: {
    query: [
      ...paginationDtoQueryArray,
      {
        name: 'q',
        in: 'query',
        schema: {
          type: 'string',
        },
      },
    ],
  },
  otherMiddlewares: [],
} as const satisfies RouteContract;

export const getFilteredShopsContract = {
  ...baseContract,
  method: 'get',
  path: '/api/product/get-filtered-shops',
  routePath: '/get-filtered-shops',
  request: {
    query: [
      ...paginationDtoQueryArray,
      {
        name: 'countries',
        in: 'query',
        schema: {
          type: 'string',
        },
      },
      {
        name: 'categories',
        in: 'query',
        schema: {
          type: 'string',
        },
      },
    ],
  },
  otherMiddlewares: [],
} as const satisfies RouteContract;

export const getTopShopsContract = {
  ...baseContract,
  method: 'get',
  path: '/api/product/get-top-shops',
  routePath: '/get-top-shops',
  otherMiddlewares: [],
} as const satisfies RouteContract;

export const getProductByIdContract = {
  ...baseContract,
  method: 'get',
  path: '/api/product/get-product-by-id/{id}',
  routePath: '/get-product-by-id/:id',
  request: {
    params: [
      { name: 'id', in: 'path', schema: { type: 'string', format: 'uuid' } },
    ],
  },
  otherMiddlewares: [isUserAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const getProductBySlugContract = {
  ...baseContract,
  method: 'get',
  path: '/api/product/get-product-by-slug/{slug}',
  routePath: '/get-product-by-slug/:slug',
  request: {
    params: [{ name: 'slug', in: 'path', schema: { type: 'string' } }],
  },
  otherMiddlewares: [],
} as const satisfies RouteContract;

export const deleteProductContract = {
  ...baseContract,
  method: 'put',
  path: '/api/product/delete-product/{id}',
  routePath: '/delete-product/:id',
  request: {
    params: [
      { name: 'id', in: 'path', schema: { type: 'string', format: 'uuid' } },
    ],
  },
  otherMiddlewares: [isSellerAuthenticatedMiddleware],
} as const satisfies RouteContract;

export const restoreProductContract = {
  ...baseContract,
  method: 'put',
  path: '/api/product/restore-product/{id}',
  routePath: '/restore-product/:id',
  request: {
    params: [
      { name: 'id', in: 'path', schema: { type: 'string', format: 'uuid' } },
    ],
  },
  otherMiddlewares: [isSellerAuthenticatedMiddleware],
} as const satisfies RouteContract;
