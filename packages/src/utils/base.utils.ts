import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../error-handler/base.js';
import { ApiSuccessResponse } from '../types/base.type.js';
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
