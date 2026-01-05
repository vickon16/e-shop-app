import express from 'express';
import {
  userForgotPasswordController,
  loginUserController,
  resetPasswordController,
  userRegistrationController,
  verifyUserController,
  verifyOtpController,
  resendOtpController,
} from '../controllers/auth.controller';
import { registerRoute } from '../utils/register-route';
import {
  forgotPasswordContract,
  loginUserContract,
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

export default authRouter;
