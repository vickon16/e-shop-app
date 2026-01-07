import { Response, Request, NextFunction } from 'express';
import { AuthError } from '../error-handler/index.js';
import { verifyJwtToken } from '../utils/index.js';

export const isAuthenticatedMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.cookies['access_token'] ||
      req.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new AuthError('Authentication token missing');
    }

    const decoded = verifyJwtToken(token, 'access');

    req.user = decoded;
    return next();
  } catch (error) {
    console.log('Error in isAuthenticated middleware:', error);
    return next(error);
  }
};
