import { NavItemTypes } from '@/types';
import { Routes } from './routes';

export const navItems: NavItemTypes[] = [
  { title: 'Home', href: Routes.home },
  { title: 'Products', href: Routes.products },
  { title: 'Shops', href: Routes.shops },
  { title: 'Offers', href: Routes.offers },
  { title: 'Become A Seller', href: Routes.becomeSeller },
];
