import {
  pgTable,
  uuid,
  text,
  timestamp,
  AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopsTable } from './index.js';
import { avatarTable } from './avatar-schema.js';

export const sellersTable = pgTable('sellers', {
  id: uuid('id').defaultRandom().primaryKey(),

  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phoneNumber: text('phone_number').notNull(),
  country: text('country').notNull(),
  password: text('password').notNull(),
  stripeId: text('stripe_id'),
  shopId: uuid('shop_id')
    .notNull()
    .references((): AnyPgColumn => shopsTable.id, {
      onDelete: 'cascade',
    }),
  emailVerified: text('email_verified'),
  avatarId: uuid('avatar_id').references((): AnyPgColumn => avatarTable.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sellersRelations = relations(sellersTable, ({ one }) => ({
  shop: one(shopsTable, {
    fields: [sellersTable.shopId],
    references: [shopsTable.id],
  }),
  avatar: one(avatarTable, {
    fields: [sellersTable.avatarId],
    references: [avatarTable.id],
  }),
}));
