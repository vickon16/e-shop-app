import { relations } from 'drizzle-orm';
import {
  AnyPgColumn,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { TUserRoles } from 'src/constants/other-constants.js';
import { avatarTable } from './avatar-schema.js';

export const usersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),

  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  emailVerified: text('email_verified'),

  avatarId: uuid('avatar_id').references((): AnyPgColumn => avatarTable.id),

  role: text('role').$type<TUserRoles[number]>().notNull().default('user'),

  following: text('following').array().notNull().default([]),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(usersTable, ({ one }) => ({
  avatar: one(avatarTable, {
    fields: [usersTable.avatarId],
    references: [avatarTable.id],
  }),
}));
