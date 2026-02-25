import { Routes } from '@/configs/routes';
import { TProductWithImagesAndShop } from '@e-shop-app/packages/types';
import type { ColumnDef } from '@tanstack/react-table';
import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductTableAction } from './product-table-action';
import { TProductTableRowAction } from './product-table-type';
import { Badge } from '@/components/ui/badge';

interface GetProductTableColumnProps {
  setRowAction: React.Dispatch<React.SetStateAction<TProductTableRowAction>>;
}

export function getProductTableColumn({
  setRowAction,
}: GetProductTableColumnProps): ColumnDef<TProductWithImagesAndShop>[] {
  return [
    // Name
    {
      id: 'search',
      accessorKey: 'images',
      header: 'Images',
      cell: ({ row }) => {
        return row.original.images && row.original.images.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 max-w-[200px]">
            {row.original.images.map((image) => (
              <Image
                key={image.id}
                src={image.fileUrl}
                alt={'Product Image'}
                width={40}
                height={40}
                className="size-10 rounded-md object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-200 text-sm text-gray-500">
            No Image
          </div>
        );
      },
    },

    // Name
    {
      id: 'name',
      accessorKey: 'title',
      header: 'Product Name',
      cell: ({ row }) => {
        const title = row.original.title;
        const deleted = row.original.deletedAt;
        const slug = row.original.slug;
        return (
          <Link
            href={`${Routes.dashboard.userAppProductPage}/${slug}`}
            className="max-w-sm truncate text-primary hover:underline"
            title={title}
          >
            {title} {deleted && <Badge variant="destructive">Deleted</Badge>}
          </Link>
        );
      },
    },

    {
      id: 'price',
      accessorKey: 'salePrice',
      header: 'Price',
      cell: ({ row }) => {
        return <span>${row.original.salePrice}</span>;
      },
    },
    {
      id: 'stock',
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => {
        return (
          <span
            className={row.original.stock < 10 ? 'text-red-500' : 'text-white'}
          >
            {row.original.stock} left
          </span>
        );
      },
    },

    {
      id: 'category',
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        return <span>{row.original.category}</span>;
      },
    },

    {
      id: 'rating',
      accessorKey: 'ratings',
      header: 'Rating',
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" className="h-4 w-4" />
            <span>{row.original.ratings || 0}</span>
          </div>
        );
      },
    },

    // Actions
    {
      id: 'actions',
      header: 'Actions',
      cell: function Cell({ row }) {
        return <ProductTableAction row={row} setRowAction={setRowAction} />;
      },
      size: 15,
    },
  ];
}
