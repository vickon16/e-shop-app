import {
  TDataTableRowAction,
  TSellerWithRelations,
} from '@e-shop-app/packages/types';

export type TSellerTableRowAction =
  | (Omit<TDataTableRowAction<TSellerWithRelations>, 'variant'> & {
      variant: 'delete-seller' | 'restore-seller';
    })
  | null;
