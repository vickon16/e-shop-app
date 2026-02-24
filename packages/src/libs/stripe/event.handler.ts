import { Response } from 'express';
import Stripe from 'stripe';
import { sendSuccess } from '../../utils/base.utils.js';
import { constructPaymentSession } from '../redis/construct.helpers.js';
import { BadRequestError } from '../../error-handler/base.js';
import { redis } from '../redis/redis-client.js';
import { TPaymentSession } from '../../types/product.type.js';
import { getUserBy } from '../../utils/auth-utils.js';
import { appDb } from '../../database/client.js';
import {
  and,
  eq,
  gte,
  orderItemsTable,
  ordersTable,
  productAnalyticsTable,
  productsTable,
  sql,
  userAnalyticsActionsTable,
  userAnalyticsTable,
} from '../../database/index.js';

export const orderEventHandler = async (res: Response, event: Stripe.Event) => {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const sessionId = paymentIntent.metadata.sessionId;
        const userId = paymentIntent.metadata.userId;

        if (!sessionId || !userId) {
          throw new BadRequestError('Invalid request');
        }

        const sessionKey = constructPaymentSession(userId, sessionId);
        const sessionData = await redis.get(sessionKey);

        if (!sessionData) {
          console.log(
            'Payment session not found or expired for sessionId:',
            sessionId,
          );
          throw new BadRequestError('Payment session not found or expired');
        }

        const { cart, shippingAddressId, coupon } = JSON.parse(
          sessionData,
        ) as TPaymentSession;

        const user = await getUserBy('id', userId);
        if (!user) {
          console.log('User not found for userId:', userId);
          throw new BadRequestError('User not found');
        }

        // Group the cart items by their shops
        const shopGrouped = cart.reduce(
          (acc, item) => {
            if (!acc[item.shopId]) acc[item.shopId] = [];
            acc[item.shopId].push(item);
            return acc;
          },
          {} as Record<string, typeof cart>,
        );

        for (const shopId in shopGrouped) {
          const orderItems = shopGrouped[shopId];

          let orderTotal = orderItems.reduce((total, item) => {
            return total + Number(item.salePrice || 0) * (item.quantity || 1);
          }, 0);

          console.log('First order total', orderTotal);

          // Apply discount if applicable
          const foundDiscountedItem = orderItems.find(
            (item) => item.id === coupon?.discountedProductId,
          );

          if (coupon && coupon.discountedProductId && foundDiscountedItem) {
            const salePrice = Number(foundDiscountedItem?.salePrice || 0);
            const quantity = foundDiscountedItem.quantity || 1;
            const discountPercent = coupon.discountPercent;

            const discount =
              coupon.discountPercent > 0
                ? (salePrice * quantity * discountPercent) / 100
                : coupon.discountAmount;

            orderTotal -= discount;
            console.log('Second order total', orderTotal, discount);
          }

          // Create order
          await appDb.transaction(async (tx) => {
            const [newOrder] = await tx
              .insert(ordersTable)
              .values({
                userId,
                shopId,
                total: orderTotal,
                status: 'paid',
                shippingAddressId: shippingAddressId || null,
                couponCode: coupon?.code || null,
                discountAmount: coupon?.discountAmount || 0,
              })
              .returning();

            if (newOrder) {
              await tx.insert(orderItemsTable).values(
                orderItems.map((item) => ({
                  orderId: newOrder.id,
                  productId: item.id,
                  quantity: item.quantity,
                  price: item.salePrice,
                  selectedOptions: item.selectedOptions,
                })),
              );
            }

            // Update product and analytics
            for (const item of orderItems) {
              const quantity = item.quantity || 1;
              // Decrement the product stock

              await tx
                .update(productsTable)
                .set({
                  stock: sql`${productsTable.stock} - ${quantity}`,
                  totalSales: sql`${productsTable.totalSales} + ${quantity}`,
                })
                .where(
                  and(
                    eq(productsTable.id, item.id),
                    eq(productsTable.shopId, item.shopId),
                    gte(productsTable.stock, quantity), // ensure enough stock
                  ),
                );

              // update analytics (for simplicity, just incrementing a sales count here)
              await tx
                .insert(productAnalyticsTable)
                .values({
                  productId: item.id,
                  shopId: item.shopId,
                  purchases: quantity,
                  lastVisitedAt: new Date(),
                })
                .onConflictDoUpdate({
                  target: productAnalyticsTable.productId,
                  set: {
                    lastVisitedAt: new Date(),
                    updatedAt: new Date(),
                    purchases: sql`${productAnalyticsTable.purchases} + ${quantity}`,
                  },
                });

              // Update user analytics
              const [analytics] = await tx
                .insert(userAnalyticsTable)
                .values({
                  userId,
                  lastVisitedAt: new Date(),
                })
                .onConflictDoUpdate({
                  target: userAnalyticsTable.userId,
                  set: {
                    lastVisitedAt: new Date(),
                    updatedAt: new Date(),
                  },
                })
                .returning();

              if (analytics) {
                await tx
                  .insert(userAnalyticsActionsTable)
                  .values({
                    analyticsId: analytics.id,
                    action: 'purchase',
                    productId: item.id,
                    shopId: item.shopId,
                    timestamp: new Date(),
                  })
                  .onConflictDoNothing();
              }
            }
          });
        }

        sendSuccess(res, {}, 'Successfully created product', 201);
        break;
      }
    }
  } catch (error) {
    console.log('Error in orderEventHandler:', error);
    throw error;
  }
};
