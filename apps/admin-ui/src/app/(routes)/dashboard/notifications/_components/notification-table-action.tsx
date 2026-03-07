import { TNotificationTableRowAction } from './notification-table-type';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TNotification } from '@e-shop-app/packages/types';
import { Row } from '@tanstack/react-table';
import { MoreHorizontal, Trash } from 'lucide-react';
import { LuCircleCheck } from 'react-icons/lu';

export function NotificationTableAction({
  row,
  setRowAction,
}: {
  row: Row<TNotification>;
  setRowAction: React.Dispatch<
    React.SetStateAction<TNotificationTableRowAction>
  >;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setRowAction({
              row,
              variant: 'mark-as-read',
            });
          }}
          className="cursor-pointer font-medium"
        >
          <LuCircleCheck className="mr-2 h-4 w-4" />
          Mark as Read
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setRowAction({
              row,
              variant: 'delete-notification',
            });
          }}
          className="cursor-pointer text-red-500 font-medium focus:text-red-500"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
