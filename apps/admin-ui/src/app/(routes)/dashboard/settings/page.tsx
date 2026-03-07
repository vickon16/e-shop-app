'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import CustomModal from '@e-shop-app/user-ui/src/components/common/CustomModal';
import Link from 'next/link';
import { Routes } from '@/configs/routes';
import { LuChevronRight, LuLoader, LuRefreshCcw } from 'react-icons/lu';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAdminOptions } from '@/actions/queries/base-queries';
import { useDeleteRestoreShopMutation } from '@/actions/mutations/product.mutation';
import { toast } from 'sonner';
import { GET_ADMIN } from '@/actions/base-action-constants';
import { errorToast } from '@/lib/utils';

const SellerSettingsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: admin, isLoading: isAdminLoading } =
    useQuery(getAdminOptions());
  const { mutate: deleteRestoreShop, isPending } =
    useDeleteRestoreShopMutation();

  const handleShopAction = (type: 'delete' | 'restore') => {
    deleteRestoreShop(type, {
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: [GET_ADMIN] });
        setIsModalOpen(false);
      },
      onError: (error: any) => {
        errorToast(error, 'Failed to delete shop');
      },
    });
  };

  if (isAdminLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <LuLoader className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-screen dark p-8">
        {/* Header Title */}
        <div className="flex justify-between w-full items-center mb-1 gap-3">
          <h2 className="text-2xl font-semibold">Settings</h2>
        </div>

        {/* BreadCrumbs */}
        <div className="flex items-center mb-8">
          <Link
            href={Routes.dashboard.base}
            className="text-[#80Deea] cursor-pointer"
          >
            Dashboard
          </Link>
          <LuChevronRight size={20} className="opacity-[.8]" />
          <span>Settings</span>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            {/* {!isDeleted ? (
              <Card className="border-red-200/50 dark:border-red-900/50 shadow-sm max-w-5xl">
                <CardHeader className="bg-red-50/50 dark:bg-red-900/10 rounded-t-lg border-b border-red-100 dark:border-red-900/30">
                  <CardTitle className="text-red-700 dark:text-red-400">
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions for your shop account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        Delete Shop Account
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-[600px]">
                        Deleting your shop is a permanent action. However, after
                        initiating deletion, you will have a 30-day grace period
                        to restore your shop before all data is permanently
                        removed.
                      </p>
                    </div>

                    <CustomModal
                      open={isModalOpen}
                      onOpenChange={setIsModalOpen}
                      triggerChildren={
                        <Button
                          variant="destructive"
                          className="shrink-0 h-10 px-6"
                        >
                          Delete Shop
                        </Button>
                      }
                    >
                      <div className="p-6 flex flex-col gap-4">
                        <div className="flex flex-col gap-2 mb-2">
                          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                            Are you sure you want to delete your shop?
                          </h2>
                          <p className="text-sm text-foreground">
                            This action will schedule your shop for permanent
                            deletion. Your shop will be hidden from customers
                            immediately.
                          </p>
                          <p className="text-sm font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 p-3 rounded-md mt-2 border border-amber-200 dark:border-amber-800/50">
                            Note: You can restore your shop within 30 days of
                            initiating deletion. After 30 days, all data will be
                            permanently deleted and cannot be recovered.
                          </p>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            disabled={isPending}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleShopAction('delete')}
                            disabled={isPending}
                          >
                            {isPending && (
                              <LuLoader className="mr-2 animate-spin" />
                            )}
                            Yes, Delete My Shop
                          </Button>
                        </div>
                      </div>
                    </CustomModal>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-amber-200/50 dark:border-amber-900/50 shadow-sm max-w-5xl">
                <CardHeader className="bg-amber-50/50 dark:bg-amber-900/10 rounded-t-lg border-b border-amber-100 dark:border-amber-900/30">
                  <CardTitle className="text-amber-700 dark:text-amber-400">
                    Shop Deletion Scheduled
                  </CardTitle>
                  <CardDescription>
                    Your shop is currently scheduled for deletion.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        Restore Shop Account
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-[600px]">
                        Restoring will make your shop visible to customers
                        again. You can restore your shop before the 30-day grace
                        period ends.
                      </p>
                    </div>
                    <Button
                      variant="default"
                      className="shrink-0 h-10 px-6"
                      onClick={() => handleShopAction('restore')}
                      disabled={isPending}
                    >
                      {isPending && <LuLoader className="mr-2 animate-spin" />}
                      {!isPending && <LuRefreshCcw className="mr-2" />}
                      Restore Shop
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )} */}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default SellerSettingsPage;
