import { appDb, eq, sellersTable, usersTable } from '../database/index.js';
import { TSellerWithPassword, TUserWithPassword } from '../types/index.js';

export const getUserBy = async (
  type: 'email' | 'id',
  value: string,
  withPassword?: boolean,
) => {
  const currentUser = await appDb.query.usersTable.findFirst({
    where: eq(type === 'email' ? usersTable.email : usersTable.id, value),
    columns: withPassword
      ? undefined // select ALL columns
      : {
          password: false, // exclude only password
        },
    with: {
      avatar: true,
    },
  });

  return currentUser as TUserWithPassword | undefined;
};

export const getSellerBy = async (
  type: 'email' | 'id',
  value: string,
  withPassword?: boolean,
) => {
  const currentUser = await appDb.query.sellersTable.findFirst({
    where: eq(type === 'email' ? sellersTable.email : sellersTable.id, value),
    columns: withPassword
      ? undefined // select ALL columns
      : {
          password: false, // exclude only password
        },
    with: {
      avatar: true,
      shop: true,
    },
  });

  return currentUser as TSellerWithPassword | undefined;
};
