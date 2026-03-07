import { TSellerWithRelations } from '@e-shop-app/packages/types';
import type { ColumnDef } from '@tanstack/react-table';
import { SellerTableAction } from './seller-table-action';
import { TSellerTableRowAction } from './seller-table-type';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface GetSellerTableColumnProps {
  setRowAction: React.Dispatch<React.SetStateAction<TSellerTableRowAction>>;
}

export function getSellerTableColumn({
  setRowAction,
}: GetSellerTableColumnProps): ColumnDef<TSellerWithRelations>[] {
  return [
    // Avatar
    {
      id: 'avatar',
      accessorKey: 'avatar',
      header: 'Avatar',
      cell: ({ row }) => {
        const seller = row.original;
        return (
          <Avatar className="size-10 rounded-md">
            <AvatarImage
              src={seller.avatar?.fileUrl || ''}
              alt={`${seller.name}`}
              className="object-cover"
            />
            <AvatarFallback className="rounded-md uppercase">
              {seller.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        );
      },
    },

    // Name
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        return (
          <span
            className="max-w-sm truncate text-primary font-medium"
            title={row.original.name}
          >
            {row.original.name}
          </span>
        );
      },
    },

    {
      id: 'email',
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => {
        return <span>{row.original.email}</span>;
      },
    },

    {
      id: 'phoneNumber',
      accessorKey: 'phoneNumber',
      header: 'Phone Number',
      cell: ({ row }) => {
        return <span>{row.original.phoneNumber}</span>;
      },
    },

    {
      id: 'country',
      accessorKey: 'country',
      header: 'Country',
      cell: ({ row }) => {
        return <span>{row.original.country}</span>;
      },
    },

    {
      id: 'shop',
      accessorKey: 'shop',
      header: 'Shop Name',
      cell: ({ row }) => {
        return (
          <span className="truncate">{row.original.shop?.name || '---'}</span>
        );
      },
    },

    {
      id: 'joinedAt',
      accessorKey: 'createdAt',
      header: 'Joined At',
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        if (!createdAt) return '---';
        return <span>{format(new Date(createdAt), 'dd/MM/yyyy')}</span>;
      },
    },

    // Actions
    {
      id: 'actions',
      header: 'Actions',
      cell: function Cell({ row }) {
        return <SellerTableAction row={row} setRowAction={setRowAction} />;
      },
      size: 15,
    },
  ];
}
