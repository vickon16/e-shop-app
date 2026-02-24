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
