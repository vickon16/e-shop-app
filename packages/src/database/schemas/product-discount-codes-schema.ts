import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { discountCodesTable } from './discount-codes-schema.js';
import { productsTable } from './index.js';

export const productDiscountCodesTable = pgTable(
  'product_discount_codes',
  {
    productId: uuid('product_id')
      .notNull()
      .references(() => productsTable.id, { onDelete: 'cascade' }),

    discountCodeId: uuid('discount_code_id')
      .notNull()
      .references(() => discountCodesTable.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.productId, table.discountCodeId] })],
);

export const productDiscountCodesRelations = relations(
  productDiscountCodesTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productDiscountCodesTable.productId],
      references: [productsTable.id],
    }),

    discountCode: one(discountCodesTable, {
      fields: [productDiscountCodesTable.discountCodeId],
      references: [discountCodesTable.id],
    }),
  }),
);
