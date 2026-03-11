import {
  TConversation,
  TParticipant,
  TUserWithRelations,
} from './drizzle.type.js';

export type TConversationResponse = TConversation & {
  lastMessage: string;
  lastMessageAt: string;
  participants: Array<
    TParticipant & {
      memberData: TUserWithRelations | TUserWithRelations;
      isOnline: boolean;
      unseenCount: number;
    }
  >;
};
