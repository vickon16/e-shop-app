import { Routes } from '@/configs/routes';
import Link from 'next/link';
import { LuSearch } from 'react-icons/lu';
import { Input } from '../ui/input';
import { BaseHeader } from './BaseHeader';
import { HeaderBottom } from './HeaderBottom';

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

        <BaseHeader />
      </div>

      <div className="border-b border-b-slate-200" />
      <HeaderBottom />
    </div>
  );
};

export default Header;
