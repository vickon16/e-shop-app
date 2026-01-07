'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useBaseMutation } from '@/actions/mutations/base.mutation';
import { Button } from '@/components/ui/button';
import { Routes } from '@/configs/routes';
import { errorToast } from '@/lib/utils';
import {
  emailSchema,
  TEmailSchema,
  TResetPasswordSchema,
} from '@e-shop-app/packages/zod-schemas';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import OTPForm from '@/components/common/OTPForm';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';

const Steps = {
  EMAIL: 'EMAIL',
  NEW_PASSWORD: 'NEW_PASSWORD',
  OTP: 'OTP',
} as const;

type TSteps = (typeof Steps)[keyof typeof Steps];

const ForgotPassword = () => {
  const [step, setStep] = useState<TSteps>(Steps.EMAIL);
  const [isPending, startTransition] = useTransition();
  const [newPassword, setNewPassword] = useState<string>('');
  const router = useRouter();

  const form = useForm<TEmailSchema>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const userEmail = form.getValues('email');

  const forgotPasswordMutation = useBaseMutation<TEmailSchema, any>({
    endpoint: '/auth/forgot-password',
  });

  async function onSubmitForgotPassword(data: TEmailSchema) {
    startTransition(async () => {
      try {
        await forgotPasswordMutation.mutateAsync(data);
        toast.success('OTP sent to your email');
        setStep(Steps.NEW_PASSWORD);
      } catch (error) {
        errorToast(
          error,
          'Failed to send forgot password request. Please try again',
        );
      }
    });
  }

  const resetPasswordMutation = useBaseMutation<TResetPasswordSchema, any>({
    endpoint: '/auth/reset-password',
  });

  const handleResetPassword = async (otp: string) => {
    if (!userEmail || !newPassword) {
      setStep(Steps.EMAIL);
      return;
    }

    startTransition(async () => {
      try {
        const response = await resetPasswordMutation.mutateAsync({
          newPassword,
          email: userEmail,
          otp,
        });

        if (response.success) {
          // Clear cookies.

          router.push(Routes.auth.login);
        }
      } catch (error) {
        errorToast(error, 'Failed to verify OTP. Please try again');
      }
    });
  };

  const isLoadingForgotPassword = isPending || forgotPasswordMutation.isPending;
  const isLoadingResetPassword = isPending || resetPasswordMutation.isPending;

  return (
    <div className="w-full py-10 min-h-[85vh] bg-accent">
      {step === Steps.EMAIL && (
        <>
          <h1 className="text-4xl font-poppins font-semibold text-foreground text-center">
            ForgotPassword
          </h1>
          <p className="text-center text-lg font-medium py-3 text-muted-foreground">
            Home . ForgotPassword
          </p>

          <div className="w-full flex justify-center">
            <div className="w-full max-w-130 p-8 bg-background shadow rounded-lg">
              <h3 className="text-2xl font-semibold text-primary text-center mb-2">
                Forgot Password?
              </h3>

              <p className="text-center text-gray-500 mb-4 text-sm">
                Back to{' '}
                <Link
                  href={Routes.auth.login}
                  className="text-blue-500 hover:underline"
                >
                  Login
                </Link>
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitForgotPassword)}
                  className="w-full space-y-3"
                >
                  {/* Business Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Email Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g: user@example.com"
                            className="w-full"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    isLoading={isLoadingForgotPassword}
                    size="lg"
                    className="w-full my-8!"
                  >
                    Submit
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </>
      )}

      {step === Steps.NEW_PASSWORD && (
        <ResetPasswordForm
          onSetNewPassword={(newPassword) => {
            setNewPassword(newPassword);
            setStep(Steps.OTP);
          }}
        />
      )}

      {step === Steps.OTP && userEmail && newPassword && (
        <div className="w-full py-10 min-h-[85vh] bg-accent">
          <h1 className="text-4xl font-poppins font-semibold text-foreground text-center">
            Reset Password
          </h1>
          <p className="text-center text-lg font-medium py-3 text-muted-foreground">
            Home . Reset Password
          </p>

          <div className="w-full flex justify-center">
            <div className="w-full max-w-130 p-8 bg-background shadow rounded-lg">
              <OTPForm
                userData={{ email: userEmail }}
                verifyOtp={handleResetPassword}
                isVerifying={isLoadingResetPassword}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
