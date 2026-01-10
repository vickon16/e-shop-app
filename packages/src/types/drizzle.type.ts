import {
  usersTable,
  InferSelectModel,
  sellersTable,
} from '../database/index.js';

export type TUserWithPassword = InferSelectModel<typeof usersTable>;
export type TUser = Omit<TUserWithPassword, 'password'>;

export type TSellerWithPassword = InferSelectModel<typeof sellersTable>;
export type TSeller = Omit<TSellerWithPassword, 'password'>;
