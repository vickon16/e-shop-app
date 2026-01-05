import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/base.type.js';
import { env } from '../env/index.js';

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
    throw new Error('Internal server error');
  }
};
