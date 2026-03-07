'use client';

import { getAdminSellers } from '@/actions/queries/seller-queries';
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
import { getSellerTableColumn } from './_components/seller-table-column';
import { TSellerTableRowAction } from './_components/seller-table-type';
import ConfirmActionModal from '@/components/common/ConfirmActionModal';
import { toast } from 'sonner';

const AllSellersPage = () => {
  const tableKey = useId();
  const [globalFilter, setGlobalFilter] = useState<string>('');

  const [rowAction, setRowAction] = useState<TSellerTableRowAction>(null);

  const columns = useMemo(
    () => getSellerTableColumn({ setRowAction }),
    [setRowAction],
  );

  const adminSellersQuery = useQuery(getAdminSellers());
  const adminSellers = adminSellersQuery.data;

  const table = useReactTable({
    data: adminSellers || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleDeleteRestoreSeller = async (payload: {
    sellerId: string;
    type: 'delete' | 'restore';
  }) => {
    // Mock functionality as there is no specific delete/restore seller mutation requested yet
    toast.info(
      `Mock: ${payload.type} seller function triggered for ${payload.sellerId}`,
    );
    setRowAction(null);
  };

  return (
    <>
      <div className="w-full min-h-screen dark p-8">
        {/* BreadCrumbs */}
        <div className="flex justify-between w-full items-center mb-1 gap-3">
          <h2 className="text-2xl font-semibold">All Sellers</h2>
        </div>

        <div className="flex items-center">
          <Link
            href={Routes.dashboard.base}
            className="text-[#80Deea] cursor-pointer"
          >
            Dashboard
          </Link>
          <LuChevronRight size={20} className="opacity-[.8]" />
          <span>All Sellers</span>
        </div>

        <div className="my-4 px-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
          <Search size={18} className="text-gray-400 mr-1" />
          <Input
            placeholder="Search Sellers..."
            className="w-full h-10 bg-transparent border-none focus-visible:ring-transparent focus-visible:ring-offset-0 outline-none border-transparent"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>

        <DataTable
          key={tableKey}
          table={table}
          isLoadingTable={adminSellersQuery.isLoading}
        >
          <div className="flex items-center justify-end">
            <Button
              size="smallIcon"
              variant="secondary"
              title="refresh table"
              onClick={() => adminSellersQuery.refetch()}
            >
              <LuRefreshCw
                className={cn(adminSellersQuery.isRefetching && 'animate-spin')}
              />
            </Button>
          </div>
        </DataTable>
      </div>

      {/*  */}
      {!!rowAction?.row && rowAction?.variant === 'delete-seller' && (
        <ConfirmActionModal
          heading={`Are you absolutely sure you want to delete this seller '${rowAction.row.original.name}'?`}
          description="This action cannot be undone."
          open={rowAction.variant === 'delete-seller'}
          confirmActionLabel={'Delete Seller'}
          onOpenChange={() => {
            setRowAction(null);
          }}
          confirmAction={() =>
            handleDeleteRestoreSeller({
              sellerId: rowAction.row.original.id,
              type: 'delete',
            })
          }
          confirmActionVariant="destructive"
          isLoadingConfirmAction={false}
          className="dark"
        />
      )}

      {!!rowAction?.row && rowAction?.variant === 'restore-seller' && (
        <ConfirmActionModal
          heading={`Are you absolutely sure you want to restore this seller '${rowAction.row.original.name}'?`}
          description="This seller will be restored."
          open={rowAction.variant === 'restore-seller'}
          confirmActionLabel={'Restore Seller'}
          onOpenChange={() => {
            setRowAction(null);
          }}
          confirmAction={() =>
            handleDeleteRestoreSeller({
              sellerId: rowAction.row.original.id,
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

export default AllSellersPage;
