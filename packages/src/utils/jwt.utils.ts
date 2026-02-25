import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/base.type.js';
import { env } from '../env/index.js';
import { AuthError, InternalServerError } from '../error-handler/index.js';

export const signJwtToken = (
  payload: JwtPayload,
  type: 'access' | 'refresh',
) => {
  const token =
    type === 'access' ? env.ACCESS_TOKEN_SECRET : env.REFRESH_TOKEN_SECRET;
  const expiresIn =
    type === 'access'
      ? env.ACCESS_TOKEN_EXPIRATION
      : env.REFRESH_TOKEN_EXPIRATION;

  try {
    return jwt.sign(payload, token, {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    });
  } catch (error) {
    console.log('JWT Sign Error', error);
    throw new InternalServerError('Internal server error');
  }
};

export const verifyJwtToken = (
  token: string,
  type: 'access' | 'refresh',
): JwtPayload => {
  const secret =
    type === 'access' ? env.ACCESS_TOKEN_SECRET : env.REFRESH_TOKEN_SECRET;

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (!decoded || !decoded.userId) {
      throw new AuthError('Invalid token payload');
    }
    return decoded;
  } catch (error) {
    console.log('JWT Verify Error', error);
    throw new AuthError('Invalid or expired token');
  }
};
