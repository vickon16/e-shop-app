import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { TUserAccountType } from 'src/types/base.type.js';

export const addressTable = pgTable('addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  label: text('label').notNull(),
  name: text('name').notNull(),
  street: text('street').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  country: text('country').notNull(),
  isDefault: boolean('is_default').notNull().default(false),

  userId: uuid('user_id').notNull(),

  userType: text('user_type')
    .notNull()
    .$type<TUserAccountType>()
    .default('user'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
