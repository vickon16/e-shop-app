import { TOrderWithRelations } from '@e-shop-app/packages/types';
import { TOrderStatus } from '@e-shop-app/packages/constants';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Hash,
  Store,
  CalendarDays,
  Package,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  BoxSelect,
  PackageCheck,
  MapPin,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

export function getUserOrdersTableColumn(): ColumnDef<TOrderWithRelations>[] {
  return [
    {
      id: 'id',
      accessorKey: 'id',
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 min-w-max">
          Order ID
        </span>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="text-gray-700 text-xs font-medium bg-gray-100 px-2 py-1 rounded-md border flex items-center w-fit gap-1 shadow-sm transition-colors hover:bg-gray-200">
            {row.original.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
      ),
      size: 150,
    },

    {
      id: 'total',
      accessorKey: 'total',
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 min-w-max">
          Total
        </span>
      ),
      cell: ({ row }) => (
        <div className="font-semibold text-emerald-600 text-sm flex items-center">
          ${Number(row.original.total)?.toFixed(2) ?? '0.00'}
        </div>
      ),
      size: 150,
    },
    {
      id: 'paymentStatus',
      accessorKey: 'paymentStatus',
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 min-w-max">
          Payment
        </span>
      ),
      cell: ({ row }) => {
        const status = row.original.paymentStatus || '';

        if (status === 'paid') {
          return (
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-600 border-emerald-200 gap-1.5 pr-3 py-1 shadow-sm hover:bg-emerald-100"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Paid
            </Badge>
          );
        }

        if (status === 'pending') {
          return (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-600 border-amber-200 gap-1.5 pr-3 py-1 shadow-sm hover:bg-amber-100"
            >
              <Clock className="w-3.5 h-3.5" />
              Pending
            </Badge>
          );
        }

        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-500 border-gray-200 gap-1.5 pr-3 py-1 shadow-sm"
          >
            {status || 'UNKNOWN'}
          </Badge>
        );
      },
      size: 200,
    },
    {
      id: 'orderStatus',
      accessorKey: 'orderStatus',
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 min-w-max">
          Status
        </span>
      ),
      cell: ({ row }) => {
        const status = row.original.orderStatus as TOrderStatus | null;

        const statusConfig: Record<
          TOrderStatus,
          { className: string; icon: React.ReactNode; label: string }
        > = {
          Processing: {
            className:
              'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100',
            icon: <Clock className="w-3.5 h-3.5" />,
            label: 'Processing',
          },
          Packed: {
            className: 'bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100',
            icon: <BoxSelect className="w-3.5 h-3.5" />,
            label: 'Packed',
          },
          Shipped: {
            className:
              'bg-blue-50 text-blue-500 border-blue-200 hover:bg-blue-100',
            icon: <Truck className="w-3.5 h-3.5" />,
            label: 'Shipped',
          },
          'Out for Delivery': {
            className:
              'bg-violet-50 text-violet-500 border-violet-200 hover:bg-violet-100',
            icon: <MapPin className="w-3.5 h-3.5" />,
            label: 'Out for Delivery',
          },
          Delivered: {
            className:
              'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
            icon: <PackageCheck className="w-3.5 h-3.5" />,
            label: 'Delivered',
          },
        };

        const config = status ? statusConfig[status] : null;

        if (!config) {
          return (
            <Badge
              variant="outline"
              className="bg-gray-100 text-gray-500 border-gray-200 gap-1.5 pr-3 py-1 shadow-sm"
            >
              {status || 'Unknown'}
            </Badge>
          );
        }

        return (
          <Badge
            variant="outline"
            className={`gap-1.5 pr-3 py-1 shadow-sm ${config.className}`}
          >
            {config.icon}
            {config.label}
          </Badge>
        );
      },
      size: 155,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 min-w-max">
          Date
        </span>
      ),
      cell: ({ row }) => {
        const date = row.original.createdAt
          ? new Date(row.original.createdAt)
          : null;
        if (!date) return <span className="text-muted-foreground">-</span>;

        return (
          <div className="flex flex-col justify-center">
            <span className="text-sm text-gray-700 font-medium">
              {date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="text-xs text-muted-foreground font-medium flex items-center mt-0.5">
              {date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        );
      },
      size: 150,
    },
    {
      id: 'items',
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 min-w-max">
          Items
        </span>
      ),
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className="font-mono px-2 bg-gray-100 hover:bg-gray-200 shadow-sm text-gray-700"
        >
          {row.original.orderItems?.length ?? 0}
        </Badge>
      ),
      size: 90,
    },
    {
      id: 'actions',
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-full block text-right">
          Action
        </span>
      ),
      cell: function Cell({ row }) {
        return (
          <div className="flex justify-end w-full">
            <Link href={`/profile/orders/${row.original.id}`}>
              <Button variant="ghost" size="icon" title="View Details">
                <Eye className="w-4 h-4 text-gray-500" />
              </Button>
            </Link>
          </div>
        );
      },
      size: 80,
    },
  ];
}
