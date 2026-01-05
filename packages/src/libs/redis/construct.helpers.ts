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
