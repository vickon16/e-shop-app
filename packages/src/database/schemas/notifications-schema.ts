import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const notificationsTable = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),

  creatorId: uuid('creator_id').notNull(),
  receiverId: uuid('receiver_id').notNull(),

  redirectUrl: text('redirect_url'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
