import {
  AuthError,
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from '@e-shop-app/packages/error-handler';
import {
  getSellerBy,
  Order,
  PaginationResultDto,
  sendSuccess,
} from '@e-shop-app/packages/utils';
import { NextFunction, Request, Response } from 'express';

import {
  and,
  appDb,
  discountCodesTable,
  eq,
  imagesTable,
  productsTable,
  count,
  or,
  isNull,
  desc,
  asc,
} from '@e-shop-app/packages/database';
import { imagekit } from '@e-shop-app/packages/libs/imagekit';
import {
  paginatedDtoSchema,
  TCreateDiscountCodesSchema,
  TProductSchema,
  TUploadProductImageResponseSchema,
} from '@e-shop-app/packages/zod-schemas';
import { TProductQueryType } from '@e-shop-app/packages/types';

// Create product
export const createProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const body = req.body as TProductSchema & {
      images: TUploadProductImageResponseSchema[];
    };

    // check if slug is available in our database
    const isSlugExists = await appDb.query.productsTable.findFirst({
      where: eq(productsTable.slug, body.slug),
    });

    if (isSlugExists) {
      throw new ConflictError('Product slug already exists');
    }

    // get seller details
    const seller = await getSellerBy('id', authUser.userId);

    if (!seller) {
      throw new NotFoundError('Seller not found');
    }

    // comma separated tags to lowercase tags array
    const tags = body?.tags
      ? body.tags.split(',').map((tag) => tag.toLowerCase())
      : [];

    const discountCodes = Array.isArray(body.discountCodes)
      ? body.discountCodes
      : [];

    // create new product
    const newProductArray = await appDb
      .insert(productsTable)
      .values({
        ...body,
        tags,
        stock: parseInt(body.stock),
        discountCodes,
        shopId: seller.shopId,
        sellerId: seller.id,
      })
      .returning();

    const newProduct = newProductArray?.[0];
    if (!newProduct) {
      throw new BadRequestError('Failed to create product');
    }

    // create images for product
    await Promise.all(
      body.images.map(async (image) => {
        await appDb.insert(imagesTable).values({
          ...image,
          productId: newProduct.id,
          sellerId: seller.id,
          shopId: seller.shopId,
        });
      }),
    );

    sendSuccess(res, newProduct, 'Successfully created product', 201);
  } catch (error) {
    console.log('Error in createProductImage:', error);
    return next(error);
  }
};

// Get shop product
export const getShopProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    // get seller details
    const seller = await getSellerBy('id', authUser.userId);

    if (!seller) {
      throw new NotFoundError('Seller not found');
    }

    const products = await appDb.query.productsTable.findMany({
      where: eq(productsTable.shopId, seller.shopId),
      with: {
        images: true,
        shop: true,
      },
    });

    sendSuccess(res, products, 'Successfully retrieved product');
  } catch (error) {
    console.log('Error in getShopProductController:', error);
    return next(error);
  }
};

// Get all products
export const getAllProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const paginationDto = paginatedDtoSchema.safeParse({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      order: (req.query.order as Order) || Order.DESC,
    });

    if (!paginationDto.success) {
      throw new ValidationError(
        'Invalid query parameters',
        paginationDto.error.message,
      );
    }

    const { page, limit, order } = paginationDto.data;
    const type = (req.query.type || 'latest') as TProductQueryType;
    const skip = (page - 1) * limit;

    const baseWhere = or(
      isNull(productsTable.startingDate),
      isNull(productsTable.endingDate),
    );

    const orderFunc = order === Order.ASC ? asc : desc;

    const orderBy =
      type === 'top-sales'
        ? orderFunc(productsTable.totalSales)
        : orderFunc(productsTable.createdAt);

    const baseWith = {
      images: true,
      shop: { with: { avatar: true } },
    } as const;

    const [productsResults, countResult, top10Results] = await Promise.all([
      // fetch all products
      appDb.query.productsTable.findMany({
        where: baseWhere,
        orderBy,
        limit,
        offset: skip,
        with: baseWith,
      }),

      // count products
      appDb.select({ total: count() }).from(productsTable).where(baseWhere),

      // top 10 products
      appDb.query.productsTable.findMany({
        where: baseWhere,
        orderBy,
        limit: 10,
      }),
    ]);

    const itemCount = countResult?.[0]?.total || 0;

    const paginatedResult = new PaginationResultDto(
      productsResults,
      itemCount,
      paginationDto.data,
    );

    sendSuccess(
      res,
      { paginatedResult, top10By: type, top10Results },
      'Successfully retrieved product',
    );
  } catch (error) {
    console.log('Error in getAllProductController:', error);
    return next(error);
  }
};

const baseProductCheck = async (req: Request) => {
  const authUser = req.user;
  if (!authUser) {
    throw new AuthError('Unauthorized');
  }

  const productId = req.params?.id;

  const product = await appDb.query.productsTable.findFirst({
    where: and(
      eq(productsTable.id, productId),
      eq(productsTable.sellerId, authUser.userId),
    ),
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  return product;
};

// Delete product
export const deleteProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await baseProductCheck(req);

    if (product.deletedAt) {
      throw new BadRequestError('Product is already deleted');
    }

    const deletedProduct = await appDb
      .update(productsTable)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(productsTable.id, product.id))
      .returning();

    if (!deletedProduct?.[0]) {
      throw new InternalServerError(
        'Something went wrong when deleting product',
      );
    }

    sendSuccess(
      res,
      {
        deletedAt: deletedProduct[0].deletedAt,
      },
      'Product is scheduled for deletion in 24 hours. You can restore it within this time',
    );
  } catch (error) {
    console.log('Error in deleteProductController:', error);
    return next(error);
  }
};

// Restore product
export const restoreProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await baseProductCheck(req);

    if (!product.deletedAt) {
      throw new BadRequestError('Product is not deleted. No need to restore');
    }

    const restoredProduct = await appDb
      .update(productsTable)
      .set({
        deletedAt: null,
      })
      .where(eq(productsTable.id, product.id))
      .returning();

    if (!restoredProduct?.[0]) {
      throw new InternalServerError(
        'Something went wrong when restoring product',
      );
    }

    sendSuccess(res, restoredProduct, 'Product has been successfully restored');
  } catch (error) {
    console.log('Error in restoreProductController:', error);
    return next(error);
  }
};

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

// Upload product image
export const uploadProductImageController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    const { buffer, mimetype } = req.file;

    // Convert to base64
    const base64Image = buffer.toString('base64');

    // Upload to ImageKit
    const response = await imagekit.upload({
      file: `data:${mimetype};base64,${base64Image}`,
      fileName: `product_${Date.now()}`,
      folder: `/e-shop-products/${authUser.userId}`,
    });

    if (!response?.url) {
      throw new BadRequestError('Failed to upload image');
    }

    return sendSuccess(
      res,
      {
        fileUrl: response.url,
        fileId: response.fileId,
      },
      'Successfully uploaded product image',
    );
  } catch (error) {
    console.log('Error in uploadProductImage:', error);
    return next(error);
  }
};

// Upload product image
export const deleteProductImageController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const { fileId } = req.params;

    await imagekit.deleteFile(fileId);

    sendSuccess(res, null, 'Successfully deleted product image');
  } catch (error) {
    console.log('Error in deleteProductImage:', error);
    return next(error);
  }
};
