import express from 'express';
import {
  userForgotPasswordController,
  loginController,
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
  createStripeConnectLinkController,
  getSellerController,
  logoutController,
  createUserAddressController,
  deleteUserAddressController,
  getUserAddressesController,
} from '../controllers/auth.controller';
import { registerRoute } from '@e-shop-app/packages/libs/swagger';
import {
  createShopContract,
  createStripeConnectLinkContract,
  createUserAddressContract,
  deleteUserAddressContract,
  forgotPasswordContract,
  getSellerContract,
  getUserAddressesContract,
  getUserContract,
  loginUserContract,
  logoutContract,
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
registerRoute(authRouter, loginUserContract, loginController);

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

// Get logged in seller
registerRoute(authRouter, getSellerContract, getSellerController);

// create shop
registerRoute(authRouter, createShopContract, createShopController);

// create user address
registerRoute(
  authRouter,
  createUserAddressContract,
  createUserAddressController,
);

// get user addresses
registerRoute(authRouter, getUserAddressesContract, getUserAddressesController);

// delete user address
registerRoute(
  authRouter,
  deleteUserAddressContract,
  deleteUserAddressController,
);

// create stripe connect link
registerRoute(
  authRouter,
  createStripeConnectLinkContract,
  createStripeConnectLinkController,
);

// logout user
registerRoute(authRouter, logoutContract, logoutController);

export default authRouter;
