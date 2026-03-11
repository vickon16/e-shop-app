import { TWebSocketNewMessageType } from 'src/types/base.type.js';
import { redis } from './redis-client.js';

export const constructOtpWithEmail = (
  type:
    | 'default'
    | 'cool'
    | 'lock'
    | 'spam-lock'
    | 'request-count'
    | 'attempts',
  email: string,
): string => {
  if (type === 'default') {
    return `otp:${email}`;
  }

  return `otp-${type}:${email}`;
};

export const PAYMENT_SESSION_PREFIX = 'payment-session';

export const constructPaymentSession = (
  userId: string,
  sessionId: string,
): string => {
  return `${PAYMENT_SESSION_PREFIX}:${userId}:${sessionId}`;
};

export const constructChatKey = (
  type: TWebSocketNewMessageType['payload']['senderType'],
  conversationId: string,
) => {
  return `online:${type}:${conversationId}`;
};

export const constructUnseenCountKey = (
  type: TWebSocketNewMessageType['payload']['senderType'],
  conversationId: string,
) => {
  return `unseen:${type}:${conversationId}`;
};

export const incrementUnseenCount = async (
  receiverType: TWebSocketNewMessageType['payload']['senderType'],
  conversationId: string,
) => {
  const key = constructUnseenCountKey(receiverType, conversationId);
  await redis.incr(key);
};

export const getUnseenCount = async (
  receiverType: TWebSocketNewMessageType['payload']['senderType'],
  conversationId: string,
) => {
  const key = constructUnseenCountKey(receiverType, conversationId);
  const count = await redis.get(key);
  return count ? parseInt(count) : 0;
};

export const clearUnseenCount = async (
  receiverType: TWebSocketNewMessageType['payload']['senderType'],
  conversationId: string,
) => {
  const key = constructUnseenCountKey(receiverType, conversationId);
  await redis.del(key);
};
