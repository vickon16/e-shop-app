'use client';

import { GET_USER } from '@/actions/base-action-constants';
import { getUserOptions } from '@/actions/queries/base-queries';
import { QuickActionCard } from '@/components/common/cards/QuickActionCard';
import { StatCard } from '@/components/common/cards/StatCard';
import { Button } from '@/components/ui/button';
import { Routes } from '@/configs/routes';
import { axiosInstance } from '@/lib/axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { use, useEffect, useState } from 'react';
import {
  LuBadgeCheck,
  LuBell,
  LuCircleCheck,
  LuClock,
  LuGift,
  LuInbox,
  LuLoader,
  LuLock,
  LuLogOut,
  LuMapPin,
  LuPhoneCall,
  LuReceipt,
  LuSettings,
  LuShoppingBag,
  LuTruck,
  LuUser,
} from 'react-icons/lu';
import { ShippingAddressSection } from './_components/ShippingAddressSection';

const ProfilePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const tab = searchParams.get('tab');
  const userQuery = useQuery(getUserOptions());
  const currentUser = userQuery?.data;
  const [activeTab, setActiveTab] = useState(tab || 'profile');

  useEffect(() => {
    if (tab !== activeTab) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('tab', activeTab);
      router.replace(`/profile?${newParams.toString()}`);
    }
  }, [activeTab]);

  const logOutHandler = async () => {
    await axiosInstance.get('/auth/logout-user').then(() => {
      queryClient.invalidateQueries({ queryKey: [GET_USER] });
      router.push(Routes.auth.login);
    });
  };

  console.log({ currentUser });

  return (
    <div className="bg-gray-50 p-6 pb-14">
      <div className="md:max-w-8xl w-full mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-xl font-bold text-gray-500">
            Welcome back,{' '}
            <span className="text-3xl text-gray-800">
              {userQuery?.isLoading ? (
                <LuLoader className="inline animate-spin size-5" />
              ) : (
                `${currentUser?.name || 'User'}`
              )}
            </span>{' '}
            👋
          </h1>
        </div>

        {/* Profile overview grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard title="Total Orders" count={10} icon={LuClock} />
          <StatCard title="Processing Orders" count={10} icon={LuTruck} />
          <StatCard title="Completed Orders" count={10} icon={LuCircleCheck} />
        </div>

        {/* Sidebar and content layout */}

        <div className="mt-10 flex flex-col md:flex-row gap-6">
          {/* Left navigation */}
          <div className="bg-white p-4 self-start rounded-md shadow-md border border-gray-100 w-full md:w-1/5">
            <nav className="space-y-2">
              <NavItem
                label="Profile"
                icon={LuUser}
                active={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
              />
              <NavItem
                label="My Orders"
                icon={LuShoppingBag}
                active={activeTab === 'orders'}
                onClick={() => setActiveTab('orders')}
              />
              <NavItem
                label="Inbox"
                icon={LuInbox}
                active={activeTab === 'inbox'}
                onClick={() => setActiveTab('inbox')}
              />
              <NavItem
                label="Notifications"
                icon={LuBell}
                active={activeTab === 'notifications'}
                onClick={() => setActiveTab('notifications')}
              />
              <NavItem
                label="Shipping Address"
                icon={LuMapPin}
                active={activeTab === 'shipping'}
                onClick={() => setActiveTab('shipping')}
              />
              <NavItem
                label="Change Password"
                icon={LuLock}
                active={activeTab === 'changePassword'}
                onClick={() => setActiveTab('changePassword')}
              />
              <NavItem
                label="Logout"
                icon={LuLogOut}
                active={activeTab === 'logout'}
                onClick={logOutHandler}
                danger
              />
            </nav>
          </div>

          {/* Main content area */}
          <div className="bg-white self-start p-6 rounded-md shadow-md border border-gray-100 w-full md:w-[55%]">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 capitalize">
              {activeTab}
            </h2>

            {activeTab === 'profile' && currentUser && (
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <Image
                    src={currentUser?.avatar?.fileUrl || '/default-avatar.jpg'}
                    alt="User Avatar"
                    width={60}
                    height={60}
                    className="size-[60px] object-cover rounded-full border border-gray-200"
                  />

                  <Button variant="outline" size="xs">
                    Change photo
                  </Button>
                </div>

                <p>
                  <span className="font-semibold">Name: </span>
                  {currentUser?.name || 'User'}
                </p>
                <p>
                  <span className="font-semibold">Email: </span>
                  {currentUser?.email || 'User'}
                </p>
                <p>
                  <span className="font-semibold">Joined: </span>
                  {currentUser?.createdAt
                    ? new Date(currentUser.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Earned Points: </span>
                  {0}
                </p>
              </div>
            )}

            {activeTab === 'shipping' && currentUser && (
              <ShippingAddressSection />
            )}
          </div>

          <div className="w-full md:w-1/4 space-y-4">
            <QuickActionCard
              icon={LuGift}
              title="Referral Program"
              description="Invite friends and earn rewards"
            />
            <QuickActionCard
              icon={LuBadgeCheck}
              title="Your badges"
              description="View your achievements and milestones"
            />
            <QuickActionCard
              icon={LuSettings}
              title="Account Settings"
              description="Manage your account preferences and settings"
            />
            <QuickActionCard
              icon={LuReceipt}
              title="Billing History"
              description="Review your past purchases and invoices"
            />
            <QuickActionCard
              icon={LuPhoneCall}
              title="Contact Support"
              description="Get help and support for your account"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

const NavItem = (props: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  danger?: boolean;
  onClick: () => void;
}) => {
  const { label, icon: Icon, active, danger, onClick } = props;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
        active
          ? 'bg-blue-100 text-blue-600'
          : danger
            ? 'hover:bg-red-50 text-red-600'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-800'
      }`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
};
