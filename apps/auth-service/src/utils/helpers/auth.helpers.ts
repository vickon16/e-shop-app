/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  TEmailSchema,
  TVerifySellerSchema,
  TVerifyUserSchema,
} from '@e-shop-app/packages/zod-schemas';
import crypto from 'crypto';

import {
  ACCOUNT_LOCK_MINUTES,
  ACCOUNT_SPAM_LOCK_MINUTES,
  OTP_ATTEMPTS_LIMIT,
  OTP_COOL_EXPIRATION_MINUTES,
  OTP_EXPIRATION_MINUTES,
} from '@e-shop-app/packages/constants';
import { appDb, sellersTable, usersTable } from '@e-shop-app/packages/database';
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '@e-shop-app/packages/error-handler';
import { constructOtpWithEmail, redis } from '@e-shop-app/packages/libs/redis';
import { sendEmail } from '@e-shop-app/packages/mails';
import { JwtPayload } from '@e-shop-app/packages/types';
import { TUserAccountType } from '@e-shop-app/packages/types/base.type';
import {
  hashPassword,
  sendSuccess,
  signJwtToken,
} from '@e-shop-app/packages/utils';
import { Request, Response } from 'express';
import { setCookie } from './cookies.helper';
import { getSellerBy, getUserBy } from '@e-shop-app/packages/utils';

export const startOtpCheckAndSend = async (
  name: string,
  email: string,
  template: string,
) => {
  await checkOTPRestrictions(email);
  await trackOtpRequests(email);
  await sendOtp(name, email, template);
};

export const checkOTPRestrictions = async (email: string) => {
  const [otpCool, otpLock, otpSpamLock] = await Promise.all([
    redis.get(constructOtpWithEmail('cool', email)),
    redis.get(constructOtpWithEmail('lock', email)),
    redis.get(constructOtpWithEmail('spam-lock', email)),
  ]);

  // Check if count is locked due to multiple failed attempts
  if (otpLock === 'locked') {
    throw new ValidationError(
      `Account is locked due to multiple failed attempts. Try again for ${ACCOUNT_LOCK_MINUTES} minutes`,
    );
  }

  // if the otp spam lock is active
  if (otpSpamLock === 'locked') {
    throw new ValidationError(
      `Too many otp request. Please wait ${ACCOUNT_SPAM_LOCK_MINUTES} minutes before trying again`,
    );
  }

  // if the otp expiration has not passed
  if (otpCool === 'true') {
    throw new ValidationError(
      `Please wait for ${OTP_COOL_EXPIRATION_MINUTES} minutes before trying again.`,
    );
  }
};

export const trackOtpRequests = async (email: string) => {
  const otpRequestKey = await redis.get(
    constructOtpWithEmail('request-count', email),
  );

  const otpRequests = parseInt(otpRequestKey || '0');

  if (otpRequests >= 2) {
    // Set spam lock
    await redis.set(
      constructOtpWithEmail('spam-lock', email),
      'locked',
      'EX',
      ACCOUNT_SPAM_LOCK_MINUTES * 60, // lock for one hour
    );
    throw new ValidationError(
      `Too many otp request. Please wait ${ACCOUNT_SPAM_LOCK_MINUTES} minutes before trying again`,
    );
  }

  await redis.set(
    constructOtpWithEmail('request-count', email),
    (otpRequests + 1).toString(),
    'EX',
    OTP_EXPIRATION_MINUTES * 60,
  );
};

export const sendOtp = async (
  name: string,
  email: string,
  templateName: string,
) => {
  const otp = crypto.randomInt(1000, 9999).toString(); // 4-digit OTP

  // Send an email first
  await sendEmail({
    to: email,
    subject: 'Verify your email - OTP Code',
    templateName,
    data: { username: name, otp },
  });

  // Set otp in our redis

  await Promise.all([
    redis.set(
      constructOtpWithEmail('default', email),
      otp,
      'EX',
      OTP_EXPIRATION_MINUTES * 60,
    ),
    // Set cool to prevent immediate re-requests
    // Wait for one minute before allowing another OTP request
    redis.set(
      constructOtpWithEmail('cool', email),
      'true',
      'EX',
      OTP_COOL_EXPIRATION_MINUTES * 60,
    ),
  ]);
};

export const verifyOtp = async (email: string, otp: string) => {
  // Fetch otp from redis
  const [storedOtp, storedAttempts] = await Promise.all([
    redis.get(constructOtpWithEmail('default', email)),
    redis.get(constructOtpWithEmail('attempts', email)),
  ]);

  if (!storedOtp) {
    throw new ValidationError('Invalid or expired OTP');
  }

  // Register user failed attempts

  let failedAttempts = parseInt(storedAttempts || '0');

  if (storedOtp !== otp) {
    failedAttempts += 1;

    if (failedAttempts >= OTP_ATTEMPTS_LIMIT) {
      // Lock the account for some time
      await Promise.all([
        redis.set(
          constructOtpWithEmail('lock', email),
          'locked',
          'EX',
          ACCOUNT_LOCK_MINUTES * 60,
        ),
        redis.del(constructOtpWithEmail('default', email)),
        redis.del(constructOtpWithEmail('attempts', email)),
      ]);

      throw new ValidationError(
        `Account is locked due to multiple failed attempts. Try again in ${ACCOUNT_LOCK_MINUTES} minutes`,
      );
    }

    // Increment failed attempts
    await redis.set(
      constructOtpWithEmail('attempts', email),
      failedAttempts.toString(),
      'EX',
      OTP_EXPIRATION_MINUTES * 60,
    );

    throw new ValidationError(
      `Invalid OTP. You have ${OTP_ATTEMPTS_LIMIT - failedAttempts} attempts left.`,
    );
  }

  // Remove OTP and attempts on successful verification
  await Promise.all([
    redis.del(constructOtpWithEmail('attempts', email)),
    redis.del(constructOtpWithEmail('default', email)),
  ]);
};

export const handleSendOtp = async (
  req: Request,
  res: Response,
  type: 'forgot-password' | 'resend-otp',
) => {
  const body = req.body as TEmailSchema;
  const userType: TUserAccountType =
    req.query['asSeller'] === 'true' ? 'seller' : 'user';
  let userName = req.query['withUserName'] as string | undefined;
  const { email } = body;

  // Find user or seller by email

  if (!userName) {
    let existingUser: { name: string } | undefined;
    if (userType === 'seller') {
      existingUser = await getSellerBy('email', email);
    } else {
      existingUser = await getUserBy('email', email);
    }

    if (!existingUser) {
      throw new NotFoundError(`${userType} with this email does not exist.`);
    }
    userName = existingUser.name;
  }

  const emailTemplate =
    type === 'forgot-password'
      ? userType === 'user'
        ? 'user-forgot-password'
        : 'seller-forgot-password'
      : userType === 'user'
        ? 'user-resend-otp'
        : 'seller-resend-otp';

  await startOtpCheckAndSend(userName, email, emailTemplate);

  sendSuccess(res, null, 'OTP sent to your email');
};

export const handleBaseVerifyAccount = async (
  req: Request,
  res: Response,
  userType: TUserAccountType,
) => {
  const body = req.body as TVerifySellerSchema | TVerifyUserSchema;
  const { name, email, otp, password } = body;

  let existingAccount;
  if (userType === 'seller') {
    existingAccount = await getSellerBy('email', email);
  } else {
    existingAccount = await getUserBy('email', email);
  }

  if (existingAccount) {
    throw new ValidationError(
      'Email is already registered for this account type',
    );
  }

  // Check OTP restrictions and track requests
  await verifyOtp(email, otp);

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new account
  let newAccount: { id: string; email: string; password: string | null }[] = [];

  const baseInsertData = {
    name,
    email,
    password: hashedPassword,
    emailVerified: new Date().toISOString(),
  };

  if (userType === 'seller') {
    const newBody = body as TVerifySellerSchema;

    newAccount = await appDb
      .insert(sellersTable)
      .values({
        ...baseInsertData,
        phoneNumber: newBody.phoneNumber,
        country: newBody.country,
      })
      .returning();
  } else {
    newAccount = await appDb
      .insert(usersTable)
      .values(baseInsertData)
      .returning();
  }

  if (newAccount.length === 0) {
    throw new ValidationError(
      `Failed to create ${userType} account. Please try again.`,
    );
  }

  if (userType === 'user') {
    generateToken(
      res,
      {
        userId: newAccount[0].id,
        email: newAccount[0].email,
        role: userType,
      },
      'user',
    );
  }

  const { password: _, ...accountWithoutPassword } = newAccount[0];

  sendSuccess(res, accountWithoutPassword, 'User registered successfully');
};

export const generateToken = (
  res: Response,
  payload: JwtPayload,
  userType: TUserAccountType,
  noRefreshToken?: boolean,
) => {
  // Store the refresh and access token in an httpOnly secure cookie
  // Have different access and refresh tokens names for user and seller accounts

  const accessToken = signJwtToken(payload, 'access');

  if (userType === 'seller') {
    setCookie(res, 'seller_access_token', accessToken);
  } else {
    setCookie(res, 'access_token', accessToken);
  }

  if (noRefreshToken) return;

  const refreshToken = signJwtToken(payload, 'refresh');

  if (userType === 'seller') {
    setCookie(res, 'seller_refresh_token', refreshToken);
  } else {
    setCookie(res, 'refresh_token', refreshToken);
  }
};

export const baseGetCurrentAccount = async (
  req: Request,
  res: Response,
  userType: TUserAccountType,
) => {
  const authUser = req.user;
  if (!authUser) {
    throw new AuthError('Unauthorized');
  }

  let currentUser;

  if (userType === 'seller') {
    currentUser = await getSellerBy('id', authUser.userId);
  } else {
    currentUser = await getUserBy('id', authUser.userId);
  }

  if (!currentUser) {
    throw new NotFoundError(`${userType} not found`);
  }

  sendSuccess(res, currentUser, 'User retrieved successfully');
};
