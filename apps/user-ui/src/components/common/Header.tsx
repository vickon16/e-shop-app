import Link from 'next/link';
import { Input } from '../ui/input';
import { LuSearch } from 'react-icons/lu';
import { FaRegUser } from 'react-icons/fa';
import { GoHeart } from 'react-icons/go';
import { FaCartPlus } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { HeaderBottom } from './HeaderBottom';
import { Routes } from '@/configs/routes';

const Header = () => {
  return (
    <div className="w-full bg-background">
      <div className="container flex items-center justify-between">
        <div>
          <Link href={Routes.home}>
            <span className="text-3xl font-semibold">E-Shop</span>
          </Link>
        </div>

        <div className="w-full max-w-[50%] relative h-11.25">
          <Input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 font-poppins font-medium border-[2.5px] border-color1 focus-visible:ring-transparent h-full"
          />
          <div className="w-15 cursor-pointer flex items-center justify-center h-full bg-color1 absolute top-0 right-0">
            <LuSearch className="text-white text-2xl" />
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <Link
              href={Routes.auth.login}
              className="border-2 size-12.5 flex items-center justify-center rounded-full border-color2/10"
            >
              <FaRegUser className="text-lg" />
            </Link>
            <Link href={Routes.auth.login}>
              <span className="block text-sm">Hello,</span>
              <span className="font-semibold">Sign In</span>
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
      </div>

      <div className="border-b border-b-slate-200" />
      <HeaderBottom />
    </div>
  );
};

export default Header;

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

export const BaseHeader = () => {
  return (
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-3">
        <Link
          href={Routes.auth.login}
          className="border-2 size-12.5 flex items-center justify-center rounded-full border-color2/10"
        >
          <FaRegUser className="text-lg" />
        </Link>
        <Link href={Routes.auth.login}>
          <span className="block text-sm">Hello,</span>
          <span className="font-semibold">Sign In</span>
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
