import express from 'express';
import {
  userForgotPasswordController,
  loginUserController,
  resetPasswordController,
  userRegistrationController,
  verifyUserController,
  verifyOtpController,
  resendOtpController,
  refreshTokenController,
  getUserController,
  sellerRegistrationController,
  verifySellerController,
  createShopController,
} from '../controllers/auth.controller';
import { registerRoute } from '../utils/register-route';
import {
  createShopContract,
  forgotPasswordContract,
  getUserContract,
  loginUserContract,
  refreshTokenContract,
  resendOtpContract,
  resetPasswordContract,
  sellerRegistrationContract,
  userRegistrationContract,
  verifyOtpContract,
  verifySellerContract,
  verifyUserContract,
} from '../contracts/auth.contract';

const authRouter = express.Router();

// register user
registerRoute(authRouter, userRegistrationContract, userRegistrationController);

// register seller
registerRoute(
  authRouter,
  sellerRegistrationContract,
  sellerRegistrationController,
);

// verify user and create account
registerRoute(authRouter, verifyUserContract, verifyUserController);

// verify seller and create account
registerRoute(authRouter, verifySellerContract, verifySellerController);

// login user
registerRoute(authRouter, loginUserContract, loginUserController);

// forgot password
registerRoute(authRouter, forgotPasswordContract, userForgotPasswordController);

// reset password
registerRoute(authRouter, resetPasswordContract, resetPasswordController);

// verify otp
registerRoute(authRouter, verifyOtpContract, verifyOtpController);

// resend otp
registerRoute(authRouter, resendOtpContract, resendOtpController);

// refresh token
registerRoute(authRouter, refreshTokenContract, refreshTokenController);

// Get logged in user
registerRoute(authRouter, getUserContract, getUserController);

// create shop
registerRoute(authRouter, createShopContract, createShopController);

export default authRouter;
