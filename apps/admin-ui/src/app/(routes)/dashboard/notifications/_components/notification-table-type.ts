import { TNotification } from '@e-shop-app/packages/types';
import { Row } from '@tanstack/react-table';

export type TNotificationTableRowAction = {
  row: Row<TNotification>;
  variant: 'delete-notification' | 'mark-as-read';
} | null;
