'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Home,
  Package,
  ShoppingBag,
  Store,
  Tag,
  Truck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';

import { getOrderDetails } from '@/actions/queries/orders-queries';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Routes } from '@/configs/routes';
import { cn } from '@/lib/utils';
import { ORDER_STATUSES, TOrderStatus } from '@e-shop-app/packages/constants';
import { TOrderItemWithRelations } from '@e-shop-app/packages/types';

// --- Helpers ---
const getStatusIndex = (status: string): number => {
  const idx = ORDER_STATUSES.findIndex(
    (s) => s.toLowerCase() === status?.toLowerCase(),
  );
  return idx >= 0 ? idx : 0;
};

const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatCurrency = (value: string | number | null | undefined): string => {
  if (value == null) return '$0.00';
  return `$${Number(value).toFixed(2)}`;
};

// --- Sub-components ---
function OrderStatusTracker({ status }: { status: TOrderStatus }) {
  const currentIndex = getStatusIndex(status);

  return (
    <div className="relative flex flex-col items-center py-4">
      {ORDER_STATUSES.map((step, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === ORDER_STATUSES.length - 1;

        return (
          <div key={step} className="flex flex-col items-center w-full">
            <div className="flex items-center gap-4 w-full px-2">
              <div className="flex-shrink-0 flex flex-col items-center">
                {isPast || isCurrent ? (
                  <CheckCircle2
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isCurrent ? 'text-blue-400' : 'text-emerald-400',
                    )}
                  />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40" />
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  isCurrent
                    ? 'text-blue-400 font-semibold'
                    : isPast
                      ? 'text-emerald-400'
                      : 'text-muted-foreground',
                )}
              >
                {step}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'w-0.5 h-10 self-start ml-[18px]',
                  isPast ? 'bg-emerald-400/60' : 'bg-border/40',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderItemRow({ item }: { item: TOrderItemWithRelations }) {
  const product = item.product;
  const imageUrl = product?.images?.[0]?.fileUrl;
  const options = item.selectedOptions as Record<string, string> | null;

  return (
    <div className="flex items-start gap-4 py-4 border-b border-border/50 last:border-0">
      <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border border-border/50 bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product?.title ?? 'Product'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package size={24} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">
          {product?.title ?? 'Unknown Product'}
        </p>
        {item.quantity != null && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Qty: {item.quantity}
          </p>
        )}
        {options && Object.keys(options).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {Object.entries(options).map(([key, val]) => (
              <span
                key={key}
                className="text-[10px] bg-secondary/70 text-muted-foreground px-1.5 py-0.5 rounded border border-border/40 capitalize"
              >
                {key}: {val}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="font-semibold text-sm">{formatCurrency(item.price)}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

// --- Skeleton ---
function OrderDetailsSkeleton() {
  return (
    <div className="w-full min-h-screen dark p-6 lg:p-8 space-y-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-9 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function OrderDetailsPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const orderId = params?.orderId ?? '';

  const { data, isLoading, isError } = useQuery(getOrderDetails(orderId));
  const order = data?.order;
  const coupon = data?.coupon;

  if (isLoading) return <OrderDetailsSkeleton />;

  if (isError || !order) {
    return (
      <div className="w-full min-h-screen dark flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-destructive text-lg font-semibold">
          Failed to load order.
        </p>
        <button
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const shippingAddr = order.shippingAddress;
  const isPaymentPaid = order.paymentStatus === 'paid';

  return (
    <div className="w-full min-h-screen dark p-6 lg:p-8">
      {/* Back Link */}
      <Link
        href={Routes.dashboard.orders.base}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        Go Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Order #{order.id.slice(0, 7).toUpperCase()}
          </h1>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-xs px-3 py-1',
            isPaymentPaid
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          )}
        >
          {isPaymentPaid ? 'Paid' : (order.paymentStatus ?? 'Pending')}
        </Badge>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Order Info + Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingBag size={16} />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoRow
                label="Payment Status"
                value={
                  <span
                    className={`capitalize ${isPaymentPaid ? 'text-emerald-400' : 'text-amber-400'}`}
                  >
                    {order.paymentStatus ?? 'Pending'}
                  </span>
                }
              />
              <InfoRow
                label="Order Status"
                value={
                  <span className="text-blue-400">
                    {order.orderStatus ?? 'Processing'}
                  </span>
                }
              />
              <InfoRow label="Total" value={formatCurrency(order.total)} />
              {order.discountAmount != null && order.discountAmount > 0 && (
                <InfoRow
                  label="Discount"
                  value={
                    <span className="text-emerald-400">
                      -{formatCurrency(order.discountAmount)}
                    </span>
                  }
                />
              )}
              <InfoRow label="Date" value={formatDate(order.createdAt)} />
              {coupon && (
                <InfoRow
                  label="Coupon"
                  value={
                    <span className="font-mono text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded inline-flex items-center gap-1">
                      <Tag size={10} />
                      {coupon.discountCode}
                      {' · '}
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% off`
                        : `-$${Number(coupon.discountValue).toFixed(2)}`}
                    </span>
                  }
                />
              )}
              {order.couponCode && !coupon && (
                <InfoRow label="Coupon Code" value={order.couponCode} />
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {shippingAddr && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Home size={16} />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                {shippingAddr.label && (
                  <Badge
                    variant="secondary"
                    className="mb-2 text-xs capitalize"
                  >
                    {shippingAddr.label}
                  </Badge>
                )}
                <p className="font-medium text-foreground">
                  {shippingAddr.name}
                </p>
                <p>{shippingAddr.street}</p>
                <p>
                  {shippingAddr.city}, {shippingAddr.state}{' '}
                  {shippingAddr.zipCode}
                </p>
                <p>{shippingAddr.country}</p>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck size={16} />
                Order Items
                <Badge
                  variant="secondary"
                  className="ml-auto font-mono text-xs"
                >
                  {order.orderItems?.length ?? 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.orderItems?.length > 0 ? (
                order.orderItems.map((item) => (
                  <OrderItemRow key={item.id} item={item} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No items found.
                </p>
              )}
              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                {coupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Discount ({coupon.discountCode})
                    </span>
                    <span className="text-emerald-400">
                      -{' '}
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : formatCurrency(coupon.discountValue)}
                    </span>
                  </div>
                )}
                {order.discountAmount != null &&
                  order.discountAmount > 0 &&
                  !coupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-emerald-400">
                        -{formatCurrency(order.discountAmount)}
                      </span>
                    </div>
                  )}
                <div className="border-t border-border/50 my-1" />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Status Tracker + Customer + Shop */}
        <div className="space-y-6">
          {/* Status Tracker */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Delivery Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusTracker
                status={(order.orderStatus ?? 'Processing') as TOrderStatus}
              />
            </CardContent>
          </Card>

          {/* Customer Info */}
          {order.user && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  {order.user.avatar?.fileUrl ? (
                    <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={order.user.avatar.fileUrl}
                        alt={order.user.name ?? 'User'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {order.user.name?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {order.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.user.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shop Info */}
          {order.shop && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Store size={16} />
                  Shop
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="font-medium text-sm">{order.shop.name}</p>
                {order.shop.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {order.shop.bio}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
