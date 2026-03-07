import { registerRoute } from '@e-shop-app/packages/libs/swagger';
import express from 'express';
import {
  createPaymentIntentContract,
  createPaymentSessionContract,
  getOrderDetailsContract,
  getSellerOrdersContract,
  getUserOrdersContract,
  verifyPaymentSessionContract,
  updateOrderStatusContract,
  verifyCouponContract,
  getUserOrderStatsContract,
  getAdminOrdersContract,
} from '../contracts/order.contract';
import {
  createPaymentIntentController,
  createPaymentSessionController,
  getOrderDetailsController,
  getSellerOrdersController,
  getUserOrdersController,
  verifyPaymentSessionController,
  updateOrderStatusController,
  verifyCouponController,
  getUserOrderStatsController,
  getAdminOrdersController,
} from '../controllers/order.controller';

const orderRouter = express.Router();

// create payment intent
registerRoute(
  orderRouter,
  createPaymentIntentContract,
  createPaymentIntentController,
);

// create payment session
registerRoute(
  orderRouter,
  createPaymentSessionContract,
  createPaymentSessionController,
);

// verify payment session
registerRoute(
  orderRouter,
  verifyPaymentSessionContract,
  verifyPaymentSessionController,
);

// get seller orders
registerRoute(orderRouter, getSellerOrdersContract, getSellerOrdersController);

// get all orders
registerRoute(orderRouter, getAdminOrdersContract, getAdminOrdersController);

// get user orders
registerRoute(orderRouter, getUserOrdersContract, getUserOrdersController);

// get order details
registerRoute(orderRouter, getOrderDetailsContract, getOrderDetailsController);

// update order status
registerRoute(
  orderRouter,
  updateOrderStatusContract,
  updateOrderStatusController,
);

// verify coupon
registerRoute(orderRouter, verifyCouponContract, verifyCouponController);

// get user order stats
registerRoute(
  orderRouter,
  getUserOrderStatsContract,
  getUserOrderStatsController,
);

export default orderRouter;
