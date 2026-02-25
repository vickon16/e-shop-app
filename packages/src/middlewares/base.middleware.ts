import { ApiErrorResponse } from '../types/base.type.js';
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../error-handler/base.js';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let response: ApiErrorResponse = {
    success: false,
    message: 'Internal Server Error',
  };

  if (err instanceof AppError) {
    console.log(`Error ${req.method} ${req.url} - ${err.message}`);
    statusCode = err.statusCode;
    response = {
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      ...(err.details && { details: err.details }),
    };
  }

  console.log('Unhandled error:', err);

  return res.status(statusCode).json(response);
};
