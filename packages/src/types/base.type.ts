import { RequestHandler } from 'express';
import { TBaseApiResponse } from 'src/zod-schemas/base.schemas.js';
import {
  type ControllerRenderProps,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import {
  ParameterObject,
  ReferenceObject,
} from '@asteasolutions/zod-to-openapi/dist/types.js';
import type { Row } from '@tanstack/react-table';
import { TUserAnalyticsAction } from './drizzle.type.js';

export type TTableMeta = {
  page: number;
  limit: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type TPaginatedServerResponse<T> = {
  data: T;
  meta: TTableMeta;
};

export type TBaseServerResponse<T> = TBaseApiResponse &
  Pick<TPaginatedServerResponse<T>, 'data'>;

export type TBaseServerResponseWithPagination<T> = TBaseApiResponse & {
  data: TPaginatedServerResponse<T>;
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

export type TParams = ParameterObject | ReferenceObject;

export interface RouteContract {
  method: 'post' | 'get' | 'put' | 'delete';
  path: string;
  routePath: string;
  tags: string[];
  request?: {
    body?: any;
    params?: TParams[];
    query?: TParams[];
  };
  responses?: {
    [statusCode: number]: any;
  };
  otherMiddlewares?: Array<RequestHandler>;
}

export type TUserAccountType = 'user' | 'seller' | 'combined';

export interface JwtPayload {
  userId: string;
  email: string;
  role: TUserAccountType;
}

export type TBaseFieldProps = {
  className?: string;
  classNames?: {
    content?: string;
    item?: string;
  };
  placeHolder?: string;
  emptyStateText?: string;
  shouldNormalize?: boolean;
  isLoading?: boolean;
  isError?: boolean;
};

export type FieldProps<
  T extends FieldValues,
  E extends Path<T>,
> = TBaseFieldProps & {
  field: ControllerRenderProps<T, E>;
};

export type TSelect = {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
};

export interface TDataTableRowAction<TData> {
  row: Row<TData>;
  variant: 'update' | 'cancel';
}

export type TCustomUserAnalyticsAction = Omit<
  TUserAnalyticsAction,
  'id' | 'createdAt' | 'updatedAt' | 'analyticsId'
>;
