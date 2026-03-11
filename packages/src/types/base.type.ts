import {
  ParameterObject,
  ReferenceObject,
} from '@asteasolutions/zod-to-openapi/dist/types.js';
import type { Row } from '@tanstack/react-table';
import { AxiosRequestConfig } from 'axios';
import { RequestHandler } from 'express';
import {
  type ControllerRenderProps,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { TBaseApiResponse } from 'src/zod-schemas/base.schemas.js';
import { TMessage, TUserAnalyticsAction } from './drizzle.type.js';
import { userAccountTypes } from 'src/constants/other-constants.js';

export type TTableMeta = {
  page: number;
  limit: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  requireAuth?: boolean;
  _retry?: boolean;
}

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

export type TUserAccountType = (typeof userAccountTypes)[number] | 'combined';

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

export type TMessageStatus = 'sent' | 'delivered' | 'seen';

export type TChatIncomingMessage = {
  type: 'MARK_AS_SEEN' | 'NEW_MESSAGE';
  fromUserId: string;
  toUserId: string;
  messageBody: string;
  conversationId: string;
  senderType: 'user' | 'seller';
};

export type TWebSocketNewMessageType = {
  type: 'NEW_MESSAGE';
  payload: Omit<TMessage, 'id' | 'attachments' | 'updatedAt' | 'status'>;
};

export type TWebSocketUnseenCountUpdateType = {
  type: 'UNSEEN_COUNT_UPDATE';
  payload: Pick<TChatIncomingMessage, 'conversationId'> & { count: number };
};

export type TWebSocketMessageEvent =
  | TWebSocketNewMessageType
  | TWebSocketUnseenCountUpdateType;
