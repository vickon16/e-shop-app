import { userAccountTypes } from '../constants/other-constants.js';
import { z } from './base-zod.js';

export const createNewConversationSchema = z.object({
  memberId: z.uuid().openapi({
    description: 'The memberId',
    example: 'A uuid string',
  }),
  memberType: z.enum(userAccountTypes).openapi({
    description: 'The memberType',
    example: 'user',
  }),
  name: z.string().optional().openapi({
    description: 'Name of the conversation',
    example: 'New Conversation',
  }),
});

export type TCreateNewConversationSchema = z.infer<
  typeof createNewConversationSchema
>;
