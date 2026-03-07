'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TSellerWithRelations } from '@e-shop-app/packages/types';
import { type Row } from '@tanstack/react-table';
import { LuEllipsis } from 'react-icons/lu';
import { TSellerTableRowAction } from './seller-table-type';

type Props = {
  row: Row<TSellerWithRelations>;
  setRowAction: React.Dispatch<React.SetStateAction<TSellerTableRowAction>>;
};

export const SellerTableAction = (props: Props) => {
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
          Seller Actions
        </DropdownMenuLabel>
        <div className="px-2 py-4 space-y-2 w-full">
          {/* Action options */}
          <DropdownMenuItem asChild>
            {'deletedAt' in row.original ? (
              <button
                onClick={() => setRowAction({ row, variant: 'restore-seller' })}
                className="text-primary2 hover:text-primary2 w-full"
              >
                Restore Seller{' '}
              </button>
            ) : (
              <button
                onClick={() => setRowAction({ row, variant: 'delete-seller' })}
                className="text-destructive hover:text-destructive w-full"
              >
                Delete Seller{' '}
              </button>
            )}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
