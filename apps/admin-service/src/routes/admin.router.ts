import { registerRoute } from '@e-shop-app/packages/libs/swagger';
import express from 'express';
import {
  addNewAdminContract,
  getAdminInfoContract,
  getAllSellersContract,
  getAllUsersContract,
  getAllNotificationsContract,
} from '../contracts/admin.contract';
import {
  addNewAdminController,
  getAdminInfoController,
  getAllSellersController,
  getAllUsersController,
  getAllNotificationsController,
} from '../controllers/admin.controller';

const adminRouter = express.Router();

// get admin info
registerRoute(adminRouter, getAdminInfoContract, getAdminInfoController);

// get all users
registerRoute(adminRouter, getAllUsersContract, getAllUsersController);

// get all sellers
registerRoute(adminRouter, getAllSellersContract, getAllSellersController);

// add new admin
registerRoute(adminRouter, addNewAdminContract, addNewAdminController);

// get all notifications
registerRoute(
  adminRouter,
  getAllNotificationsContract,
  getAllNotificationsController,
);

export default adminRouter;
