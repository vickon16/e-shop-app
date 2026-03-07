import {
  TDataTableRowAction,
  TOrderWithRelations,
} from '@e-shop-app/packages/types';

export type TOrdersTableRowAction =
  | (Omit<TDataTableRowAction<TOrderWithRelations>, 'variant'> & {
      variant: 'open-analytics' | 'delete-orders' | 'restore-orders';
    })
  | null;
