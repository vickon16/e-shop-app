import { TNotification } from '@e-shop-app/packages/types';
import type { ColumnDef } from '@tanstack/react-table';
import { NotificationTableAction } from './notification-table-action';
import { TNotificationTableRowAction } from './notification-table-type';
import { format } from 'date-fns';

interface GetNotificationTableColumnProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<TNotificationTableRowAction>
  >;
}

export function getNotificationTableColumn({
  setRowAction,
}: GetNotificationTableColumnProps): ColumnDef<TNotification>[] {
  return [
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        return (
          <span className="font-semibold text-primary/80">
            {row.original.title}
          </span>
        );
      },
    },

    {
      id: 'message',
      accessorKey: 'message',
      header: 'Message',
      cell: ({ row }) => {
        return (
          <span
            className="text-muted-foreground line-clamp-2"
            title={row.original.message}
          >
            {row.original.message}
          </span>
        );
      },
    },

    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        if (!createdAt) return '---';
        return (
          <span>{format(new Date(createdAt), 'dd MMMM yyyy - hh:mm a')}</span>
        );
      },
      size: 100,
    },

    {
      id: 'actions',
      header: 'Actions',
      cell: function Cell({ row }) {
        return (
          <NotificationTableAction row={row} setRowAction={setRowAction} />
        );
      },
      size: 15,
    },
  ];
}
