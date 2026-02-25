import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  numeric,
  integer,
  jsonb,
  AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { imagesTable, sellersTable, shopsTable } from './index.js';
import { YesNo, ProductStatus } from '../../constants/index.js';

export const productsTable = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),

  sellerId: uuid('seller_id')
    .notNull()
    .references(() => sellersTable.id, { onDelete: 'cascade' }),

  shopId: uuid('shop_id')
    .notNull()
    .references((): AnyPgColumn => shopsTable.id, {
      onDelete: 'cascade',
    }),

  status: varchar('status', { length: 20 })
    .$type<(typeof ProductStatus)[number]>()
    .notNull()
    .default('active'),

  title: varchar('title', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  description: varchar('description', { length: 150 }).notNull(),
  detailedDescription: varchar('detailed_description', { length: 1000 }),
  category: varchar('category', { length: 50 }).notNull(),
  subCategory: varchar('sub_category', { length: 50 }).notNull(),
  salePrice: numeric('sale_price', { precision: 12, scale: 2 }).notNull(),
  regularPrice: numeric('regular_price', { precision: 12, scale: 2 }).notNull(),
  ratings: numeric('ratings', { precision: 2, scale: 1 })
    .notNull()
    .default('0'),
  stock: integer('stock').notNull(),

  videoUrl: text('video_url'),
  brand: varchar('brand', { length: 100 }),
  colors: text('colors').array().notNull(),
  sizes: text('sizes').array().notNull(),

  warranty: varchar('warranty', { length: 50 }),
  cashOnDelivery: varchar('cash_on_delivery', { length: 50 }).$type<
    (typeof YesNo)[number]
  >(),

  /**
   * ARRAYS
   */
  tags: text('tags').array().notNull(),
  discountCodes: text('discount_codes').array().notNull(),

  customSpecifications: jsonb('custom_specifications')
    .$type<
      {
        name: string;
        value: string;
      }[]
    >()
    .default([]),

  customProperties: jsonb('custom_properties')
    .$type<
      {
        label: string;
        values: string[];
      }[]
    >()
    .default([]),

  totalSales: integer('total_sales').notNull().default(0),

  startingDate: timestamp('starting_date'),
  endingDate: timestamp('ending_date'),
  deletedAt: timestamp('deleted_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productsRelations = relations(productsTable, ({ one, many }) => ({
  seller: one(sellersTable, {
    fields: [productsTable.sellerId],
    references: [sellersTable.id],
    relationName: 'seller',
  }),
  shop: one(shopsTable, {
    fields: [productsTable.shopId],
    references: [shopsTable.id],
    relationName: 'shop',
  }),
  images: many(imagesTable),
}));
