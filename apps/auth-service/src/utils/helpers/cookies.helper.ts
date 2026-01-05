import { env } from '@e-shop-app/packages/env';
import { Response } from 'express';

const isProd = env.NODE_ENV === 'production';

export const setCookie = (
  res: Response,
  type: 'access_token' | 'refresh_token',
  cookieValue: string,
) => {
  const accessTokenMaxAge = 15 * 60 * 1000; // 15 mins
  const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7days

  res.cookie(type, cookieValue, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: type === 'access_token' ? accessTokenMaxAge : refreshTokenMaxAge,
  });
};
