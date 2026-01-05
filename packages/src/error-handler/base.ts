export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(payload: {
    message: string;
    statusCode: number;
    isOperational?: boolean;
    details?: any;
    errorCode?: string;
  }) {
    const {
      isOperational = true,
      message,
      statusCode,
      details,
      errorCode = 'DEFAULT_ERROR',
    } = payload;

    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.errorCode = errorCode;

    Error.captureStackTrace(this);
  }
}

// Not found error
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super({ message, statusCode: 404, errorCode: 'NOT_FOUND' });
  }
}

// Validation error
export class ValidationError extends AppError {
  constructor(message = 'Invalid request data', details?: any) {
    super({ message, statusCode: 400, details, errorCode: 'VALIDATION_ERROR' });
  }
}

// Authentication error
export class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super({ message, statusCode: 401, errorCode: 'AUTH_ERROR' });
  }
}

// Forbidden error
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access') {
    super({ message, statusCode: 403, errorCode: 'FORBIDDEN' });
  }
}

// Bad request error
export class BadRequestError extends AppError {
  constructor(message = 'Invalid or Bad request') {
    super({ message, statusCode: 400, errorCode: 'BAD_REQUEST' });
  }
}

// Server error
export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super({ message, statusCode: 500, errorCode: 'INTERNAL_SERVER_ERROR' });
  }
}

// Rate Limiting error
export class RateLimitError extends AppError {
  constructor(message = 'Too many request, please try again later') {
    super({ message, statusCode: 429, errorCode: 'RATE_LIMIT_EXCEEDED' });
  }
}
