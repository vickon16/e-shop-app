import { NavItemTypes } from '@/types';
import { Routes } from './routes';

export const navItems: NavItemTypes[] = [
  { title: 'Home', href: Routes.home },
  { title: 'Products', href: Routes.product },
  { title: 'Shops', href: Routes.shop },
  { title: 'Offers', href: Routes.offer },
  { title: 'Become A Seller', href: Routes.becomeSeller },
];
