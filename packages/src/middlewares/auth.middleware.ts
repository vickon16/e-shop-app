import { Response, Request, NextFunction } from 'express';
import { AuthError } from '../error-handler/index.js';
import { verifyJwtToken } from '../utils/index.js';
import { TUserAccountType } from '../types/base.type.js';

const baseAuthMiddleware = (
  req: Request,
  next: NextFunction,
  userType: TUserAccountType,
) => {
  try {
    let token: string | undefined;

    if (userType === 'seller') {
      token = req.cookies['seller_access_token'];
    } else {
      token = req.cookies['access_token'];
    }

    if (!token) {
      token = req.headers['authorization']?.split(' ')[1];
    }

    if (!token) {
      throw new AuthError('Authentication token missing');
    }

    const decoded = verifyJwtToken(token, 'access');

    if (userType !== 'combined' && decoded.role !== userType) {
      throw new AuthError(
        `Invalid token for the specified user type: ${userType}`,
      );
    }

    req.user = decoded;
    return next();
  } catch (error) {
    console.log(`Error in ${userType} isAuthenticated middleware:`, error);
    return next(error);
  }
};

export const isCombinedAuthenticatedMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    baseAuthMiddleware(req, next, 'combined');
  } catch (error) {
    console.log('Error in combined isAuthenticated middleware:', error);
    return next(error);
  }
};

export const isUserAuthenticatedMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    baseAuthMiddleware(req, next, 'user');
  } catch (error) {
    console.log('Error in user isAuthenticated middleware:', error);
    return next(error);
  }
};

export const isSellerAuthenticatedMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    baseAuthMiddleware(req, next, 'seller');
  } catch (error) {
    console.log('Error in seller isAuthenticated middleware:', error);
    return next(error);
  }
};
