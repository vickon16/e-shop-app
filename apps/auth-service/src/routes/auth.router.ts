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
} from '../controllers/auth.controller';
import { registerRoute } from '../utils/register-route';
import {
  forgotPasswordContract,
  getUserContract,
  loginUserContract,
  refreshTokenContract,
  resendOtpContract,
  resetPasswordContract,
  userRegistrationContract,
  verifyOtpContract,
  verifyUserContract,
} from '../contracts/auth.contract';

const authRouter = express.Router();

// register user
registerRoute(authRouter, userRegistrationContract, userRegistrationController);

// verify user and create account
registerRoute(authRouter, verifyUserContract, verifyUserController);

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

export default authRouter;
