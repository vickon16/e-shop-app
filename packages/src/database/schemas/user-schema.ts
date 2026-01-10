// libs/db/src/schema/users.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { imagesTable, shopsTable } from './index.js';

export const usersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),

  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  emailVerified: text('email_verified'),

  following: text('following').array().notNull().default([]),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(usersTable, ({ one }) => ({
  avatar: one(imagesTable, {
    fields: [usersTable.id],
    references: [imagesTable.userId],
  }),
}));

export const sellersTable = pgTable('sellers', {
  id: uuid('id').defaultRandom().primaryKey(),

  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phoneNumber: text('phone_number').notNull(),
  country: text('country').notNull(),
  password: text('password').notNull(),
  stripeId: text('stripe_id'),
  shopId: uuid('shop_id').references(() => shopsTable.id, {
    onDelete: 'cascade',
  }),
  emailVerified: text('email_verified'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sellersRelations = relations(sellersTable, ({ one }) => ({
  shop: one(shopsTable, {
    fields: [sellersTable.shopId],
    references: [shopsTable.id],
  }),
}));
