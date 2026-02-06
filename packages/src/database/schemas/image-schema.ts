import {
  pgTable,
  uuid,
  text,
  timestamp,
  AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productsTable, sellersTable, shopsTable } from './index.js';

export const imagesTable = pgTable('images', {
  id: uuid('id').defaultRandom().primaryKey(),
  fileId: text('file_id').notNull(),
  fileUrl: text('file_url').notNull(),

  productId: uuid('product_id')
    .notNull()
    .references(() => productsTable.id, {
      onDelete: 'cascade',
    }),
  sellerId: uuid('seller_id')
    .notNull()
    .references(() => sellersTable.id, {
      onDelete: 'cascade',
    }),

  shopId: uuid('shop_id').references((): AnyPgColumn => shopsTable.id, {
    onDelete: 'cascade',
  }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const imagesRelations = relations(imagesTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [imagesTable.productId],
    references: [productsTable.id],
    relationName: 'product',
  }),
  seller: one(sellersTable, {
    fields: [imagesTable.sellerId],
    references: [sellersTable.id],
    relationName: 'seller',
  }),
  shop: one(shopsTable, {
    fields: [imagesTable.shopId],
    references: [shopsTable.id],
    relationName: 'shop',
  }),
}));
