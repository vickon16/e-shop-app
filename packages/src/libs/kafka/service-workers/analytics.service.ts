import { TKafkaProductEventSchemaType } from 'src/libs/kafka/constants.js';
import {
  and,
  appDb,
  eq,
  productAnalyticsTable,
  sql,
  userAnalyticsActionsTable,
  userAnalyticsTable,
} from '../../../database/index.js';
import {
  TProductAnalytics,
  TUserAnalyticsAction,
} from 'src/types/drizzle.type.js';

export async function updateUserAnalytics(event: TKafkaProductEventSchemaType) {
  try {
    console.log('Updating analytics:', event.action);

    const { country, city, device, userId } = event;

    if (!userId) return;

    const now = new Date();

    type TNewEvent = Omit<
      TUserAnalyticsAction,
      'id' | 'createdAt' | 'updatedAt' | 'analyticsId'
    >;

    const newEvent: TNewEvent = {
      action: event.action,
      productId: event.productId ?? null,
      shopId: event.shopId ?? null,
      timestamp: now,
    };

    const oneTimeActions: TKafkaProductEventSchemaType['action'][] = [
      'add-to-cart',
      'add-to-wishlist',
    ];

    await appDb.transaction(async (tx) => {
      // Ensure analytics row exists (idempotent)

      const data = await tx
        .insert(userAnalyticsTable)
        .values({
          userId,
          country: country ?? null,
          city: city ?? null,
          device: device ?? null,
          lastVisitedAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: userAnalyticsTable.userId,
          set: {
            lastVisitedAt: now,
            updatedAt: now,
            country: country ?? undefined,
            city: city ?? undefined,
            device: device ?? undefined,
          },
        })
        .returning();

      const userAnalyticsData = data[0];

      if (!userAnalyticsData) return;

      // Handle removal actions

      if (
        event.action === 'remove-from-cart' ||
        event.action === 'remove-from-wishlist'
      ) {
        if (!event.productId) return;

        await tx
          .delete(userAnalyticsActionsTable)
          .where(
            and(
              eq(userAnalyticsActionsTable.analyticsId, userAnalyticsData.id),
              eq(userAnalyticsActionsTable.productId, event.productId),
              eq(
                userAnalyticsActionsTable.action,
                event.action === 'remove-from-cart'
                  ? 'add-to-cart'
                  : 'add-to-wishlist',
              ),
            ),
          );

        return;
      }

      // Product views → always insert
      if (event.action === 'product-view') {
        await tx.insert(userAnalyticsActionsTable).values({
          ...newEvent,
          analyticsId: userAnalyticsData.id,
        });

        return;
      }

      // One-time actions → insert idempotently
      if (oneTimeActions.includes(event.action)) {
        await tx
          .insert(userAnalyticsActionsTable)
          .values({
            ...newEvent,
            analyticsId: userAnalyticsData.id,
          })
          .onConflictDoNothing();

        return;
      }
    });

    await updateProductAnalytics(event);
  } catch (error) {
    console.log('Error updating analytics:', error);
  }
}

type TProductAnalyticsUpdate = Pick<
  TProductAnalytics,
  | 'views'
  | 'cartAdds'
  | 'wishlistAdds'
  | 'purchases'
  | 'productId'
  | 'shopId'
  | 'lastVisitedAt'
>;

export const updateProductAnalytics = async (
  event: TKafkaProductEventSchemaType,
) => {
  try {
    console.log('Updating product analytics:', event.action);

    if (!event.productId || !event.shopId) return;

    const now = new Date();

    const supportedActions: TKafkaProductEventSchemaType['action'][] = [
      'product-view',
      'add-to-cart',
      'remove-from-cart',
      'add-to-wishlist',
      'remove-from-wishlist',
      'purchase',
    ] as const;

    if (!supportedActions.includes(event.action)) return;

    // Initial insert values
    const insertValues: Record<keyof TProductAnalyticsUpdate, any> = {
      productId: event.productId,
      shopId: event.shopId,
      views: event.action === 'product-view' ? 1 : 0,
      cartAdds: event.action === 'add-to-cart' ? 1 : 0,
      wishlistAdds: event.action === 'add-to-wishlist' ? 1 : 0,
      purchases: event.action === 'purchase' ? 1 : 0,
      lastVisitedAt: now,
    };

    const updateSet: Record<string, any> = {
      lastVisitedAt: now,
      updatedAt: now,
    };

    switch (event.action) {
      case 'product-view':
        updateSet.views = sql`${productAnalyticsTable.views} + 1`;
        break;

      case 'add-to-cart':
        updateSet.cartAdds = sql`${productAnalyticsTable.cartAdds} + 1`;
        break;

      case 'remove-from-cart':
        updateSet.cartAdds = sql`GREATEST(${productAnalyticsTable.cartAdds} - 1, 0)`;
        break;

      case 'add-to-wishlist':
        updateSet.wishlistAdds = sql`${productAnalyticsTable.wishlistAdds} + 1`;
        break;

      case 'remove-from-wishlist':
        updateSet.wishlistAdds = sql`GREATEST(${productAnalyticsTable.wishlistAdds} - 1, 0)`;
        break;

      case 'purchase':
        updateSet.purchases = sql`${productAnalyticsTable.purchases} + 1`;
        break;
    }

    // Use upsert to insert or update the product analytics record
    await appDb
      .insert(productAnalyticsTable)
      .values(insertValues)
      .onConflictDoUpdate({
        target: productAnalyticsTable.productId,
        set: updateSet,
      });
  } catch (error) {
    console.log('Error updating product analytics:', error);
  }
};
