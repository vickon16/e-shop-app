'use client';

import { activeSidebarItem } from '@/configs/constants';
import { useAtom } from 'jotai';

export const useSidebar = () => {
  const [activeSidebar, setActiveSidebar] = useAtom(activeSidebarItem);

  return { activeSidebar, setActiveSidebar };
};
