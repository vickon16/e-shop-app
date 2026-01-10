import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  real,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { imagesTable, sellersTable, usersTable } from './index.js';

export const shopsTable = pgTable('shops', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  bio: text('bio'),

  avatarId: uuid('avatar_id').references(() => imagesTable.id, {
    onDelete: 'set null',
  }),
  address: text('address').notNull(),
  coverBanner: text('cover_banner'),
  openingHours: text('opening_hours'),
  website: text('website'),
  socialLinks: jsonb('social_links')
    .$type<{ [key: string]: string }>()
    .default({}),
  ratings: real('ratings').notNull().default(0),
  sellerId: uuid('seller_id').unique().notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const shopsRelations = relations(shopsTable, ({ one, many }) => ({
  avatar: one(imagesTable, {
    relationName: 'shopAvatar',
    fields: [shopsTable.avatarId],
    references: [imagesTable.id],
  }),

  sellers: one(sellersTable, {
    fields: [shopsTable.sellerId],
    references: [sellersTable.id],
  }),
  reviews: many(shopReviewsTable),
}));

export const shopReviewsTable = pgTable('shop_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),

  shopId: uuid('shop_id')
    .notNull()
    .references(() => shopsTable.id, { onDelete: 'cascade' }),

  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, {
      onDelete: 'cascade',
    }),

  rating: real('rating').notNull(),
  reviews: text('reviews'),
  comment: text('comment'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const shopReviewsRelations = relations(shopReviewsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [shopReviewsTable.userId],
    references: [usersTable.id],
  }),
  shop: one(shopsTable, {
    fields: [shopReviewsTable.shopId],
    references: [shopsTable.id],
  }),
}));
