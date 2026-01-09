import { appDb, eq, usersTable } from '@e-shop-app/packages/database';
import {
  AuthError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@e-shop-app/packages/error-handler';
import { JwtPayload, TUser } from '@e-shop-app/packages/types';
import {
  hashPassword,
  sendSuccess,
  signJwtToken,
  verifyJwtToken,
  verifyPassword,
} from '@e-shop-app/packages/utils';
import {
  TCreateUserSchema,
  TLoginSchema,
  TResetPasswordSchema,
  TVerifyOtpSchema,
  TVerifyUserSchema,
} from '@e-shop-app/packages/zod-schemas';
import { NextFunction, Request, Response } from 'express';
import {
  handleSendOtp,
  startOtpCheckAndSend,
  verifyOtp,
} from '../utils/helpers/auth.helpers';
import { setCookie } from '../utils/helpers/cookies.helper';
import { getSellerBy } from '../utils/helpers/seller.helpers';
import { getUserBy } from '../utils/helpers/user.helpers';

// Register a new user
export const userRegistrationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email } = req.body as TCreateUserSchema;

    const existingUser = await getUserBy('email', email);

    if (existingUser) {
      throw new ValidationError('Email is already registered');
    }

    // Check OTP restrictions and track requests
    await startOtpCheckAndSend(name, email, 'user-activation-email');

    sendSuccess(res, null, 'OTP sent to your email for verification');
  } catch (error) {
    console.log('Error in userRegistration:', error);
    return next(error);
  }
};

// Register a new seller
export const sellerRegistrationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email } = req.body as TCreateUserSchema;

    const existingSeller = await getSellerBy('email', email);

    if (existingSeller) {
      throw new ValidationError('Email is already registered for this seller');
    }

    // Check OTP restrictions and track requests
    await startOtpCheckAndSend(name, email, 'seller-activation-email');

    sendSuccess(res, null, 'OTP sent to your email for verification');
  } catch (error) {
    console.log('Error in sellerRegistration:', error);
    return next(error);
  }
};

// Verify user with OTP
export const verifyUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body as TVerifyUserSchema;
    const { name, email, otp, password } = body;

    const existingUser = await getUserBy('email', email);

    if (existingUser) {
      throw new ValidationError('Email is already registered');
    }

    // Check OTP restrictions and track requests
    await verifyOtp(email, otp);

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await appDb
      .insert(usersTable)
      .values({
        name,
        email,
        password: hashedPassword,
        emailVerified: new Date().toISOString(),
      })
      .returning();

    if (newUser.length === 0) {
      throw new ValidationError('Failed to create user. Please try again.');
    }

    generateToken(res, {
      userId: newUser[0].id,
      email: newUser[0].email,
      role: 'user',
    });

    sendSuccess(res, null, 'User registered successfully');
  } catch (error) {
    console.log('Error in verifyUser:', error);
    return next(error);
  }
};

export const loginUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body as TLoginSchema;
    const { email, password } = body;

    const existingUser = await getUserBy('email', email, true);

    if (!existingUser) {
      throw new NotFoundError('M: Invalid email or password.');
    }

    if (!existingUser.emailVerified) {
      throw new ForbiddenError('Please verify your email before logging in.');
    }

    const isValidPassword = await verifyPassword(
      existingUser?.password || '',
      password,
    );

    if (!isValidPassword) {
      throw new NotFoundError('B: Invalid email or password.');
    }

    const payload: JwtPayload = {
      userId: existingUser.id,
      email: existingUser.email,
      role: 'user',
    };

    generateToken(res, payload);

    sendSuccess(
      res,
      {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
      },
      'Login successful',
    );
  } catch (error) {
    console.log('Error in loginUser:', error);
    return next(error);
  }
};

const generateToken = (
  res: Response,
  payload: JwtPayload,
  noRefreshToken?: boolean,
) => {
  // Store the refresh and access token in an httpOnly secure cookie

  const accessToken = signJwtToken(payload, 'access');
  setCookie(res, 'access_token', accessToken);

  if (noRefreshToken) return;

  const refreshToken = signJwtToken(payload, 'refresh');
  setCookie(res, 'refresh_token', refreshToken);
};

export const userForgotPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await handleSendOtp(req, res, 'forgot-password');
  } catch (error) {
    console.log('Error in userForgotPassword:', error);
    return next(error);
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body as TResetPasswordSchema;
    const { email, newPassword, otp } = body;

    // Find user or seller by email
    const existingUser = await getUserBy('email', email, true);

    if (!existingUser) {
      throw new NotFoundError(`User with this email does not exist.`);
    }

    if (!existingUser.password) {
      throw new ForbiddenError(
        `Password reset is not available for users registered via social login.`,
      );
    }

    // compare new password with existing password
    const isSamePassword = await verifyPassword(
      existingUser.password,
      newPassword,
    );

    if (isSamePassword) {
      throw new ValidationError(
        'New password must be different from the old password.',
      );
    }

    // Verify OTP
    await verifyOtp(email, otp);

    // Has new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password in the database
    await appDb
      .update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.email, email));

    sendSuccess(res, null, 'Password has been reset successfully');
  } catch (error) {
    console.log('Error in resetPassword:', error);
    return next(error);
  }
};

export const verifyOtpController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body as TVerifyOtpSchema;
    const { email, otp } = body;

    // Find user or seller by email
    const existingUser = await getUserBy('email', email);

    if (!existingUser) {
      throw new NotFoundError(`User with this email does not exist.`);
    }

    // Verify OTP
    await verifyOtp(email, otp);

    sendSuccess(res, null, 'OTP verified successfully');
  } catch (error) {
    console.log('Error in verifyForgotPassword:', error);
    return next(error);
  }
};

export const resendOtpController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await handleSendOtp(req, res, 'resend-otp');
  } catch (error) {
    console.log('Error in resendOtpController:', error);
    return next(error);
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new ForbiddenError('Refresh token is missing');
    }

    // Verify refresh token
    const decoded = verifyJwtToken(refreshToken, 'refresh');

    let currentUser: TUser | undefined;

    if (decoded.role === 'user') {
      currentUser = await getUserBy('id', decoded.userId);
    }

    if (!currentUser) {
      throw new AuthError('User not found');
    }

    // Generate access token
    generateToken(
      res,
      {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
      true,
    );

    sendSuccess(res, null, 'Token refreshed successfully');
  } catch (error) {
    console.log('Error in resendOtpController:', error);
    return next(error);
  }
};

// Get logged in user
export const getUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const currentUser = await getUserBy('id', authUser.userId);

    if (!currentUser) {
      throw new NotFoundError('User not found');
    }

    sendSuccess(res, currentUser, 'User retrieved successfully');
  } catch (error) {
    console.log('Error in resendOtpController:', error);
    return next(error);
  }
};
