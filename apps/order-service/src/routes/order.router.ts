import { registerRoute } from '@e-shop-app/packages/libs/swagger';
import express from 'express';
import {
  createOrderContract,
  createPaymentIntentContract,
  createPaymentSessionContract,
  verifyPaymentSessionContract,
} from '../contracts/order.contract';
import {
  createOrderController,
  createPaymentIntentController,
  createPaymentSessionController,
  verifyPaymentSessionController,
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

// create order
registerRoute(orderRouter, createOrderContract, createOrderController);

export default orderRouter;
