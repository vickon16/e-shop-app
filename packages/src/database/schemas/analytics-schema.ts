import {
  AnyPgColumn,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { TKafkaProductEventSchemaType } from 'src/libs/kafka/constants.js';
import { shopsTable } from './shop-schema.js';
import { productsTable } from './product-schema.js';
import { relations, sql } from 'drizzle-orm';

export const userAnalyticsTable = pgTable('user_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id').notNull().unique(),

  country: text('country'),
  city: text('city'),
  device: text('device'),

  lastVisitedAt: timestamp('last_visited_at').defaultNow().notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userAnalyticsRelations = relations(
  userAnalyticsTable,
  ({ many }) => ({
    actions: many(userAnalyticsActionsTable),
  }),
);

export const userAnalyticsActionsTable = pgTable(
  'user_analytics_actions',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    analyticsId: uuid('analytics_id')
      .notNull()
      .references(() => userAnalyticsTable.id),

    action: text('action')
      .notNull()
      .$type<TKafkaProductEventSchemaType['action']>(),

    productId: uuid('product_id').references(
      (): AnyPgColumn => productsTable.id,
    ),
    shopId: uuid('shop_id').references((): AnyPgColumn => shopsTable.id),
    timestamp: timestamp('timestamp').defaultNow().notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('user_product_action_unique')
      .on(table.analyticsId, table.productId, table.action)
      // partial index to allow multiple entries for 'product-view' but only one for other actions
      .where(sql`action IN ('add-to-cart', 'add-to-wishlist')`),
  ],
);

export const userAnalyticsActionsRelations = relations(
  userAnalyticsActionsTable,
  ({ one }) => ({
    analytics: one(userAnalyticsTable, {
      fields: [userAnalyticsActionsTable.analyticsId],
      references: [userAnalyticsTable.id],
    }),
    product: one(productsTable, {
      fields: [userAnalyticsActionsTable.productId],
      references: [productsTable.id],
    }),
    shop: one(shopsTable, {
      fields: [userAnalyticsActionsTable.shopId],
      references: [shopsTable.id],
    }),
  }),
);

// Product analytics table to track overall product performance for recommendations

export const productAnalyticsTable = pgTable('product_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),

  productId: uuid('product_id')
    .notNull()
    .unique()
    .references((): AnyPgColumn => productsTable.id),

  shopId: uuid('shop_id')
    .notNull()
    .references((): AnyPgColumn => shopsTable.id),

  views: integer('views').default(0).notNull(),
  cartAdds: integer('cart_adds').default(0).notNull(),
  wishlistAdds: integer('wishlist_adds').default(0).notNull(),
  purchases: integer('purchases').default(0).notNull(),

  lastVisitedAt: timestamp('last_visited_at').defaultNow().notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productAnalyticsRelations = relations(
  productAnalyticsTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productAnalyticsTable.productId],
      references: [productsTable.id],
    }),
    shop: one(shopsTable, {
      fields: [productAnalyticsTable.shopId],
      references: [shopsTable.id],
    }),
  }),
);
