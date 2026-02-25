import argon2 from 'argon2';

export const hashPassword = async (password: string) => {
  try {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3, // iterations
      parallelism: 1,
    });
  } catch {
    throw new Error('Password hashing failed');
  }
};

export const verifyPassword = async (hash: string, password: string) => {
  try {
    return await argon2.verify(hash, password);
  } catch {
    throw new Error('Password verification failed');
  }
};
