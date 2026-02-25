'use client';

import { getShopProducts } from '@/actions/queries/product-queries';
import { useQuery } from '@tanstack/react-query';
import { useId, useMemo, useState } from 'react';
import { getProductTableColumn } from './_components/product-table-column';
import { TProductTableRowAction } from './_components/product-table-type';
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Link from 'next/link';
import { Routes } from '@/configs/routes';
import { LuChevronRight, LuRefreshCw } from 'react-icons/lu';
import { Button, buttonVariants } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import DataTable from '@/components/data-table';
import { cn, errorToast } from '@/lib/utils';
import ConfirmActionModal from '@/components/common/ConfirmActionModal';
import { useDeleteRestoreProductMutation } from '@/actions/mutations/product.mutation';
import { toast } from 'sonner';

const AllProductsPage = () => {
  const tableKey = useId();
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [rowAction, setRowAction] = useState<TProductTableRowAction>(null);

  const columns = useMemo(
    () => getProductTableColumn({ setRowAction }),
    [setRowAction],
  );

  const shopProductsQuery = useQuery(getShopProducts());
  const shopProducts = shopProductsQuery.data;

  const table = useReactTable({
    data: shopProducts || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const deleteRestoreMutation = useDeleteRestoreProductMutation();

  const handleDeleteRestoreProduct = async (payload: {
    productId: string;
    type: 'delete' | 'restore';
  }) => {
    try {
      const response = await deleteRestoreMutation.mutateAsync(payload);
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(
        response.message || `Product ${payload.type}d successfully`,
      );
      setRowAction(null);
      shopProductsQuery.refetch();
    } catch (error) {
      errorToast(error, `Failed to ${payload.type} product`);
    }
  };

  return (
    <>
      <div className="w-full min-h-screen dark p-8">
        {/* BreadCrumbs */}
        <div className="flex justify-between w-full items-center mb-1 gap-3">
          <h2 className="text-2xl font-semibold">All Products</h2>
          <Link
            className={buttonVariants()}
            href={Routes.dashboard.createProduct}
          >
            <Plus size={18} /> Add Product
          </Link>
        </div>

        <div className="flex items-center">
          <Link
            href={Routes.dashboard.base}
            className="text-[#80Deea] cursor-pointer"
          >
            Dashboard
          </Link>
          <LuChevronRight size={20} className="opacity-[.8]" />
          <span>All Product</span>
        </div>

        <div className="my-4 px-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
          <Search size={18} className="text-gray-400 mr-1" />
          <Input
            placeholder="Search Products..."
            className="w-full h-10 bg-transparent border-none focus-visible:ring-transparent focus-visible:ring-offset-0 outline-none border-transparent"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>

        <DataTable
          key={tableKey}
          table={table}
          isLoadingTable={shopProductsQuery.isLoading}
        >
          <div className="flex items-center justify-end">
            <Button
              size="smallIcon"
              variant="secondary"
              title="refresh table"
              onClick={() => shopProductsQuery.refetch()}
            >
              <LuRefreshCw
                className={cn(shopProductsQuery.isRefetching && 'animate-spin')}
              />
            </Button>
          </div>
        </DataTable>
      </div>

      {/*  */}
      {!!rowAction?.row && rowAction?.variant === 'delete-product' && (
        <ConfirmActionModal
          heading={`Are you absolutely sure you want to delete this product '${rowAction.row.original.title}'?`}
          description="This product will be moved to a 'Deleted' state. You can restore it within a day. After that, it will be permanently deleted."
          open={rowAction.variant === 'delete-product'}
          confirmActionLabel={'Delete Product'}
          onOpenChange={() => {
            setRowAction(null);
          }}
          confirmAction={() =>
            handleDeleteRestoreProduct({
              productId: rowAction.row.original.id,
              type: 'delete',
            })
          }
          confirmActionVariant="destructive"
          isLoadingConfirmAction={deleteRestoreMutation.isPending}
          className="dark"
        />
      )}

      {!!rowAction?.row && rowAction?.variant === 'restore-product' && (
        <ConfirmActionModal
          heading={`Are you absolutely sure you want to restore this product '${rowAction.row.original.title}'?`}
          description="This product will be moved back to an 'Active' state."
          open={rowAction.variant === 'restore-product'}
          confirmActionLabel={'Restore Product'}
          onOpenChange={() => {
            setRowAction(null);
          }}
          confirmAction={() =>
            handleDeleteRestoreProduct({
              productId: rowAction.row.original.id,
              type: 'restore',
            })
          }
          confirmActionVariant="destructive"
          isLoadingConfirmAction={deleteRestoreMutation.isPending}
          className="dark"
        />
      )}
    </>
  );
};

export default AllProductsPage;
