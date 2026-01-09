import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopsTable, usersTable } from './index.js';

export const imagesTable = pgTable('images', {
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

export const imagesRelations = relations(imagesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [imagesTable.userId],
    references: [usersTable.id],
  }),
  shop: one(shopsTable, {
    fields: [imagesTable.shopId],
    references: [shopsTable.id],
  }),
}));
