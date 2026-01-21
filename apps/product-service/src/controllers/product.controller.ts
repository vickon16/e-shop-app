import {
  AuthError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@e-shop-app/packages/error-handler';
import { sendSuccess } from '@e-shop-app/packages/utils';
import { NextFunction, Request, Response } from 'express';

import { appDb, discountCodesTable, eq } from '@e-shop-app/packages/database';
import { TCreateDiscountCodesSchema } from '@e-shop-app/packages/zod-schemas';

// Get product categories
export const getCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await appDb.query.siteConfigTable.findFirst();

    if (!config) {
      throw new NotFoundError('Categories not found');
    }

    sendSuccess(
      res,
      {
        categories: config.categories,
        subCategories: config.subCategories,
      },
      'Categories fetched successfully',
    );
  } catch (error) {
    console.log('Error in getCategories:', error);
    return next(error);
  }
};

// Create discount codes
export const createDiscountCodesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const body = req.body as TCreateDiscountCodesSchema;

    const isDiscountCodeExists = await appDb.query.discountCodesTable.findFirst(
      {
        where: eq(discountCodesTable.discountCode, body.discountCode),
      },
    );

    if (isDiscountCodeExists) {
      return new ConflictError('Discount code already exists');
    }

    const newDiscountCode = await appDb
      .insert(discountCodesTable)
      .values({ ...body, sellerId: authUser.userId })
      .returning();

    if (newDiscountCode.length === 0) {
      throw new BadRequestError('Failed to create discount codes');
    }

    sendSuccess(
      res,
      newDiscountCode[0],
      'Successfully created discount codes',
      201,
    );
  } catch (error) {
    console.log('Error in createDiscountCodes:', error);
    return next(error);
  }
};

// Get discount codes
export const getDiscountCodesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const discountCodes = await appDb.query.discountCodesTable.findMany({
      where: eq(discountCodesTable.sellerId, authUser.userId),
    });

    sendSuccess(
      res,
      discountCodes || [],
      'Successfully fetched discount codes',
    );
  } catch (error) {
    console.log('Error in getDiscountCodes:', error);
    return next(error);
  }
};

// Get discount codes
export const deleteDiscountCodeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const { id } = req.params;

    console.log({ id });

    const discountCode = await appDb.query.discountCodesTable.findFirst({
      where: eq(discountCodesTable.id, id),
    });

    if (!discountCode) {
      throw new NotFoundError('Discount code not found');
    }

    if (discountCode.sellerId !== authUser.userId) {
      throw new AuthError('Unauthorized to delete this discount code');
    }

    await appDb.delete(discountCodesTable).where(eq(discountCodesTable.id, id));

    sendSuccess(res, null, 'Successfully deleted discount code', 204);
  } catch (error) {
    console.log('Error in deleteDiscountCode:', error);
    return next(error);
  }
};
