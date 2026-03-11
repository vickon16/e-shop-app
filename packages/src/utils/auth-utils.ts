import {
  appDb,
  eq,
  inArray,
  sellersTable,
  usersTable,
} from '../database/index.js';
import { TSellerWithPassword, TUserWithPassword } from '../types/index.js';

type queryType = 'email' | 'id';

export const getUserBy = async (
  type: queryType,
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

export const getUsersBy = async (
  type: queryType,
  values: string[],
  withPassword?: boolean,
) => {
  if (values.length === 0) return [];

  const users = await appDb.query.usersTable.findMany({
    where: inArray(type === 'email' ? usersTable.email : usersTable.id, values),
    columns: withPassword
      ? undefined // select ALL columns
      : {
          password: false, // exclude only password
        },
    with: {
      avatar: true,
    },
  });

  return users as TUserWithPassword[];
};

export const getSellerBy = async (
  type: queryType,
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

export const getSellersBy = async (
  type: queryType,
  values: string[],
  withPassword?: boolean,
) => {
  if (values.length === 0) return [];

  const sellers = await appDb.query.sellersTable.findMany({
    where: inArray(
      type === 'email' ? sellersTable.email : sellersTable.id,
      values,
    ),
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

  return sellers as TSellerWithPassword[];
};
