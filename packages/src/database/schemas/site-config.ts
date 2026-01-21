import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const siteConfigTable = pgTable('site_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  categories: text('categories').array().notNull(),
  subCategories: jsonb('sub_categories')
    .$type<{ [key: string]: string[] }>()
    .default({})
    .notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
