import { Routes } from '@/configs/routes';
import { TUserWithRelations } from '@e-shop-app/packages/types';
import type { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import Link from 'next/link';
import { UserTableAction } from './user-table-action';
import { TUserTableRowAction } from './user-table-type';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface GetUserTableColumnProps {
  setRowAction: React.Dispatch<React.SetStateAction<TUserTableRowAction>>;
}

export function getUserTableColumn({
  setRowAction,
}: GetUserTableColumnProps): ColumnDef<TUserWithRelations>[] {
  return [
    // Avatar
    {
      id: 'avatar',
      accessorKey: 'avatar',
      header: 'Avatar',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Avatar className="size-10 rounded-md">
            <AvatarImage
              src={user.avatar?.fileUrl || ''}
              alt={`${user.name}`}
              className="object-cover"
            />
            <AvatarFallback className="rounded-md uppercase">
              {user.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        );
      },
    },

    // Name
    {
      id: 'name',
      accessorKey: 'firstName',
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
      id: 'role',
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        return (
          <Badge variant="secondary" className="capitalize">
            {row.original.role}
          </Badge>
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
        return <UserTableAction row={row} setRowAction={setRowAction} />;
      },
      size: 15,
    },
  ];
}
