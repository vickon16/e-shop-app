import { registerRoute } from '@e-shop-app/packages/libs/swagger';
import express from 'express';
import {
  createDiscountCodesContract,
  createProductContract,
  deleteDiscountCodeContract,
  deleteProductContract,
  deleteProductImageContract,
  deleteShopContract,
  getAllProductsContract,
  getCategoriesContract,
  getDiscountCodesContract,
  getFilteredProductsContract,
  getFilteredShopsContract,
  getProductByIdContract,
  getProductBySlugContract,
  getSearchedProductsContract,
  getShopProductContract,
  getTopShopsContract,
  restoreProductContract,
  restoreShopContract,
  uploadProductImageContract,
} from '../contracts/product.contract';
import {
  createDiscountCodesController,
  createProductController,
  deleteDiscountCodeController,
  deleteProductController,
  deleteProductImageController,
  deleteShopController,
  getAllProductsController,
  getCategoriesController,
  getDiscountCodesController,
  getFilteredProductsController,
  getFilteredShopsController,
  getProductByIdController,
  getProductBySlugController,
  getSearchedProductsController,
  getShopProductController,
  getTopShopsController,
  restoreProductController,
  restoreShopController,
  uploadProductImageController,
} from '../controllers/product.controller';

const productRouter = express.Router();

// create product
registerRoute(productRouter, createProductContract, createProductController);

// get shop product
registerRoute(productRouter, getShopProductContract, getShopProductController);

// get all product
registerRoute(productRouter, getAllProductsContract, getAllProductsController);

// get filtered product
registerRoute(
  productRouter,
  getFilteredProductsContract,
  getFilteredProductsController,
);

// get search products
registerRoute(
  productRouter,
  getSearchedProductsContract,
  getSearchedProductsController,
);

// get filtered shops
registerRoute(
  productRouter,
  getFilteredShopsContract,
  getFilteredShopsController,
);

// get top shops
registerRoute(productRouter, getTopShopsContract, getTopShopsController);

// get product by Id
registerRoute(productRouter, getProductByIdContract, getProductByIdController);

// get product by slug
registerRoute(
  productRouter,
  getProductBySlugContract,
  getProductBySlugController,
);

// Delete product
registerRoute(productRouter, deleteProductContract, deleteProductController);

// Restore product
registerRoute(productRouter, restoreProductContract, restoreProductController);

// Delete shop
registerRoute(productRouter, deleteShopContract, deleteShopController);

// Restore shop
registerRoute(productRouter, restoreShopContract, restoreShopController);

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
