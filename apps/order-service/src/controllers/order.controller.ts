import {
  AuthError,
  BadRequestError,
  NotFoundError,
} from '@e-shop-app/packages/error-handler';
import {
  PAYMENT_SESSION_PREFIX,
  constructPaymentSession,
  redis,
} from '@e-shop-app/packages/libs/redis';
import { appStripe, orderEventHandler } from '@e-shop-app/packages/libs/stripe';
import { sendSuccess } from '@e-shop-app/packages/utils';
import { NextFunction, Request, Response } from 'express';

import {
  appDb,
  desc,
  discountCodesTable,
  eq,
  inArray,
  orderItemsTable,
  ordersTable,
  shopsTable,
} from '@e-shop-app/packages/database';
import { env } from '@e-shop-app/packages/env';
import { TPaymentSession } from '@e-shop-app/packages/types';
import {
  TCreatePaymentIntentSchema,
  TCreatePaymentSessionSchema,
  TUpdateOrderStatusSchema,
  TVerifyCouponSchema,
} from '@e-shop-app/packages/zod-schemas';
import Stripe from 'stripe';

// Create order
export const createPaymentIntentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const body = req.body as TCreatePaymentIntentSchema;
    const { amount, sellerStripeAccountId, sessionId } = body;

    console.log('Creating payment intent with data:', {
      amount,
      sellerStripeAccountId,
      sessionId,
    });

    const account = await appStripe.accounts.retrieve(sellerStripeAccountId);

    if (
      account.capabilities?.transfers !== 'active' ||
      account.capabilities?.card_payments !== 'active'
    ) {
      throw new Error('Seller account not fully onboarded');
    }

    const customerAmount = Math.round(amount * 100);
    const platformFee = Math.floor(customerAmount * 0.1);

    const paymentIntent = await appStripe.paymentIntents.create({
      amount: customerAmount,
      currency: 'usd',
      payment_method_types: ['card'],
      application_fee_amount: platformFee,
      transfer_data: {
        destination: sellerStripeAccountId,
      },
      metadata: {
        sessionId,
        userId: authUser.userId,
      },
    });

    sendSuccess(
      res,
      {
        clientSecret: paymentIntent.client_secret,
      },
      'Successfully created payment intent',
      201,
    );
  } catch (error) {
    console.log('Error in createPaymentIntent:', error);
    return next(error);
  }
};

// Create payment session for security
export const createPaymentSessionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const body = req.body as TCreatePaymentSessionSchema;
    const { cart, selectedAddressId, coupon } = body;

    if (!cart || cart.length === 0) {
      throw new BadRequestError('Cart cannot be empty');
    }

    // Fetch sellers and stripe account
    const uniqueShopIds = Array.from(new Set(cart.map((item) => item.shopId)));

    const shops = await appDb.query.shopsTable.findMany({
      where: inArray(shopsTable.id, uniqueShopIds),
      columns: { id: true, sellerId: true },
      with: { seller: { columns: { stripeId: true } } },
    });

    const sellersData: TPaymentSession['sellersData'] = shops.map((shop) => ({
      shopId: shop.id,
      stripeAccountId: shop?.seller?.stripeId,
      sellerId: shop.sellerId,
    }));

    // Calculate total amount
    const totalAmount = cart.reduce(
      (total, item) =>
        total + Number(item.salePrice || 0) * (item.quantity || 1),
      0,
    );

    // Create session payload.
    const sessionId = crypto.randomUUID();

    const paymentSessionPayload: TPaymentSession = {
      userId: authUser.userId,
      sessionId,
      cart,
      shippingAddressId: selectedAddressId || null,
      totalAmount,
      sellersData,
      coupon: coupon || null,
    };

    const sessionKey = constructPaymentSession(authUser.userId, sessionId);
    await redis.set(sessionKey, JSON.stringify(paymentSessionPayload));

    sendSuccess(
      res,
      { sessionId },
      'Successfully created payment session',
      201,
    );
  } catch (error) {
    console.log('Error in createPaymentSession:', error);
    return next(error);
  }
};

// Create order
export const verifyPaymentSessionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const sessionId = req.params?.sessionId;
    if (!sessionId) {
      throw new BadRequestError('Session ID is required');
    }

    const sessionKey = constructPaymentSession(authUser.userId, sessionId);
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      throw new NotFoundError('Payment session not found or expired');
    }

    const paymentSession = JSON.parse(sessionData) as TPaymentSession;

    sendSuccess(res, paymentSession, 'Successfully verified payment session');
  } catch (error) {
    console.log('Error in verifyPaymentSessionController:', error);
    return next(error);
  }
};

// Create order
export const createOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stripeSignature = req.headers['stripe-signature'] as string;
    if (!stripeSignature) {
      throw new BadRequestError('Stripe signature is required');
    }

    const rawBody = req.body;

    let event: Stripe.Event;

    try {
      event = appStripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      console.log('Error verifying Stripe webhook signature:', error);
      throw new BadRequestError('Invalid Stripe signature');
    }

    console.log('Received Stripe event:', event.type);

    await orderEventHandler(res, event);
  } catch (error) {
    console.log('Error in createOrderController:', error);
    return next(error);
  }
};

// get user orders
export const getUserOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const orders = await appDb.query.ordersTable.findMany({
      where: eq(ordersTable.userId, authUser.userId),
      with: {
        orderItems: {
          ...orderItemsTable,
          with: {
            product: {
              columns: { id: true, title: true },
              with: { images: true },
            },
          },
        },
        shop: true,
      },
      orderBy: desc(ordersTable.createdAt),
    });

    sendSuccess(res, orders, 'Successfully fetched user orders');
  } catch (error) {
    console.log('Error in getUserOrdersController:', error);
    return next(error);
  }
};

// get sellers orders
export const getSellerOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const sellerShop = await appDb.query.shopsTable.findFirst({
      where: eq(shopsTable.sellerId, authUser.userId),
    });

    if (!sellerShop) {
      throw new NotFoundError('Seller shop not found');
    }

    // fetch orders for the seller shop

    const orders = await appDb.query.ordersTable.findMany({
      where: eq(ordersTable.shopId, sellerShop.id),
      with: {
        orderItems: true,
        user: {
          columns: { id: true, name: true, email: true },
          with: { avatar: true },
        },
        shop: true,
      },
      orderBy: desc(ordersTable.createdAt),
    });

    sendSuccess(res, orders, 'Successfully fetched seller orders');
  } catch (error) {
    console.log('Error in getSellerOrdersController:', error);
    return next(error);
  }
};

export const getAdminOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const orders = await appDb.query.ordersTable.findMany({
      with: {
        orderItems: true,
        user: {
          columns: { id: true, name: true, email: true },
          with: { avatar: true },
        },
        shop: true,
      },
      orderBy: desc(ordersTable.createdAt),
    });

    sendSuccess(res, orders, 'Successfully fetched orders');
  } catch (error) {
    console.log('Error in getAdminOrdersController:', error);
    return next(error);
  }
};

// get order details
export const getOrderDetailsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const orderId = req.params?.orderId;
    if (!orderId) {
      throw new BadRequestError('Order ID is required');
    }

    const order = await appDb.query.ordersTable.findFirst({
      where: eq(ordersTable.id, orderId),
      with: {
        orderItems: {
          ...orderItemsTable,
          with: {
            product: {
              columns: { id: true, title: true },
              with: { images: true },
            },
          },
        },
        user: {
          columns: { id: true, name: true, email: true },
          with: { avatar: true },
        },
        shop: true,
        shippingAddress: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    let coupon = null;

    if (order?.couponCode) {
      coupon = await appDb.query.discountCodesTable.findFirst({
        where: eq(discountCodesTable.discountCode, order.couponCode),
      });
    }

    sendSuccess(res, { order, coupon }, 'Successfully fetched order details');
  } catch (error) {
    console.log('Error in getOrderDetailsController:', error);
    return next(error);
  }
};

// update order status
export const updateOrderStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const orderId = req.params?.orderId;
    if (!orderId) {
      throw new BadRequestError('Order ID is required');
    }

    const { orderStatus } = req.body as TUpdateOrderStatusSchema;
    if (!orderStatus) {
      throw new BadRequestError('Order status is required');
    }

    // Verify ordering shop belongs to the seller
    const sellerShop = await appDb.query.shopsTable.findFirst({
      where: eq(shopsTable.sellerId, authUser.userId),
    });

    if (!sellerShop) {
      throw new NotFoundError('Seller shop not found');
    }

    const order = await appDb.query.ordersTable.findFirst({
      where: eq(ordersTable.id, orderId),
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.shopId !== sellerShop.id) {
      throw new AuthError('Unauthorized to update this order');
    }

    await appDb
      .update(ordersTable)
      .set({ orderStatus })
      .where(eq(ordersTable.id, orderId));

    sendSuccess(res, null, 'Successfully updated order status');
  } catch (error) {
    console.log('Error in updateOrderStatusController:', error);
    return next(error);
  }
};

// verify coupon
export const verifyCouponController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const { couponCode, cart } = req.body as TVerifyCouponSchema;

    if (!cart || cart.length === 0) {
      throw new BadRequestError('Cart cannot be empty');
    }

    // Get unique seller IDs from the cart
    const uniqueShopIds = Array.from(new Set(cart.map((item) => item.shopId)));
    const shops = await appDb.query.shopsTable.findMany({
      where: inArray(shopsTable.id, uniqueShopIds),
      columns: { id: true, sellerId: true },
    });
    const sellerIds = shops.map((shop) => shop.sellerId);

    // Find the discount code that belongs to one of the sellers in the cart
    const discountCode = await appDb.query.discountCodesTable.findFirst({
      where: (table, { and, eq, inArray }) =>
        and(
          eq(table.discountCode, couponCode),
          inArray(table.sellerId, sellerIds),
          eq(table.isActive, true),
        ),
    });

    if (!discountCode) {
      throw new NotFoundError('Invalid coupon code for items in your cart');
    }

    // find matching product that includes this discount code
    const matchingProduct = cart.find((item) =>
      item?.discountCodes?.some((d) => d === discountCode.id),
    );

    if (!matchingProduct) {
      throw new NotFoundError(
        'This coupon code is not applicable to any product in your cart',
      );
    }

    let discountAmount = 0;
    const price =
      Number(matchingProduct.salePrice || 0) *
      Number(matchingProduct.quantity || 1);

    if (discountCode.discountType === 'percentage') {
      discountAmount = price * (Number(discountCode.discountValue) / 100);
    } else {
      discountAmount = Number(discountCode.discountValue);
    }

    // Make sure the discount amount does not exceed the price
    discountAmount = Math.min(discountAmount, price);

    sendSuccess(
      res,
      {
        code: discountCode.discountCode,
        discountValue: Number(discountCode.discountValue),
        discountAmount,
        discountedProductId: matchingProduct.id,
        discountType: discountCode.discountType,
      } satisfies TCreatePaymentSessionSchema['coupon'],
      'Coupon verified successfully',
    );
  } catch (error) {
    console.log('Error in verifyCouponController:', error);
    return next(error);
  }
};

// get user order stats
export const getUserOrderStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const orders = await appDb.query.ordersTable.findMany({
      where: eq(ordersTable.userId, authUser.userId),
      columns: { orderStatus: true },
    });

    const totalOrders = orders.length;
    const processingOrders = orders.filter(
      (order) => order.orderStatus === 'Processing',
    ).length;
    const completedOrders = orders.filter(
      (order) => order.orderStatus === 'Delivered',
    ).length;

    sendSuccess(
      res,
      {
        totalOrders,
        processingOrders,
        completedOrders,
      },
      'Successfully fetched user order stats',
    );
  } catch (error) {
    console.log('Error in getUserOrderStatsController:', error);
    return next(error);
  }
};
