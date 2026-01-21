'use client';

import { getSellerOptions } from '@/actions/queries/base-queries';
import { Routes } from '@/configs/routes';
import { useSidebar } from '@/hooks/use-sidebar';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { FaHome } from 'react-icons/fa';
import { FaRegSquarePlus } from 'react-icons/fa6';
import {
  LuBellPlus,
  LuBellRing,
  LuCalendarPlus,
  LuListOrdered,
  LuLogOut,
  LuMail,
  LuPackageSearch,
  LuSettings,
  LuTicketPercent,
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
  const sellerQuery = useQuery(getSellerOptions());

  const seller = sellerQuery.data;

  useEffect(() => {
    setActiveSidebar(pathname);
  }, [pathname, setActiveSidebar]);

  const getIconClass = (route: string) =>
    `size-5 ${activeSidebar === route ? 'text-[#0085ff]' : 'text-[#969696]'}`;

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
              <h3 className="text-xl font-medium text-[#ecedee]">
                {seller?.shop.name}
              </h3>
              <h5 className="font-medium text-xs text-[#ecedeecf] whitespace-nowrap truncate max-w-[170px]">
                {seller?.shop?.address}
              </h5>
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
                    className={getIconClass(Routes.dashboard.orders)}
                  />
                }
                isActive={activeSidebar === Routes.dashboard.orders}
                href={Routes.dashboard.orders}
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
            </SidebarMenu>

            <SidebarMenu title="Products">
              <SidebarItem
                title="Create Product"
                icon={
                  <FaRegSquarePlus
                    className={getIconClass(Routes.dashboard.createProduct)}
                  />
                }
                isActive={activeSidebar === Routes.dashboard.createProduct}
                href={Routes.dashboard.createProduct}
              />
              <SidebarItem
                title="All Products"
                icon={
                  <LuPackageSearch
                    className={getIconClass(Routes.dashboard.allProducts)}
                  />
                }
                isActive={activeSidebar === Routes.dashboard.allProducts}
                href={Routes.dashboard.allProducts}
              />
            </SidebarMenu>
            <SidebarMenu title="Events">
              <SidebarItem
                title="Create Event"
                icon={
                  <LuCalendarPlus
                    className={getIconClass(Routes.dashboard.createEvent)}
                  />
                }
                isActive={activeSidebar === Routes.dashboard.createEvent}
                href={Routes.dashboard.createEvent}
              />
              <SidebarItem
                title="All Events"
                icon={
                  <LuBellPlus
                    className={getIconClass(Routes.dashboard.allEvents)}
                  />
                }
                isActive={activeSidebar === Routes.dashboard.allEvents}
                href={Routes.dashboard.allEvents}
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem
                title="Inbox"
                icon={
                  <LuMail className={getIconClass(Routes.dashboard.inbox)} />
                }
                isActive={activeSidebar === Routes.dashboard.inbox}
                href={Routes.dashboard.inbox}
              />
              <SidebarItem
                title="Settings"
                icon={
                  <LuSettings
                    className={getIconClass(Routes.dashboard.settings)}
                  />
                }
                isActive={activeSidebar === Routes.dashboard.settings}
                href={Routes.dashboard.settings}
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
          <SidebarMenu title="Extras">
            <SidebarItem
              title="Discount Codes"
              icon={
                <LuTicketPercent
                  className={getIconClass(Routes.dashboard.discountCodes)}
                />
              }
              isActive={activeSidebar === Routes.dashboard.discountCodes}
              href={Routes.dashboard.discountCodes}
            />
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
