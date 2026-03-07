'use client';

import { useBaseMutation } from '@/actions/mutations/base.mutation';
import CustomFormField from '@/components/common/CustomFomField';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Routes } from '@/configs/routes';
import { errorToast } from '@/lib/utils';
import {
  changePasswordSchema,
  TChangePasswordSchema,
} from '@e-shop-app/packages/zod-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const ChangePasswordSection = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const changePasswordMutation = useBaseMutation<TChangePasswordSchema, null>({
    endpoint: '/auth/change-password',
    defaultMessage: 'Failed to change password',
  });

  const form = useForm<TChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: TChangePasswordSchema) {
    startTransition(async () => {
      try {
        const response = await changePasswordMutation.mutateAsync(data);

        if (!response.success) {
          toast.error(response.message || 'Failed to change password');
          return;
        }

        toast.success('Password changed successfully');
        form.reset();
        router.push(Routes.auth.login);
      } catch (error) {
        errorToast(error, 'Failed to change password. Please try again');
      }
    });
  }

  const isLoading = isPending || changePasswordMutation.isPending;

  return (
    <div className="max-w-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CustomFormField
            control={form.control}
            name="oldPassword"
            label="Old Password"
            type="password"
            placeHolder="Enter your old password"
            isRequired
          />

          <CustomFormField
            control={form.control}
            name="newPassword"
            label="New Password"
            type="password"
            placeHolder="Enter your new password"
            isRequired
          />

          <CustomFormField
            control={form.control}
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            placeHolder="Confirm your new password"
            isRequired
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Change Password
          </Button>
        </form>
      </Form>
    </div>
  );
};
