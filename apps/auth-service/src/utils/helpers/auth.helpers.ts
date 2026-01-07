import {
  TCreateUserSchema,
  TEmailSchema,
} from '@e-shop-app/packages/zod-schemas';
import crypto from 'crypto';

import {
  ACCOUNT_LOCK_MINUTES,
  ACCOUNT_SPAM_LOCK_MINUTES,
  OTP_ATTEMPTS_LIMIT,
  OTP_COOL_EXPIRATION_MINUTES,
  OTP_EXPIRATION_MINUTES,
} from '@e-shop-app/packages/constants';
import { appDb, eq, usersTable } from '@e-shop-app/packages/database';
import {
  NotFoundError,
  ValidationError,
} from '@e-shop-app/packages/error-handler';
import { constructOtpWithEmail, redis } from '@e-shop-app/packages/libs/redis';
import { sendEmail } from '@e-shop-app/packages/mails';
import { TUserAccountType } from '@e-shop-app/packages/types/base.type';
import { sendSuccess } from '@e-shop-app/packages/utils';
import { Request, Response } from 'express';
import { getUserBy } from './user.helpers';

export const validateRegistrationData = (
  data: TCreateUserSchema,
  userType: TUserAccountType,
) => {
  const { name, email, password, phoneNumber, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === 'seller' && (!phoneNumber || !country))
  ) {
    throw new ValidationError('Missing required registration fields');
  }
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
  userType: TUserAccountType = 'user',
) => {
  const body = req.body as TEmailSchema;
  let userName = req.query['withUserName'] as string | undefined;
  const { email } = body;

  // Find user or seller by email

  if (!userName) {
    const existingUser = await getUserBy('email', email);

    if (!existingUser) {
      throw new NotFoundError(`${userType} with this email does not exist.`);
    }
    userName = existingUser.name;
  }

  // Check OTP restrictions and track requests
  await checkOTPRestrictions(email);
  await trackOtpRequests(email);

  const emailTemplate =
    type === 'forgot-password' ? 'user-forgot-password' : 'user-resend-otp';

  // Send OTP email
  await sendOtp(userName, email, emailTemplate);

  sendSuccess(res, null, 'OTP sent to your email');
};
