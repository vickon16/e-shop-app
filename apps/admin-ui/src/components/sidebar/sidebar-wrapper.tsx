'use client';

import { getAdminOptions } from '@/actions/queries/base-queries';
import { Routes } from '@/configs/routes';
import { useSidebar } from '@/hooks/use-sidebar';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { FaHome } from 'react-icons/fa';
import {
  LuBellPlus,
  LuBellRing,
  LuFileClock,
  LuListOrdered,
  LuLogOut,
  LuPackageSearch,
  LuPencilRuler,
  LuSettings,
  LuUsers,
} from 'react-icons/lu';
import { MdPayments } from 'react-icons/md';
import Box from '../box';
import Logo from '../common/Logo';
import { SidebarItem } from './sidebar.item';
import { SidebarMenu } from './sidebar.menu';
import { Sidebar } from './sidebar.styles';

export const SidebarWrapper = () => {
  const pathname = usePathname();
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const adminQuery = useQuery(getAdminOptions());

  const admin = adminQuery.data;

  useEffect(() => {
    setActiveSidebar(pathname);
  }, [pathname, setActiveSidebar]);

  const getIconClass = (route: string) =>
    `size-4 ${activeSidebar === route ? 'text-[#0085ff]' : 'text-[#969696]'}`;

  return (
    <Box
      css={{
        height: '100vh',
        zIndex: 202,
        position: 'sticky',
        padding: '8px',
        top: 0,
        overflowY: 'scroll',
        scrollbarWidth: 'none',
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link
            href={Routes.home}
            className="flex justify-center items-center gap-2.5"
          >
            <Logo />
            <Box className="self-end">
              <h1 className="text-base font-semibold text-primary2">Admin</h1>
              <h3 className="text-sm font-medium text-[#ecedee]">
                {admin?.name}
              </h3>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>

      <div className="block my-6 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            icon={<FaHome className={getIconClass(Routes.dashboard.base)} />}
            isActive={activeSidebar === Routes.dashboard.base}
            href={Routes.dashboard.base}
          />

          <div className="mt-3 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                title="Orders"
                icon={
                  <LuListOrdered
                    className={getIconClass(Routes.dashboard.orders.base)}
                  />
                }
                isActive={activeSidebar === Routes.dashboard.orders.base}
                href={Routes.dashboard.orders.base}
              />
              <SidebarItem
                title="Payments"
                icon={
                  <MdPayments
                    className={getIconClass(Routes.dashboard.payments)}
                  />
                }
                isActive={activeSidebar === Routes.dashboard.payments}
                href={Routes.dashboard.payments}
              />

              <SidebarItem
                title="Users"
                icon={
                  <LuUsers className={getIconClass(Routes.dashboard.users)} />
                }
                isActive={activeSidebar === Routes.dashboard.users}
                href={Routes.dashboard.users}
              />
              <SidebarItem
                title="Sellers"
                icon={
                  <LuUsers className={getIconClass(Routes.dashboard.sellers)} />
                }
                isActive={activeSidebar === Routes.dashboard.sellers}
                href={Routes.dashboard.sellers}
              />
              <SidebarItem
                title="Products"
                icon={
                  <LuPackageSearch
                    className={getIconClass(Routes.dashboard.products)}
                  />
                }
                isActive={activeSidebar === Routes.dashboard.products}
                href={Routes.dashboard.products}
              />
              <SidebarItem
                title="Events"
                icon={
                  <LuBellPlus
                    className={getIconClass(Routes.dashboard.events)}
                  />
                }
                isActive={activeSidebar === Routes.dashboard.events}
                href={Routes.dashboard.events}
              />
            </SidebarMenu>

            <SidebarMenu title="Controllers">
              <SidebarItem
                title="Loggers"
                icon={
                  <LuFileClock
                    className={getIconClass(Routes.dashboard.loggers)}
                  />
                }
                isActive={activeSidebar === Routes.dashboard.loggers}
                href={Routes.dashboard.loggers}
              />

              <SidebarItem
                title="Management"
                icon={
                  <LuSettings
                    className={getIconClass(Routes.dashboard.management)}
                  />
                }
                isActive={activeSidebar === Routes.dashboard.management}
                href={Routes.dashboard.management}
              />

              <SidebarItem
                title="Notifications"
                icon={
                  <LuBellRing
                    className={getIconClass(Routes.dashboard.notifications)}
                  />
                }
                isActive={activeSidebar === Routes.dashboard.notifications}
                href={Routes.dashboard.notifications}
              />
            </SidebarMenu>
          </div>
          <SidebarMenu title="Customization">
            <SidebarItem
              title="All Customization"
              icon={
                <LuPencilRuler
                  className={getIconClass(Routes.dashboard.customization)}
                />
              }
              isActive={activeSidebar === Routes.dashboard.customization}
              href={Routes.dashboard.customization}
            />
          </SidebarMenu>

          <SidebarMenu title="Extras">
            <SidebarItem
              title="Logout"
              icon={<LuLogOut className={getIconClass(Routes.logout)} />}
              isActive={activeSidebar === Routes.logout}
              href={Routes.logout}
            />
          </SidebarMenu>
        </Sidebar.Body>
      </div>
    </Box>
  );
};
