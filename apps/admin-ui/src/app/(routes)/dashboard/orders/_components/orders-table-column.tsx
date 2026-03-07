import { TOrderWithRelations } from '@e-shop-app/packages/types';
import { TOrderStatus } from '@e-shop-app/packages/constants';
import type { ColumnDef } from '@tanstack/react-table';
import { OrdersTableAction } from './orders-table-action';
import { TOrdersTableRowAction } from './orders-table-type';
import { Badge } from '@/components/ui/badge';
import {
  Hash,
  User,
  CalendarDays,
  Package,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  BoxSelect,
  PackageCheck,
  MapPin,
} from 'lucide-react';

interface GetOrdersTableColumnProps {
  setRowAction: React.Dispatch<React.SetStateAction<TOrdersTableRowAction>>;
}

export function getOrdersTableColumn({
  setRowAction,
}: GetOrdersTableColumnProps): ColumnDef<TOrderWithRelations>[] {
  return [
    {
      id: 'id',
      accessorKey: 'id',
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 min-w-max">
          <Hash className="w-3.5 h-3.5" /> Order ID
        </span>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="text-foreground text-xs font-medium bg-secondary/60 px-2 py-1 rounded-md border border-border/50 flex items-center w-fit gap-1 shadow-sm transition-colors hover:bg-secondary">
            {row.original.id.slice(-6).toUpperCase()}
          </span>
        </div>
      ),
      size: 100,
    },
    {
      id: 'buyer',
      accessorKey: 'user.name',
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 min-w-max">
          <User className="w-3.5 h-3.5" /> Buyer
        </span>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20 shadow-sm">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="text-foreground font-medium text-sm">
            {row.original?.user?.name || 'Guest'}
          </span>
        </div>
      ),
      size: 180,
    },
    {
      id: 'shop.name',
      accessorKey: 'shop.name',
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 min-w-max">
          <CreditCard className="w-3.5 h-3.5" /> Shop Name
        </span>
      ),
      cell: ({ row }) => (
        <div className="font-semibold text-sm flex items-center">
          {row.original.shop?.name}
        </div>
      ),
      size: 100,
    },
    {
      id: 'total',
      accessorKey: 'total',
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 min-w-max">
          <CreditCard className="w-3.5 h-3.5" /> Total
        </span>
      ),
      cell: ({ row }) => (
        <div className="font-semibold text-emerald-400 dark:text-emerald-400 text-sm flex items-center">
          ${row.original.total?.toFixed(2) ?? '0.00'}
        </div>
      ),
      size: 100,
    },
    {
      id: 'paymentStatus',
      accessorKey: 'paymentStatus',
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 min-w-max">
          Payment Status
        </span>
      ),
      cell: ({ row }) => {
        const status = row.original.paymentStatus || '';

        if (status === 'paid') {
          return (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 pr-3 py-1 shadow-sm hover:bg-emerald-500/20"
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
              className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5 pr-3 py-1 shadow-sm hover:bg-amber-500/20"
            >
              <Clock className="w-3.5 h-3.5" />
              Pending
            </Badge>
          );
        }

        return (
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground gap-1.5 pr-3 py-1 shadow-sm"
          >
            {status || 'UNKNOWN'}
          </Badge>
        );
      },
      size: 130,
    },
    {
      id: 'orderStatus',
      accessorKey: 'orderStatus',
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 min-w-max">
          <Truck className="w-3.5 h-3.5" /> Order Status
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
              'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20',
            icon: <Clock className="w-3.5 h-3.5" />,
            label: 'Processing',
          },
          Packed: {
            className:
              'bg-sky-500/10 text-sky-500 border-sky-500/20 hover:bg-sky-500/20',
            icon: <BoxSelect className="w-3.5 h-3.5" />,
            label: 'Packed',
          },
          Shipped: {
            className:
              'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
            icon: <Truck className="w-3.5 h-3.5" />,
            label: 'Shipped',
          },
          'Out for Delivery': {
            className:
              'bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20',
            icon: <MapPin className="w-3.5 h-3.5" />,
            label: 'Out for Delivery',
          },
          Delivered: {
            className:
              'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20',
            icon: <PackageCheck className="w-3.5 h-3.5" />,
            label: 'Delivered',
          },
        };

        const config = status ? statusConfig[status] : null;

        if (!config) {
          return (
            <Badge
              variant="outline"
              className="bg-muted text-muted-foreground gap-1.5 pr-3 py-1 shadow-sm"
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
          <CalendarDays className="w-3.5 h-3.5" /> Created
        </span>
      ),
      cell: ({ row }) => {
        const date = row.original.createdAt
          ? new Date(row.original.createdAt)
          : null;
        if (!date) return <span className="text-muted-foreground">-</span>;

        return (
          <div className="flex flex-col justify-center">
            <span className="text-sm text-foreground font-medium">
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
          <Package className="w-3.5 h-3.5" /> Items
        </span>
      ),
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className="font-mono px-2 bg-secondary/60 hover:bg-secondary shadow-sm"
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
          Actions
        </span>
      ),
      cell: function Cell({ row }) {
        return (
          <div className="flex justify-end w-full">
            <OrdersTableAction row={row} setRowAction={setRowAction} />
          </div>
        );
      },
      size: 80,
    },
  ];
}
