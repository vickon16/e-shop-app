import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopsTable, usersTable } from './index.js';

export const productsTable = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  fileId: text('file_id').notNull(),
  url: text('url').notNull(),

  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  shopId: uuid('shop_id'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productsRelations = relations(productsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [productsTable.userId],
    references: [usersTable.id],
  }),
  shop: one(shopsTable, {
    fields: [productsTable.shopId],
    references: [shopsTable.id],
  }),
}));
