import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../error-handler/base.js';
import { ApiSuccessResponse, TParams } from '../types/base.type.js';
import { z } from 'zod';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string,
  statusCode = 200,
) {
  const response: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(response);
}

export const validate =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        new ValidationError('Invalid request data', {
          errors: result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }),
      );
    }

    req.body = result.data; // typed & sanitized
    next();
  };

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationDto {
  readonly order: Order = Order.DESC;

  readonly page: number = 1;

  readonly limit: number = 10;

  readonly isPaginated: boolean = true;
}

class PaginationMetadataDto {
  readonly page: number;

  readonly limit: number;

  readonly itemCount: number;

  readonly pageCount: number;

  readonly hasPreviousPage: boolean;

  readonly hasNextPage: boolean;

  constructor({
    pageOptionsDto,
    itemCount,
  }: {
    pageOptionsDto: PaginationDto;
    itemCount: number;
  }) {
    this.page = pageOptionsDto.page;
    this.limit = pageOptionsDto.limit;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / (this.limit ?? 10));
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}

export class PaginationResultDto<T> {
  readonly data: T[];

  readonly meta: PaginationMetadataDto;

  constructor(data: T[], itemCount: number, options = { page: 1, limit: 10 }) {
    this.data = data;
    this.meta = new PaginationMetadataDto({
      itemCount,
      pageOptionsDto: options as PaginationDto,
    });
  }
}

export const paginationDtoQueryArray: TParams[] = [
  {
    name: 'page',
    schema: { type: 'number' },
    in: 'query',
  },
  {
    name: 'limit',
    schema: { type: 'number' },
    in: 'query',
  },
  {
    name: 'order',
    in: 'query',
    schema: {
      type: 'string',
      enum: [Order.ASC, Order.DESC],
      default: Order.DESC,
    },
  },
];
