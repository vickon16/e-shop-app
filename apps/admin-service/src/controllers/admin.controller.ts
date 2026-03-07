import { TUserRoles } from '@e-shop-app/packages/constants';
import {
  appDb,
  desc,
  eq,
  sellersTable,
  usersTable,
  notificationsTable,
} from '@e-shop-app/packages/database';
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '@e-shop-app/packages/error-handler';
import { getUserBy, sendSuccess } from '@e-shop-app/packages/utils';
import { TAddNewAdminSchema } from '@e-shop-app/packages/zod-schemas';
import { NextFunction, Request, Response } from 'express';

// get admin info
export const getAdminInfoController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const admin = await getUserBy('id', authUser.userId);

    if (!admin || admin.role !== 'admin') {
      throw new NotFoundError(`Admin not found`);
    }

    sendSuccess(res, admin, 'Admin retrieved successfully');
  } catch (error) {
    console.log('Error in getAdminController:', error);
    return next(error);
  }
};

export const getAllUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const type = (req.query?.type as TUserRoles) || 'user';

    const users = await appDb.query.usersTable.findMany({
      where: (table, { eq }) => eq(table.role, type),
      orderBy: desc(usersTable.createdAt),
      with: {
        avatar: true,
      },
    });

    sendSuccess(res, users, 'Users retrieved successfully');
  } catch (error) {
    console.log('Error in getAdminsController:', error);
    return next(error);
  }
};

export const getAllSellersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const sellers = await appDb.query.sellersTable.findMany({
      orderBy: desc(sellersTable.createdAt),
      with: {
        shop: true,
        avatar: true,
      },
    });

    sendSuccess(res, sellers, 'Sellers retrieved successfully');
  } catch (error) {
    console.log('Error in getSellersController:', error);
    return next(error);
  }
};

export const addNewAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const { email, role } = req.body as TAddNewAdminSchema;

    const existingUser = await getUserBy('email', email);
    if (!existingUser) {
      throw new ValidationError('User not found');
    }

    if (existingUser.role === role) {
      throw new ValidationError(`User is already a ${role}`);
    }

    // update role
    const updatedUser = await appDb
      .update(usersTable)
      .set({
        role,
      })
      .where(eq(usersTable.id, existingUser.id));

    if (!updatedUser) {
      throw new ValidationError('Failed to update user role');
    }

    sendSuccess(res, updatedUser, 'Admin updated successfully');
  } catch (error) {
    console.log('Error in addNewAdminController:', error);
    return next(error);
  }
};

export const getAllCustomizationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const config = await appDb.query.siteConfigTable.findFirst();

    if (!config) {
      throw new NotFoundError('Site config not found');
    }

    sendSuccess(res, config, 'Site config retrieved successfully');
  } catch (error) {
    console.log('Error in getAllCustomizationsController:', error);
    return next(error);
  }
};

export const getAllNotificationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const notifications = await appDb.query.notificationsTable.findMany({
      orderBy: desc(notificationsTable.createdAt),
    });

    sendSuccess(res, notifications, 'Notifications retrieved successfully');
  } catch (error) {
    console.log('Error in getAllNotificationsController:', error);
    return next(error);
  }
};
