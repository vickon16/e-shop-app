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
  arrayOverlaps,
  asc,
  avatarTable,
  count,
  desc,
  discountCodesTable,
  eq,
  gte,
  ilike,
  imagesTable,
  inArray,
  isNotNull,
  isNull,
  lte,
  or,
  ordersTable,
  productsTable,
  shopsTable,
  sql,
} from '@e-shop-app/packages/database';
import { imagekit } from '@e-shop-app/packages/libs/imagekit';
import {
  TFilteredProductType,
  TProductQueryType,
} from '@e-shop-app/packages/types';
import {
  paginatedDtoSchema,
  TCreateDiscountCodesSchema,
  TPaginatedDTOSchema,
  TProductSchema,
  TUploadProductImageResponseSchema,
} from '@e-shop-app/packages/zod-schemas';

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

    if (!seller.shopId) {
      throw new BadRequestError('Seller has not created a shop yet');
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

    if (!seller.shopId) {
      throw new BadRequestError('Seller does not have a shop yet');
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

const paginationDtoWrapper = async (
  req: Request,
  callback: (paginatedData: TPaginatedDTOSchema) => Promise<void>,
) => {
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

  return await callback(paginationDto.data);
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

    await paginationDtoWrapper(req, async (paginationDto) => {
      const { page, limit, order } = paginationDto;
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
        paginationDto,
      );

      sendSuccess(
        res,
        { paginatedResult, top10By: type, top10Results },
        'Successfully retrieved product',
      );
    });
  } catch (error) {
    console.log('Error in getAllProductController:', error);
    return next(error);
  }
};

// Get filtered products
export const getFilteredProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await paginationDtoWrapper(req, async (paginationDto) => {
      const { page, limit, order } = paginationDto;
      const type = (req.query.type || 'default') as TFilteredProductType;
      const priceRange = (req.query?.priceRange || '') as string;
      const categories = (req.query?.categories || '') as string;
      const sizes = (req.query?.sizes || '') as string;
      const colors = (req.query?.colors || '') as string;
      const skip = (page - 1) * limit;

      const minRange = 0;
      const maxRange = 10000;

      const parsedPriceRange = priceRange
        ? priceRange.split(',').map(Number)
        : [minRange, maxRange];
      const categoryArray = categories ? categories.split(',') : [];
      const sizeArray = sizes ? sizes.split(',') : [];
      const colorArray = colors ? colors.split(',') : [];

      const minRangeStr = (parsedPriceRange[0] || minRange).toString();
      const maxRangeStr = (parsedPriceRange[1] || maxRange).toString();

      const filters = and(
        // price range
        gte(productsTable.salePrice, minRangeStr),
        lte(productsTable.salePrice, maxRangeStr),

        // startingDate / endingDate logic
        type === 'event'
          ? isNotNull(productsTable.startingDate)
          : isNull(productsTable.startingDate),

        // categories (if provided)
        categoryArray.length > 0
          ? inArray(productsTable.category, categoryArray)
          : undefined,

        // sizes (if provided) → hasSome equivalent
        sizeArray.length > 0
          ? arrayOverlaps(productsTable.sizes, sizeArray)
          : undefined,

        // colors (if provided) → hasSome equivalent
        colorArray.length > 0
          ? arrayOverlaps(productsTable.colors, colorArray)
          : undefined,
      );

      const orderFunc = order === Order.ASC ? asc : desc;

      const [productsResults, countResult] = await Promise.all([
        // fetch all products
        appDb.query.productsTable.findMany({
          where: filters,
          orderBy: orderFunc(productsTable.createdAt),
          limit,
          offset: skip,
          with: {
            images: true,
            shop: { with: { avatar: true } },
          },
        }),

        // count products
        appDb.select({ total: count() }).from(productsTable).where(filters),
      ]);

      const itemCount = countResult?.[0]?.total || 0;

      const paginatedResult = new PaginationResultDto(
        productsResults,
        itemCount,
        paginationDto,
      );

      sendSuccess(res, paginatedResult, 'Successfully retrieved product');
    });
  } catch (error) {
    console.log('Error in getFilteredController:', error);
    return next(error);
  }
};

// Get searched products
export const getSearchedProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await paginationDtoWrapper(req, async (paginationDto) => {
      const { page, limit, order } = paginationDto;
      const query = (req.query.q || '') as string;
      const skip = (page - 1) * limit;

      if (!query) {
        throw new ValidationError('Query parameter "q" is required');
      }

      const orderFunc = order === Order.ASC ? asc : desc;

      const safeQuery = query.trim();

      const searchFilter = or(
        ilike(productsTable.title, `%${safeQuery}%`),
        ilike(productsTable.description, `%${safeQuery}%`),
        ilike(productsTable.detailedDescription, `%${safeQuery}%`),
        ilike(productsTable.category, `%${safeQuery}%`),
      );

      const [productsResults, countResult] = await Promise.all([
        // fetch all products
        appDb.query.productsTable.findMany({
          where: searchFilter,
          orderBy: orderFunc(productsTable.createdAt),
          limit,
          offset: skip,
          columns: {
            id: true,
            title: true,
            slug: true,
            salePrice: true,
            category: true,
          },
          with: {
            images: true,
          },
        }),

        // count products
        appDb
          .select({ total: count() })
          .from(productsTable)
          .where(searchFilter),
      ]);

      const itemCount = countResult?.[0]?.total || 0;

      const paginatedResult = new PaginationResultDto(
        productsResults,
        itemCount,
        paginationDto,
      );

      sendSuccess(res, paginatedResult, 'Successfully retrieved product');
    });
  } catch (error) {
    console.log('Error in getSearchedProductsController:', error);
    return next(error);
  }
};

// Get filtered shops
export const getFilteredShopsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await paginationDtoWrapper(req, async (paginationDto) => {
      const { page, limit, order } = paginationDto;
      const countries = (req.query?.countries || '') as string;
      const categories = (req.query?.categories || '') as string;
      const skip = (page - 1) * limit;

      const categoryArray = categories ? categories.split(',') : [];
      const countriesArray = countries ? countries.split(',') : [];

      const filters = and(
        // categories (if provided)
        categoryArray.length > 0
          ? inArray(shopsTable.category, categoryArray)
          : undefined,

        // countries (if provided) → hasSome equivalent
        countriesArray.length > 0
          ? inArray(shopsTable.country, countriesArray)
          : undefined,
      );

      const orderFunc = order === Order.ASC ? asc : desc;

      const [shopResults, countResult] = await Promise.all([
        // fetch all shop
        appDb.query.shopsTable.findMany({
          where: filters,
          orderBy: orderFunc(shopsTable.createdAt),
          limit,
          offset: skip,
          with: {
            avatar: true,
            seller: true,
          },
        }),

        // count shop
        appDb.select({ total: count() }).from(shopsTable).where(filters),
      ]);

      const itemCount = countResult?.[0]?.total || 0;

      const paginatedResult = new PaginationResultDto(
        shopResults,
        itemCount,
        paginationDto,
      );

      sendSuccess(res, paginatedResult, 'Successfully retrieved shops');
    });
  } catch (error) {
    console.log('Error in getFilteredShopsController:', error);
    return next(error);
  }
};

// Get top shops
export const getTopShopsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // aggregate total sales per shop from orders

    const top10ShopsData = await appDb
      .select({
        id: shopsTable.id,
        name: shopsTable.name,
        ratings: shopsTable.ratings,
        coverBanner: shopsTable.coverBanner,
        address: shopsTable.address,
        category: shopsTable.category,

        avatar: {
          fileId: avatarTable.fileId,
          fileUrl: avatarTable.fileUrl,
        },

        totalSales: sql<number>`SUM(${ordersTable.total})`.as('total_sales'),
      })
      .from(ordersTable)
      .innerJoin(shopsTable, eq(ordersTable.shopId, shopsTable.id))
      .leftJoin(avatarTable, eq(shopsTable.avatarId, avatarTable.id))
      .groupBy(shopsTable.id, avatarTable.id)
      .orderBy(desc(sql`SUM(${ordersTable.total})`))
      .limit(10);

    sendSuccess(res, top10ShopsData, 'Successfully retrieved top shops');
  } catch (error) {
    console.log('Error in getTopShopsController:', error);
    return next(error);
  }
};

// Get product by Id
export const getProductByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await baseGetProductBy(req, res, 'id');
  } catch (error) {
    console.log('Error in getProductByIdController:', error);
    return next(error);
  }
};

// Get product by slug
export const getProductBySlugController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await baseGetProductBy(req, res, 'slug');
  } catch (error) {
    console.log('Error in getProductBySlugController:', error);
    return next(error);
  }
};

const baseGetProductBy = async (
  req: Request,
  res: Response,
  by: 'id' | 'slug',
) => {
  let product;

  if (by === 'slug' && !!req.params?.slug) {
    product = await appDb.query.productsTable.findFirst({
      where: and(eq(productsTable.slug, req.params.slug)),
      with: { images: true, shop: true },
    });
  } else {
    product = await appDb.query.productsTable.findFirst({
      where: and(eq(productsTable.id, req.params?.id)),
      with: { images: true, shop: true },
    });
  }

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  sendSuccess(res, product, 'Successfully retrieved product');
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
