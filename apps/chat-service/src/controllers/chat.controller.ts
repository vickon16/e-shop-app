import { Order } from '@e-shop-app/packages/constants';
import {
  and,
  appDb,
  asc,
  conversationTable,
  count,
  desc,
  eq,
  inArray,
  messageTable,
  participantTable,
  sql,
} from '@e-shop-app/packages/database';
import { AuthError } from '@e-shop-app/packages/error-handler';
import {
  clearUnseenCount,
  constructChatKey,
  constructUnseenCountKey,
  redis,
} from '@e-shop-app/packages/libs/redis';
import {
  getSellersBy,
  getUsersBy,
  paginationDtoWrapper,
  PaginationResultDto,
  sendSuccess,
} from '@e-shop-app/packages/utils';
import { TCreateNewConversationSchema } from '@e-shop-app/packages/zod-schemas';
import { NextFunction, Request, Response } from 'express';

// create new conversation
export const createNewConversationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const { memberId, memberType, name } =
      req.body as TCreateNewConversationSchema;

    const existingConversationIds = await appDb
      .select({
        conversationId: participantTable.conversationId,
      })
      .from(participantTable)
      .where(inArray(participantTable.memberId, [authUser.userId, memberId]))
      .groupBy(participantTable.conversationId)
      .having(sql`count(distinct ${participantTable.memberId}) = 2`); // Only return conversations where both participants exist.

    const conversation = await appDb.query.conversationTable.findFirst({
      where: eq(
        conversationTable.id,
        existingConversationIds[0]?.conversationId,
      ),
    });

    if (conversation) {
      sendSuccess(
        res,
        {
          conversation,
          isNew: false,
        },
        'Conversation retrieved successfully',
      );
      return;
    }

    // create new conversation group
    const newConversation = await appDb.transaction(async (tx) => {
      const [conversation] = await tx
        .insert(conversationTable)
        .values({
          isGroup: false,
          creatorId: authUser.userId,
          name: name ?? null,
        })
        .returning();

      await tx.insert(participantTable).values([
        {
          conversationId: conversation.id,
          memberId: authUser.userId,
          memberType: 'user',
        },
        {
          conversationId: conversation.id,
          memberId,
          memberType,
        },
      ]);

      return conversation;
    });

    sendSuccess(
      res,
      { conversation: newConversation, isNew: true },
      'Conversation created successfully',
    );
  } catch (error) {
    console.log('Error in createNewConversationController:', error);
    return next(error);
  }
};

// get user conversations
export const getConversationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const conversations = await appDb.query.conversationTable.findMany({
      with: {
        participants: true,
        messages: {
          orderBy: (message, { desc }) => [desc(message.createdAt)],
          limit: 1,
        },
      },
      where: (conversation, { exists, eq, and }) =>
        exists(
          appDb
            .select()
            .from(participantTable)
            .where(
              and(
                eq(participantTable.conversationId, conversation.id),
                eq(participantTable.memberId, authUser.userId),
              ),
            ),
        ),
      orderBy: (conversation, { desc }) => [desc(conversation.updatedAt)],
    });

    const userIds = new Set<string>();
    const sellerIds = new Set<string>();
    const onlineKeys: string[] = [];
    const unseenCountKeys: string[] = [];

    for (const conv of conversations) {
      for (const participant of conv.participants) {
        if (
          participant.memberType === 'user' ||
          participant.memberType === 'admin'
        ) {
          userIds.add(participant.memberId);
        } else if (participant.memberType === 'seller') {
          sellerIds.add(participant.memberId);
        }

        onlineKeys.push(
          constructChatKey(participant.memberType, participant.memberId),
        );

        unseenCountKeys.push(
          constructUnseenCountKey(participant.memberType, participant.memberId),
        );
      }
    }

    const [users, sellers, onlineStatus, unseenStatus] = await Promise.all([
      getUsersBy('id', [...userIds]),
      getSellersBy('id', [...sellerIds]),
      redis.mget(onlineKeys),
      redis.mget(unseenCountKeys),
    ]);

    const userMap = new Map(users.map((u) => [u.id, u]));
    const sellerMap = new Map(sellers.map((s) => [s.id, s]));
    const onlineMap = new Map(
      onlineKeys.map((key, i) => [key, !!onlineStatus[i]]),
    );
    const unseenCountMap = new Map(
      unseenCountKeys.map((key, i) => [key, !!unseenStatus[i]]),
    );

    const mappedConversations = conversations.map((conversation) => {
      const participants = conversation.participants.map((participant) => {
        let memberData = null;

        if (
          participant.memberType === 'user' ||
          participant.memberType === 'admin'
        ) {
          memberData = userMap.get(participant.memberId);
        } else if (participant.memberType === 'seller') {
          memberData = sellerMap.get(participant.memberId);
        }

        const onlineKey = constructChatKey(
          participant.memberType,
          participant.conversationId,
        );

        const unseenCountKey = constructUnseenCountKey(
          participant.memberType,
          participant.conversationId,
        );

        return {
          ...participant,
          memberData: memberData || null,
          isOnline: onlineMap.get(onlineKey) ?? false,
          unseenCount: unseenCountMap.get(unseenCountKey) ?? 0,
        };
      });

      return {
        ...conversation,
        participants,
        lastMessage:
          conversation.messages?.[0]?.messageBody ||
          'Say Something to start a conversation',
        lastMessageAt:
          conversation.messages?.[0]?.createdAt || conversation?.updatedAt,
      };
    });

    sendSuccess(res, mappedConversations, 'Conversation gotten successfully');
  } catch (error) {
    console.log('Error in getUserConversationController:', error);
    return next(error);
  }
};

// get messages
export const getMessagesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new AuthError('Unauthorized');
    }

    const conversationId = req.params?.conversationId;

    if (!conversationId) {
      throw new Error('ConversationId not found');
    }

    // Ensure the user belongs to the conversation before returning messages:
    const participant = await appDb.query.participantTable.findFirst({
      where: and(
        eq(participantTable.conversationId, conversationId),
        eq(participantTable.memberId, authUser.userId),
      ),
      with: {
        conversation: {
          with: {
            participants: true,
          },
        },
      },
    });

    if (!participant) {
      throw new AuthError('Not a participant of this conversation');
    }

    const userIds = new Set<string>();
    const sellerIds = new Set<string>();
    const onlineKeys: string[] = [];
    const unseenCountKeys: string[] = [];

    const participants = participant?.conversation?.participants || [];

    for (const participant of participants) {
      if (
        participant.memberType === 'user' ||
        participant.memberType === 'admin'
      ) {
        userIds.add(participant.memberId);
      } else if (participant.memberType === 'seller') {
        sellerIds.add(participant.memberId);
      }

      onlineKeys.push(
        constructChatKey(participant.memberType, participant.memberId),
      );

      unseenCountKeys.push(
        constructUnseenCountKey(participant.memberType, participant.memberId),
      );
    }

    const [users, sellers, onlineStatus, unseenStatus] = await Promise.all([
      getUsersBy('id', [...userIds]),
      getSellersBy('id', [...sellerIds]),
      redis.mget(onlineKeys),
      redis.mget(unseenCountKeys),
    ]);

    const userMap = new Map(users.map((u) => [u.id, u]));
    const sellerMap = new Map(sellers.map((s) => [s.id, s]));
    const onlineMap = new Map(
      onlineKeys.map((key, i) => [key, !!onlineStatus[i]]),
    );
    const unseenCountMap = new Map(
      unseenCountKeys.map((key, i) => [key, !!unseenStatus[i]]),
    );

    const mappedParticipants = participants.map((participant) => {
      let memberData = null;

      if (
        participant.memberType === 'user' ||
        participant.memberType === 'admin'
      ) {
        memberData = userMap.get(participant.memberId);
      } else if (participant.memberType === 'seller') {
        memberData = sellerMap.get(participant.memberId);
      }

      const onlineKey = constructChatKey(
        participant.memberType,
        participant.conversationId,
      );

      const unseenCountKey = constructUnseenCountKey(
        participant.memberType,
        participant.conversationId,
      );

      return {
        ...participant,
        memberData: memberData || null,
        isOnline: onlineMap.get(onlineKey) ?? false,
        unseenCount: unseenCountMap.get(unseenCountKey) ?? 0,
      };
    });

    await paginationDtoWrapper(req, async (paginationDto) => {
      const { page, limit, order } = paginationDto;
      const skip = (page - 1) * limit;

      const orderFunc = order === Order.ASC ? asc : desc;

      const orderBy = orderFunc(messageTable.createdAt);

      const baseWhere = eq(messageTable.conversationId, conversationId);

      const [messages, countResult] = await Promise.all([
        appDb.query.messageTable.findMany({
          where: baseWhere,
          orderBy,
          limit,
          offset: skip,
        }),

        appDb.select({ total: count() }).from(messageTable).where(baseWhere),
      ]);

      const itemCount = countResult?.[0]?.total || 0;

      const paginatedResult = new PaginationResultDto(
        messages,
        itemCount,
        paginationDto,
      );

      // clear unseen messages count
      await clearUnseenCount(
        participant.memberType,
        participant.conversationId,
      );

      sendSuccess(
        res,
        { paginatedResult, participants: mappedParticipants },
        'Messages retrieved successfully',
      );
    });
  } catch (error) {
    console.log('Error in getUserConversationController:', error);
    return next(error);
  }
};
