'use client';

import { getAllNotifications } from '@/actions/queries/notification-queries';
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
import ConfirmActionModal from '@/components/common/ConfirmActionModal';
import { getNotificationTableColumn } from './_components/notification-table-column';
import { TNotificationTableRowAction } from './_components/notification-table-type';

const NotificationsPage = () => {
  const tableKey = useId();
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [rowAction, setRowAction] = useState<TNotificationTableRowAction>(null);

  const columns = useMemo(
    () => getNotificationTableColumn({ setRowAction }),
    [setRowAction],
  );

  const notificationsQuery = useQuery(getAllNotifications());
  const notifications = notificationsQuery.data || [];

  const table = useReactTable({
    data: notifications,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleAction = async (payload: {
    notificationId: string;
    type: 'delete-notification' | 'mark-as-read';
  }) => {
    toast.info(
      `Mock: ${payload.type} function triggered for ${payload.notificationId}`,
    );
    setRowAction(null);
  };

  return (
    <>
      <div className="w-full min-h-screen dark p-8">
        <div className="flex justify-between w-full items-center mb-1 gap-3">
          <h2 className="text-2xl font-semibold">Notifications</h2>
        </div>

        <div className="flex items-center mb-6">
          <Link
            href={Routes.dashboard.base}
            className="text-[#80Deea] cursor-pointer"
          >
            Dashboard
          </Link>
          <LuChevronRight size={20} className="opacity-[.8]" />
          <span>Notifications</span>
        </div>

        <div className="my-4 flex items-center gap-4">
          <div className="flex items-center bg-gray-900 p-2 px-4 rounded-md flex-1">
            <Search size={18} className="text-gray-400 mr-1" />
            <Input
              placeholder="Search Notifications..."
              className="w-full h-10 bg-transparent border-none focus-visible:ring-transparent focus-visible:ring-offset-0 outline-none border-transparent"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
        </div>

        <DataTable
          key={tableKey}
          table={table}
          isLoadingTable={notificationsQuery.isLoading}
        >
          <div className="flex items-center justify-end">
            <Button
              size="smallIcon"
              variant="secondary"
              title="refresh table"
              onClick={() => notificationsQuery.refetch()}
            >
              <LuRefreshCw
                className={cn(notificationsQuery.isRefetching && 'animate-spin')}
              />
            </Button>
          </div>
        </DataTable>
      </div>

      {!!rowAction?.row && rowAction?.variant === 'delete-notification' && (
        <ConfirmActionModal
          heading={`Are you absolutely sure you want to delete this notification?`}
          description="This action cannot be undone."
          open={rowAction.variant === 'delete-notification'}
          confirmActionLabel={'Delete'}
          onOpenChange={() => {
            setRowAction(null);
          }}
          confirmAction={() =>
            handleAction({
              notificationId: rowAction.row.original.id,
              type: 'delete-notification',
            })
          }
          confirmActionVariant="destructive"
          isLoadingConfirmAction={false}
          className="dark"
        />
      )}

      {!!rowAction?.row && rowAction?.variant === 'mark-as-read' && (
        <ConfirmActionModal
          heading={`Mark this notification as read?`}
          description="This notification will be marked as read."
          open={rowAction.variant === 'mark-as-read'}
          confirmActionLabel={'Mark as Read'}
          onOpenChange={() => {
            setRowAction(null);
          }}
          confirmAction={() =>
            handleAction({
              notificationId: rowAction.row.original.id,
              type: 'mark-as-read',
            })
          }
          confirmActionVariant="default"
          isLoadingConfirmAction={false}
          className="dark"
        />
      )}
    </>
  );
};

export default NotificationsPage;
