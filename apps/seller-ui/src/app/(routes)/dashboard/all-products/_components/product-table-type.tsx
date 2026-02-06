import {
  TDataTableRowAction,
  TProductWithImagesAndShop,
} from '@e-shop-app/packages/types';

export type TProductTableRowAction =
  | (Omit<TDataTableRowAction<TProductWithImagesAndShop>, 'variant'> & {
      variant: 'open-analytics' | 'delete-product' | 'restore-product';
    })
  | null;
