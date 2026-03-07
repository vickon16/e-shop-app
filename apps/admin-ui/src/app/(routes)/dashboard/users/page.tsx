'use client';

import { getAdminUsers } from '@/actions/queries/user-queries';
import DataTable from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Routes } from '@/configs/routes';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useId, useMemo, useState } from 'react';
import { LuChevronRight, LuRefreshCw } from 'react-icons/lu';
import { getUserTableColumn } from './_components/user-table-column';
import { TUserTableRowAction } from './_components/user-table-type';
import ConfirmActionModal from '@/components/common/ConfirmActionModal';
import { toast } from 'sonner';
import { TUserRoles } from '@e-shop-app/packages/constants';

const AllUsersPage = () => {
  const tableKey = useId();
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<TUserRoles>('user');

  const [rowAction, setRowAction] = useState<TUserTableRowAction>(null);

  const columns = useMemo(
    () => getUserTableColumn({ setRowAction }),
    [setRowAction],
  );

  const adminUsersQuery = useQuery(getAdminUsers(roleFilter));
  const adminUsers = adminUsersQuery.data;

  const table = useReactTable({
    data: adminUsers || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleDeleteRestoreUser = async (payload: {
    userId: string;
    type: 'delete' | 'restore';
  }) => {
    // Mock functionality as there is no specific delete/restore user mutation requested yet
    toast.info(
      `Mock: ${payload.type} user function triggered for ${payload.userId}`,
    );
    setRowAction(null);
  };

  return (
    <>
      <div className="w-full min-h-screen dark p-8">
        {/* BreadCrumbs */}
        <div className="flex justify-between w-full items-center mb-1 gap-3">
          <h2 className="text-2xl font-semibold">All Users</h2>
        </div>

        <div className="flex items-center">
          <Link
            href={Routes.dashboard.base}
            className="text-[#80Deea] cursor-pointer"
          >
            Dashboard
          </Link>
          <LuChevronRight size={20} className="opacity-[.8]" />
          <span>All Users</span>
        </div>

        <div className="my-4 flex items-center gap-4">
          <div className="flex items-center bg-gray-900 p-2 px-4 rounded-md flex-1">
            <Search size={18} className="text-gray-400 mr-1" />
            <Input
              placeholder="Search Users..."
              className="w-full h-10 bg-transparent border-none focus-visible:ring-transparent focus-visible:ring-offset-0 outline-none border-transparent"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>

          <div className="w-45">
            <Select
              value={roleFilter}
              onValueChange={(val) => setRoleFilter(val as TUserRoles)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super-admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          key={tableKey}
          table={table}
          isLoadingTable={adminUsersQuery.isLoading}
        >
          <div className="flex items-center justify-end">
            <Button
              size="smallIcon"
              variant="secondary"
              title="refresh table"
              onClick={() => adminUsersQuery.refetch()}
            >
              <LuRefreshCw
                className={cn(adminUsersQuery.isRefetching && 'animate-spin')}
              />
            </Button>
          </div>
        </DataTable>
      </div>

      {/*  */}
      {!!rowAction?.row && rowAction?.variant === 'delete-user' && (
        <ConfirmActionModal
          heading={`Are you absolutely sure you want to delete this user '${rowAction.row.original.name}'?`}
          description="This action cannot be undone."
          open={rowAction.variant === 'delete-user'}
          confirmActionLabel={'Delete User'}
          onOpenChange={() => {
            setRowAction(null);
          }}
          confirmAction={() =>
            handleDeleteRestoreUser({
              userId: rowAction.row.original.id,
              type: 'delete',
            })
          }
          confirmActionVariant="destructive"
          isLoadingConfirmAction={false}
          className="dark"
        />
      )}

      {!!rowAction?.row && rowAction?.variant === 'restore-user' && (
        <ConfirmActionModal
          heading={`Are you absolutely sure you want to restore this user '${rowAction.row.original.name}'?`}
          description="This user will be restored."
          open={rowAction.variant === 'restore-user'}
          confirmActionLabel={'Restore User'}
          onOpenChange={() => {
            setRowAction(null);
          }}
          confirmAction={() =>
            handleDeleteRestoreUser({
              userId: rowAction.row.original.id,
              type: 'restore',
            })
          }
          confirmActionVariant="destructive"
          isLoadingConfirmAction={false}
          className="dark"
        />
      )}
    </>
  );
};

export default AllUsersPage;
