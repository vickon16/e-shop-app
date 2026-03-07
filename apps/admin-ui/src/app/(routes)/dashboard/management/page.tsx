'use client';

import { getAdminUsers } from '@/actions/queries/user-queries';
import DataTable from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from 'sonner';
import { AddAdminForm } from './_components/add-admin-form';
import ConfirmActionModal from '@/components/common/ConfirmActionModal';
import { getUserTableColumn } from '../users/_components/user-table-column';
import { TUserTableRowAction } from '../users/_components/user-table-type';

const ManagementPage = () => {
  const tableKey = useId();
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [rowAction, setRowAction] = useState<TUserTableRowAction>(null);

  const columns = useMemo(
    () => getUserTableColumn({ setRowAction }),
    [setRowAction],
  );

  const adminUsersQuery = useQuery(getAdminUsers('admin'));
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
    toast.info(
      `Mock: ${payload.type} admin function triggered for ${payload.userId}`,
    );
    setRowAction(null);
  };

  return (
    <>
      <div className="w-full min-h-screen dark p-8">
        <div className="flex justify-between w-full items-center mb-1 gap-3">
          <h2 className="text-2xl font-semibold">Management</h2>
        </div>

        <div className="flex items-center mb-6">
          <Link
            href={Routes.dashboard.base}
            className="text-[#80Deea] cursor-pointer"
          >
            Dashboard
          </Link>
          <LuChevronRight size={20} className="opacity-[.8]" />
          <span>Management</span>
        </div>

        <AddAdminForm />

        <div className="my-4 flex items-center gap-4">
          <div className="flex items-center bg-gray-900 p-2 px-4 rounded-md flex-1">
            <Search size={18} className="text-gray-400 mr-1" />
            <Input
              placeholder="Search Admins..."
              className="w-full h-10 bg-transparent border-none focus-visible:ring-transparent focus-visible:ring-offset-0 outline-none border-transparent"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
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

      {!!rowAction?.row && rowAction?.variant === 'delete-user' && (
        <ConfirmActionModal
          heading={`Are you absolutely sure you want to remove admin access for '${rowAction.row.original.name}'?`}
          description="This action cannot be undone."
          open={rowAction.variant === 'delete-user'}
          confirmActionLabel={'Remove Admin'}
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
          heading={`Are you absolutely sure you want to restore admin access for '${rowAction.row.original.name}'?`}
          description="This admin will be restored."
          open={rowAction.variant === 'restore-user'}
          confirmActionLabel={'Restore Admin'}
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

export default ManagementPage;
