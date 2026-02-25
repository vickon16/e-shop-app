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

import { appDb, inArray, shopsTable } from '@e-shop-app/packages/database';
import { env } from '@e-shop-app/packages/env';
import { TPaymentSession } from '@e-shop-app/packages/types';
import {
  TCreatePaymentIntentSchema,
  TCreatePaymentSessionSchema,
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

    const normalizeCart = JSON.stringify(
      cart.sort((a, b) => a.id.localeCompare(b.id)), // Sort by id to ensure consistent order
    );

    // is the cart already available in redis

    const keys = await redis.keys(
      `${PAYMENT_SESSION_PREFIX}:${authUser.userId}:*`,
    );

    for (const key of keys) {
      const sessionData = await redis.get(key);
      if (sessionData) {
        const parsedSession = JSON.parse(sessionData) as TPaymentSession;
        const existingCart = JSON.stringify(
          parsedSession.cart.sort((a: any, b: any) => a.id.localeCompare(b.id)),
        );

        if (existingCart === normalizeCart) {
          // If the cart matches, return the existing session ID
          return sendSuccess(
            res,
            { sessionId: parsedSession.sessionId },
            'Existing payment session found',
          );
        } else {
          await redis.del(key); // Delete the existing session if the cart doesn't match
        }
      }
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
    await redis.setex(
      sessionKey,
      15 * 60, // Session expires in 15 minutes
      JSON.stringify(paymentSessionPayload),
    );

    console.log({ sellersData, sessionId, totalAmount });

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
    console.log({ reqParams: req.params, reqUser: req.user });
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

    console.log('Received Stripe event:', event);

    await orderEventHandler(res, event);
  } catch (error) {
    console.log('Error in createOrderController:', error);
    return next(error);
  }
};
