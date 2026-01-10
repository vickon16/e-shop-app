import { RequestHandler } from 'express';
import { TBaseApiResponse } from 'src/zod-schemas/base.schemas.js';

export type TTableMeta = {
  page: number;
  limit: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type TBaseServerResponse<T> = TBaseApiResponse & {
  data: T;
  meta?: TTableMeta;
};

// api-response.ts
export interface ApiSuccessResponse<T = unknown> extends TBaseApiResponse {
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface RouteContract {
  method: 'post' | 'get' | 'put' | 'delete';
  path: string;
  routePath: string;
  tags: string[];
  request?: {
    body?: any;
    query?: {
      name: string;
      in: 'query';
      required?: boolean;
      schema: {
        type: 'number' | 'string' | 'boolean' | 'array' | 'object' | 'integer';
      };
    }[];
  };
  responses?: {
    [statusCode: number]: any;
  };
  otherMiddlewares?: Array<RequestHandler>;
}

export type TUserAccountType = 'user' | 'seller';

export interface JwtPayload {
  userId: string;
  email: string;
  role: TUserAccountType;
}
