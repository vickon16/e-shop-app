'use client';

import { getUserOptions } from '@/actions/queries/base-queries';
import { Routes } from '@/configs/routes';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { FaCartPlus, FaRegUser } from 'react-icons/fa';
import { GoHeart } from 'react-icons/go';
import { CgProfile } from 'react-icons/cg';

export const BaseHeader = () => {
  const userQuery = useQuery(getUserOptions());
  const user = userQuery.data;
  const isLoadingUser = userQuery.isLoading;
  const isLoggedIn = !!user && !isLoadingUser;
  const route = isLoggedIn ? Routes.profile : Routes.auth.login;

  return (
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-3">
        <Link
          href={route}
          className="border-2 size-12.5 flex items-center justify-center rounded-full border-color2/10"
        >
          <FaRegUser className="text-lg" />
        </Link>

        <Link href={route}>
          <span className="block text-sm">Hello,</span>
          <span className="font-semibold">
            {isLoggedIn ? user.name : isLoadingUser ? '...' : 'Sign In'}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-5">
        <Link href={Routes.wishlist} className="relative">
          <GoHeart className="text-3xl" />
          <AbsoluteDisplay value={2} className="bg-red-500" />
        </Link>
        <Link href={Routes.cart} className="relative">
          <FaCartPlus className="text-3xl" />
          <AbsoluteDisplay value={5} className="bg-emerald-500" />
        </Link>
      </div>
    </div>
  );
};

const AbsoluteDisplay = (props: { className?: string; value: number }) => {
  return (
    <div
      className={cn(
        'size-6 border-2 border-white rounded-full flex items-center justify-center absolute -top-2.5 -right-2.5',
        props.className,
      )}
    >
      <span className="text-xs text-white font-semibold">{props.value}</span>
    </div>
  );
};
