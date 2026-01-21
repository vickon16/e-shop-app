import {
  appDb,
  eq,
  sellersTable,
  shopsTable,
  usersTable,
} from '@e-shop-app/packages/database';
import {
  AuthError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@e-shop-app/packages/error-handler';
import {
  JwtPayload,
  TUserAccountType,
  TUserWithPassword,
} from '@e-shop-app/packages/types';
import {
  hashPassword,
  sendSuccess,
  verifyJwtToken,
  verifyPassword,
} from '@e-shop-app/packages/utils';
import {
  TCreateShopSchema,
  TCreateStripeConnectLinkSchema,
  TCreateUserSchema,
  TLoginSchema,
  TResetPasswordSchema,
  TVerifyOtpSchema,
} from '@e-shop-app/packages/zod-schemas';
import { NextFunction, Request, Response } from 'express';
import {
  baseGetCurrentAccount,
  generateToken,
  handleBaseVerifyAccount,
  handleSendOtp,
  startOtpCheckAndSend,
  verifyOtp,
} from '../utils/helpers/auth.helpers';

import { appStripe } from '@e-shop-app/packages/libs/stripe';
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
    await handleBaseVerifyAccount(req, res, 'user');
  } catch (error) {
    console.log('Error in verifyUser:', error);
    return next(error);
  }
};

// Verify user with OTP
export const verifySellerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await handleBaseVerifyAccount(req, res, 'seller');
  } catch (error) {
    console.log('Error in verifySeller:', error);
    return next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accountType: TUserAccountType =
      req.query['accountType'] === 'seller' ? 'seller' : 'user';

    const body = req.body as TLoginSchema;
    const { email, password } = body;

    let existingUser:
      | Pick<
          TUserWithPassword,
          'id' | 'name' | 'email' | 'password' | 'emailVerified'
        >
      | undefined;

    if (accountType === 'seller') {
      existingUser = await getSellerBy('email', email, true);
    } else {
      existingUser = await getUserBy('email', email, true);
    }

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

    if (accountType === 'seller') {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
    } else {
      res.clearCookie('seller_access_token');
      res.clearCookie('seller_refresh_token');
    }

    const payload: JwtPayload = {
      userId: existingUser.id,
      email: existingUser.email,
      role: accountType,
    };

    generateToken(res, payload, accountType);

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
    console.log('Error in loginController:', error);
    return next(error);
  }
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
    const accountType: TUserAccountType =
      req.query['accountType'] === 'seller' ? 'seller' : 'user';

    const refreshToken =
      req.cookies[
        accountType === 'seller' ? 'seller_refresh_token' : 'refresh_token'
      ];

    if (!refreshToken) {
      throw new ForbiddenError('Refresh token is missing');
    }

    // Verify refresh token
    const decoded = verifyJwtToken(refreshToken, 'refresh');

    let currentUser;

    if (decoded.role === 'seller') {
      currentUser = await getSellerBy('id', decoded.userId);
    } else {
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
      accountType,
      true,
    );

    sendSuccess(res, null, 'Token refreshed successfully');
  } catch (error) {
    console.log('Error in refreshTokenController:', error);
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
    await baseGetCurrentAccount(req, res, 'user');
  } catch (error) {
    console.log('Error in getUserController:', error);
    return next(error);
  }
};

// Get logged in user
export const getSellerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await baseGetCurrentAccount(req, res, 'seller');
  } catch (error) {
    console.log('Error in getSellerController:', error);
    return next(error);
  }
};

export const createShopController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body as TCreateShopSchema;

    const createdShop = await appDb
      .insert(shopsTable)
      .values({
        ...body,
      })
      .returning();

    const newShop = createdShop?.[0];

    if (!newShop) {
      throw new Error('Failed to create shop');
    }

    // update seller with shopId
    await appDb
      .update(sellersTable)
      .set({ shopId: newShop.id })
      .where(eq(sellersTable.id, body.sellerId));

    sendSuccess(res, newShop, 'Shop created successfully');
  } catch (error) {
    console.log('Error in createShopController:', error);
    return next(error);
  }
};

export const createStripeConnectLinkController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body as TCreateStripeConnectLinkSchema;

    const seller = await getSellerBy('id', body.sellerId);

    if (!seller) {
      throw new NotFoundError('Seller not found');
    }

    // create stripe express account if not exists
    const account = await appStripe.accounts.create({
      type: 'express',
      country: 'US',
      email: seller.email,
      business_type: 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await appDb
      .update(sellersTable)
      .set({
        stripeId: account.id,
      })
      .where(eq(sellersTable.id, seller.id));

    const accountLink = await appStripe.accountLinks.create({
      account: account.id,
      refresh_url: body.refreshUrl,
      return_url: body.returnUrl,
      type: 'account_onboarding',
    });

    sendSuccess(
      res,
      { url: accountLink.url },
      'Stripe link created successfully',
    );
  } catch (error) {
    console.log('Error in createStripeConnectLink:', error);
    return next(error);
  }
};
