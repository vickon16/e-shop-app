'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Routes } from '@/configs/routes';
import { TOrderWithRelations } from '@e-shop-app/packages/types';
import { type Row } from '@tanstack/react-table';
import { LuEllipsis } from 'react-icons/lu';
import { TOrdersTableRowAction } from './orders-table-type';
import Link from 'next/link';

type Props = {
  row: Row<TOrderWithRelations>;
  setRowAction: React.Dispatch<React.SetStateAction<TOrdersTableRowAction>>;
};

export const OrdersTableAction = (props: Props) => {
  const { row, setRowAction } = props;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open menu"
          variant="ghost"
          className="flex size-8 p-0 data-[state=open]:bg-muted"
        >
          <LuEllipsis className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="p-0! rounded-xl w-[200px]! sm:w-[220px]! dark"
      >
        <DropdownMenuLabel className="flex gap-3 p-3 bg-primarySemiDark text-primary-foreground truncate text-xs!">
          {/* {userData.firstName} Actions */}
          Order Actions
        </DropdownMenuLabel>
        <div className="px-2 py-4 space-y-2 w-full">
          {/* Edit  */}
          <DropdownMenuItem asChild>
            <Link
              className="w-full"
              href={Routes.dashboard.orders.order(row.original.id)}
            >
              View Order{' '}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <button
              onClick={() => setRowAction({ row, variant: 'open-analytics' })}
              className="w-full"
            >
              View Analytics{' '}
            </button>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* <DropdownMenuItem asChild>
            {row.original.deletedAt ? (
              <button
                onClick={() =>
                  setRowAction({ row, variant: 'restore-product' })
                }
                className="text-primary2 hover:text-primary2 w-full"
              >
                Restore Product{' '}
              </button>
            ) : (
              <button
                onClick={() => setRowAction({ row, variant: 'delete-product' })}
                className="text-destructive hover:text-destructive w-full"
              >
                Delete Product{' '}
              </button>
            )}
          </DropdownMenuItem> */}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
