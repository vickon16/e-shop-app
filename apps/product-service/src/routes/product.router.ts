import { registerRoute } from '@e-shop-app/packages/libs/swagger';
import express from 'express';
import {
  createDiscountCodesContract,
  deleteDiscountCodeContract,
  getCategoriesContract,
  getDiscountCodesContract,
} from '../contracts/product.contract';
import {
  createDiscountCodesController,
  deleteDiscountCodeController,
  getCategoriesController,
  getDiscountCodesController,
} from '../controllers/product.controller';

const productRouter = express.Router();

// Get product categories
registerRoute(productRouter, getCategoriesContract, getCategoriesController);

// Create discount codes
registerRoute(
  productRouter,
  createDiscountCodesContract,
  createDiscountCodesController,
);

// Get discount codes
registerRoute(
  productRouter,
  getDiscountCodesContract,
  getDiscountCodesController,
);

// Delete discount code
registerRoute(
  productRouter,
  deleteDiscountCodeContract,
  deleteDiscountCodeController,
);

export default productRouter;
