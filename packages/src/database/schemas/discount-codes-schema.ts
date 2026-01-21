import { pgTable, uuid, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sellersTable } from './index.js';
import { discountTypes } from '../../constants/index.js';

export const discountCodesTable = pgTable('discount_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  publicName: text('public_name').notNull(),
  discountType: text('discount_type')
    .$type<(typeof discountTypes)[number]>()
    .notNull(),
  discountValue: numeric('discount_value', {
    precision: 10,
    scale: 2,
  }).notNull(),
  discountCode: text('discount_code').unique().notNull(),
  sellerId: uuid('seller_id')
    .notNull()
    .references(() => sellersTable.id, {
      onDelete: 'cascade',
    }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const discountCodesRelations = relations(
  discountCodesTable,
  ({ one }) => ({
    seller: one(sellersTable, {
      fields: [discountCodesTable.sellerId],
      references: [sellersTable.id],
    }),
  }),
);
