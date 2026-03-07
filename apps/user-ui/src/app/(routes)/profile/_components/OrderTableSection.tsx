'use client';

import { useQuery } from '@tanstack/react-query';
import { useId, useMemo, useState } from 'react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { LuRefreshCw } from 'react-icons/lu';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DataTable from '@/components/data-table';
import { cn } from '@/lib/utils';
import { getUserOrdersOptions } from '@/actions/queries/orders-queries';
import { getUserOrdersTableColumn } from './user-orders-table-column';

export const OrderTableSection = () => {
  const tableKey = useId();
  const [globalFilter, setGlobalFilter] = useState<string>('');

  const columns = useMemo(() => getUserOrdersTableColumn(), []);

  const ordersQuery = useQuery(getUserOrdersOptions());
  const userOrders = ordersQuery.data;

  const table = useReactTable({
    data: userOrders || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">My Orders</h3>
        <Button
          size="sm"
          variant="outline"
          title="Refresh Table"
          onClick={() => ordersQuery.refetch()}
          className="gap-2"
        >
          <LuRefreshCw
            className={cn(
              'w-4 h-4',
              ordersQuery.isRefetching && 'animate-spin',
            )}
          />
          Refresh
        </Button>
      </div>

      <div className="flex items-center bg-white border border-gray-200 p-2 rounded-md mb-4 shadow-sm">
        <Search size={18} className="text-gray-400 mr-2 ml-1" />
        <Input
          placeholder="Search orders..."
          className="w-full h-8 bg-transparent border-none focus-visible:ring-transparent focus-visible:ring-offset-0 outline-none p-0 text-sm"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="rounded-lg w-full overflow-x-auto">
        <DataTable
          key={tableKey}
          table={table}
          isLoadingTable={ordersQuery.isLoading}
        />
      </div>
    </div>
  );
};
