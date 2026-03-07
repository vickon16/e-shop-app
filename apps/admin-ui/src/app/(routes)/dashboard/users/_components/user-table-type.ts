import {
  TDataTableRowAction,
  TUserWithRelations,
} from '@e-shop-app/packages/types';

export type TUserTableRowAction =
  | (Omit<TDataTableRowAction<TUserWithRelations>, 'variant'> & {
      variant: 'delete-user' | 'restore-user';
    })
  | null;
