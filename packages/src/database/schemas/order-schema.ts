import { relations } from 'drizzle-orm';
import { index, numeric, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { shopsTable } from './shop-schema.js';

export const ordersTable = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    shopId: uuid('shop_id')
      .notNull()
      .references(() => shopsTable.id, { onDelete: 'cascade' }),

    total: numeric('total', {
      precision: 12,
      scale: 2,
      mode: 'number', // 👈 easier aggregation
    })
      .notNull()
      .default(0),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('orders_shop_id_idx').on(table.shopId)],
);

export const ordersRelations = relations(ordersTable, ({ one }) => ({
  shop: one(shopsTable, {
    fields: [ordersTable.shopId],
    references: [shopsTable.id],
  }),
}));
