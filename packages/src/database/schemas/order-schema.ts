import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { shopsTable } from './shop-schema.js';
import { usersTable } from './user-schema.js';
import { orderStatus } from '../../constants/other-constants.js';
import { addressTable } from './address-schema.js';
import { productsTable } from './product-schema.js';
import { TCart } from '../../types/product.type.js';

export const ordersTable = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),

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

    status: text('status').$type<(typeof orderStatus)[number]>().notNull(),
    shippingAddressId: uuid('shipping_address_id').references(
      () => addressTable.id,
      { onDelete: 'cascade' },
    ),

    couponCode: text('coupon_code'),
    discountAmount: numeric('discount_amount', {
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
  user: one(usersTable, {
    fields: [ordersTable.userId],
    references: [usersTable.id],
  }),
  shippingAddress: one(addressTable, {
    fields: [ordersTable.shippingAddressId],
    references: [addressTable.id],
  }),
}));

export const orderItemsTable = pgTable('order-items', {
  id: uuid('id').defaultRandom().primaryKey(),

  orderId: uuid('order_id')
    .notNull()
    .references(() => ordersTable.id, { onDelete: 'cascade' }),

  productId: uuid('product_id')
    .notNull()
    .references(() => productsTable.id, { onDelete: 'cascade' }),

  quantity: numeric('quantity', {
    precision: 12,
    scale: 2,
    mode: 'number', // 👈 easier aggregation
  })
    .notNull()
    .default(0),

  price: numeric('price', { precision: 12, scale: 2 }).notNull(),

  selectedOptions: jsonb('selected-options')
    .$type<TCart['selectedOptions']>()
    .default({}),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [orderItemsTable.orderId],
    references: [ordersTable.id],
  }),
  product: one(productsTable, {
    fields: [orderItemsTable.productId],
    references: [productsTable.id],
  }),
}));
