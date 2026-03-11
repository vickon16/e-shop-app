import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { userAccountTypes } from 'src/constants/other-constants.js';
import { TMessageStatus } from 'src/types/base.type.js';

type TSenderType = (typeof userAccountTypes)[number];

export const conversationTable = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),

  isGroup: boolean('is_group').default(false).notNull(),
  name: text('name'),
  creatorId: uuid('creator_id').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const conversationRelations = relations(
  conversationTable,
  ({ many }) => ({
    participants: many(participantTable),
    messages: many(messageTable),
  }),
);

export const messageTable = pgTable(
  'messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversationTable.id, { onDelete: 'cascade' }),

    senderId: uuid('sender_id').notNull(),
    senderType: varchar('sender_type', { length: 20 })
      .$type<TSenderType>()
      .notNull(),

    messageBody: text('message_body').notNull(),
    attachments: text('attachments').array().default([]).notNull(),
    status: varchar('status', { length: 20 })
      .$type<TMessageStatus>()
      .default('sent')
      .notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('messages_conversation_id_sender_id_created_at_idx').on(
      table.conversationId,
      table.senderId,
      table.createdAt,
    ),
  ],
);

export const messageRelations = relations(messageTable, ({ one }) => ({
  conversation: one(conversationTable, {
    fields: [messageTable.conversationId],
    references: [conversationTable.id],
  }),
}));

export const participantTable = pgTable(
  'participants',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversationTable.id, { onDelete: 'cascade' }),

    memberId: uuid('participant_id').notNull(),
    memberType: varchar('participant_type', { length: 20 })
      .$type<TSenderType>()
      .notNull(),

    lastSeenAt: timestamp('last_seen_at'),
    isOnline: boolean('is_online').default(false).notNull(),
    unseenCount: integer('unseen_count').default(0).notNull(),
    muted: boolean('muted').default(false).notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    leftAt: timestamp('left_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('participants_conversation_idx').on(table.conversationId),
    index('participants_participant_idx').on(table.memberId, table.memberType),
    uniqueIndex('participants_unique_member').on(
      table.conversationId,
      table.memberId,
      table.memberType,
    ),
  ],
);

export const participantRelations = relations(participantTable, ({ one }) => ({
  conversation: one(conversationTable, {
    fields: [participantTable.conversationId],
    references: [conversationTable.id],
  }),
}));
