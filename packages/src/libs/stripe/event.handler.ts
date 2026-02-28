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
  notificationsTable,
  orderItemsTable,
  ordersTable,
  productAnalyticsTable,
  productsTable,
  sql,
  userAnalyticsActionsTable,
  userAnalyticsTable,
} from '../../database/index.js';
import { sendEmail } from '../../mails/send-mail.js';

export const orderEventHandler = async (res: Response, event: Stripe.Event) => {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const { sessionId, userId } = paymentIntent.metadata;

        if (!sessionId || !userId) {
          throw new BadRequestError('Invalid request');
        }

        console.log(
          'Processing payment_intent.succeeded for sessionId:',
          sessionId,
        );

        const sessionKey = constructPaymentSession(userId, sessionId);
        const sessionData = await redis.get(sessionKey);

        if (!sessionData) {
          console.log(
            'Payment session not found or expired for sessionId:',
            sessionId,
          );
          throw new BadRequestError('Payment session not found or expired');
        }

        const { cart, shippingAddressId, sellersData, coupon } = JSON.parse(
          sessionData,
        ) as TPaymentSession;

        const user = await getUserBy('id', userId);
        if (!user) {
          console.log('User not found for userId:', userId);
          throw new BadRequestError('User not found');
        }

        const now = new Date();

        // Group cart by shop
        const shopGrouped = cart.reduce<Record<string, typeof cart>>(
          (acc, item) => {
            acc[item.shopId] ??= [];
            acc[item.shopId].push(item);
            return acc;
          },
          {},
        );

        let totalOrderAmount = 0;
        let totalItemsCount = 0;
        let orderId: string | null = null;

        for (const [shopId, orderItems] of Object.entries(shopGrouped)) {
          await appDb.transaction(async (tx) => {
            let orderTotal = orderItems.reduce((total, item) => {
              return total + Number(item.salePrice || 0) * (item.quantity || 1);
            }, 0);

            let discount = 0;

            console.log('First order total for shopId', shopId, orderTotal);

            // Apply discount if applicable
            if (coupon && coupon.discountedProductId) {
              const discountedItem = orderItems.find(
                (item) => item.id === coupon?.discountedProductId,
              );

              if (discountedItem) {
                const salePrice = Number(discountedItem?.salePrice || 0);
                const quantity = discountedItem.quantity || 1;
                const discountPercent = coupon.discountPercent;

                discount =
                  coupon.discountPercent > 0
                    ? (salePrice * quantity * discountPercent) / 100
                    : coupon.discountAmount;

                orderTotal -= discount;
                console.log(
                  'Second order total for shopId',
                  shopId,
                  orderTotal,
                  discount,
                );
              }
            }

            totalOrderAmount += orderTotal;
            totalItemsCount += orderItems.reduce(
              (sum, item) => sum + (item.quantity || 0),
              0,
            );

            console.log(
              'second order total for shopId',
              shopId,
              totalOrderAmount,
              orderTotal,
            );

            // Create order
            const [newOrder] = await tx
              .insert(ordersTable)
              .values({
                userId,
                shopId,
                total: orderTotal,
                status: 'paid',
                shippingAddressId: shippingAddressId || null,
                couponCode: coupon?.code || null,
                discountAmount: discount,
              })
              .returning();

            if (!newOrder) throw new Error('Order creation failed');

            orderId = newOrder.id;

            console.log('Order created with ID:', newOrder.id);

            await tx.insert(orderItemsTable).values(
              orderItems.map((item) => ({
                orderId: newOrder.id,
                productId: item.id,
                quantity: item.quantity,
                price: item.salePrice,
                selectedOptions: item.selectedOptions,
              })),
            );

            // Update user analytics
            const [analytics] = await tx
              .insert(userAnalyticsTable)
              .values({
                userId,
                lastVisitedAt: now,
              })
              .onConflictDoUpdate({
                target: userAnalyticsTable.userId,
                set: {
                  lastVisitedAt: now,
                  updatedAt: now,
                },
              })
              .returning();

            console.log('User analytics updated with ID:', analytics?.id);

            // Update product and analytics
            for (const item of orderItems) {
              const quantity = item.quantity || 1;
              // Decrement the product stock

              const results = await tx
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
                )
                .returning();

              if (results.length === 0) {
                throw new Error(
                  `Failed to update stock for product ${item.id}. Not enough stock or product not found.`,
                );
              }

              // update analytics (for simplicity, just incrementing a sales count here)
              await tx
                .insert(productAnalyticsTable)
                .values({
                  productId: item.id,
                  shopId: item.shopId,
                  purchases: quantity,
                  lastVisitedAt: now,
                })
                .onConflictDoUpdate({
                  target: productAnalyticsTable.productId,
                  set: {
                    lastVisitedAt: now,
                    updatedAt: now,
                    purchases: sql`${productAnalyticsTable.purchases} + ${quantity}`,
                  },
                });

              if (analytics) {
                await tx
                  .insert(userAnalyticsActionsTable)
                  .values({
                    analyticsId: analytics.id,
                    action: 'purchase',
                    productId: item.id,
                    shopId: item.shopId,
                    timestamp: now,
                  })
                  .onConflictDoNothing();
              }
            }
          });
        }

        // Send email once per order (not per shop)

        if (!orderId) {
          console.log('Order ID is null after processing all shops');
          throw new Error('Order processing failed');
        }

        console.log('Preparing notifications for user and sellers');

        const sellerNotifications = sellersData.map((seller) => {
          const firstProduct = shopGrouped[seller.shopId]?.[0];

          return {
            title: 'New Order Received',
            message: `You have received a new order for ${firstProduct?.title ?? 'New Item'} and other items. A customer has just purchased items from your shop. Please check your orders to see the details and process the order promptly.`,
            creatorId: userId,
            receiverId: seller.sellerId,
            redirectUrl: `"https://seller.eshop.com/orders/${orderId}"`,
          };
        });

        await Promise.all([
          // User email
          sendEmail({
            to: user.email,
            subject: 'Your Eshop order confirmation',
            templateName: 'order-confirmation',
            data: {
              name: user.name,
              cart,
              totalAmount: totalOrderAmount,
              totalItems: totalItemsCount,
              trackingUrl: `https://eshop.com/orders/${orderId}`,
            },
          }),

          // Seller notifications
          appDb.insert(notificationsTable).values(sellerNotifications),

          // Admin notification
          await appDb.insert(notificationsTable).values({
            title: 'New Order Placed',
            message: `A new order has been placed by ${user.name} for ${totalItemsCount} items. Please check the admin panel to see the details and manage the order.`,
            creatorId: userId,
            receiverId: 'admin', // replace with actual admin ID or logic to fetch admin users
            redirectUrl: `"https://admin.eshop.com/orders/${orderId}"`,
          }),
        ]);

        console.log('Notifications sent successfully');

        // Clear Redis session
        await redis.del(sessionKey);

        break;
      }
    }

    sendSuccess(res, { received: true }, 'Successfully processed order', 200);
  } catch (error) {
    console.log('Error in orderEventHandler:', error);
    throw error;
  }
};
