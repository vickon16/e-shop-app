'use client';

import { getAdminOrders } from '@/actions/queries/orders-queries';
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
import { getOrdersTableColumn } from './_components/orders-table-column';
import { TOrdersTableRowAction } from './_components/orders-table-type';

const OrdersPage = () => {
  const tableKey = useId();
  const [globalFilter, setGlobalFilter] = useState<string>('');
  // Remove unused analyticsData and selectedProduct
  const [rowAction, setRowAction] = useState<TOrdersTableRowAction>(null);

  const columns = useMemo(
    () => getOrdersTableColumn({ setRowAction }),
    [setRowAction],
  );

  const ordersQuery = useQuery(getAdminOrders());
  const sellerOrders = ordersQuery.data;

  const table = useReactTable({
    data: sellerOrders || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  // Remove product delete/restore logic (not relevant for orders)

  return (
    <>
      <div className="w-full min-h-screen text-foreground dark p-8">
        {/* BreadCrumbs */}
        <div className="flex justify-between w-full items-center mb-1 gap-3">
          <h2 className="text-2xl font-semibold">All Orders</h2>
        </div>

        <div className="flex items-center mb-2">
          <Link
            href={Routes.dashboard.base}
            className="text-[#80Deea] cursor-pointer"
          >
            Dashboard
          </Link>
          <LuChevronRight size={20} className="opacity-[.8]" />
          <span>All Orders</span>
        </div>

        <div className="my-4 px-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
          <Search size={18} className="text-gray-400 mr-1" />
          <Input
            placeholder="Search Orders..."
            className="w-full h-10 bg-transparent border-none focus-visible:ring-transparent focus-visible:ring-offset-0 outline-none border-transparent"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>

        <div className="rounded-lg overflow-x-auto shadow-lg border">
          <DataTable
            key={tableKey}
            table={table}
            isLoadingTable={ordersQuery.isLoading}
          >
            <div className="flex items-center justify-end p-2">
              <Button
                size="smallIcon"
                variant="secondary"
                title="refresh table"
                onClick={() => ordersQuery.refetch()}
              >
                <LuRefreshCw
                  className={cn(ordersQuery.isRefetching && 'animate-spin')}
                />
              </Button>
            </div>
          </DataTable>
        </div>
      </div>

      {/* No product delete/restore modals for orders */}
    </>
  );
};

export default OrdersPage;
