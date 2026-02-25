import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { TUserAccountType } from 'src/types/base.type.js';

export const avatarTable = pgTable('avatars', {
  id: uuid('id').defaultRandom().primaryKey(),
  fileId: text('file_id').notNull(),
  fileUrl: text('file_url').notNull(),

  userId: uuid('user_id').notNull().unique(),

  userType: text('user_type')
    .notNull()
    .$type<TUserAccountType>()
    .default('user'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
