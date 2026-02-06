import { registerRoute } from '@e-shop-app/packages/libs/swagger';
import express from 'express';
import {
  createDiscountCodesContract,
  createProductContract,
  deleteDiscountCodeContract,
  deleteProductContract,
  deleteProductImageContract,
  getAllProductsContract,
  getCategoriesContract,
  getDiscountCodesContract,
  getShopProductContract,
  restoreProductContract,
  uploadProductImageContract,
} from '../contracts/product.contract';
import {
  createDiscountCodesController,
  createProductController,
  deleteDiscountCodeController,
  deleteProductController,
  deleteProductImageController,
  getAllProductsController,
  getCategoriesController,
  getDiscountCodesController,
  getShopProductController,
  restoreProductController,
  uploadProductImageController,
} from '../controllers/product.controller';

const productRouter = express.Router();

// create product
registerRoute(productRouter, createProductContract, createProductController);

// get shop product
registerRoute(productRouter, getShopProductContract, getShopProductController);

// get all product
registerRoute(productRouter, getAllProductsContract, getAllProductsController);

// Delete product
registerRoute(productRouter, deleteProductContract, deleteProductController);

// Restore product
registerRoute(productRouter, restoreProductContract, restoreProductController);

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

// Upload product image
registerRoute(
  productRouter,
  uploadProductImageContract,
  uploadProductImageController,
);

// Delete product image
registerRoute(
  productRouter,
  deleteProductImageContract,
  deleteProductImageController,
);

export default productRouter;
