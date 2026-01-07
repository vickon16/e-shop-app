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
import { GoogleButton } from '@/components/common/GoogleButton';
import OTPForm from '@/components/common/OTPForm';
import { Button } from '@/components/ui/button';
import { Routes } from '@/configs/routes';
import { errorToast } from '@/lib/utils';
import {
  createUserSchema,
  TCreateUserSchema,
  TVerifyUserSchema,
} from '@e-shop-app/packages/zod-schemas';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [userData, setUserData] = useState<TCreateUserSchema>();
  const router = useRouter();

  const form = useForm<TCreateUserSchema>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const signUpMutation = useBaseMutation<TCreateUserSchema, any>({
    endpoint: '/auth/user-registration',
  });
  const verifyUserMutation = useBaseMutation<TVerifyUserSchema, any>({
    endpoint: '/auth/verify-user',
  });

  async function onSubmit(data: TCreateUserSchema) {
    startTransition(async () => {
      try {
        await signUpMutation.mutateAsync(data);

        setUserData(data);
        setShowOtpForm(true);
      } catch (error) {
        errorToast(error, 'Failed to Sign up. Please try again');
      }
    });
  }

  const isLoadingRegister = isPending || signUpMutation.isPending;
  const isLoadingVerify = isPending || verifyUserMutation.isPending;

  const handleVerifyOtp = async (otp: string) => {
    if (!userData) return;

    startTransition(async () => {
      try {
        const response = await verifyUserMutation.mutateAsync({
          ...userData,
          otp,
        });

        if (response.success) {
          router.push(Routes.home);
        }
      } catch (error) {
        errorToast(error, 'Failed to Sign up. Please try again');
      }
    });
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-accent">
      <h1 className="text-4xl font-poppins font-semibold text-foreground text-center">
        Sign Up
      </h1>
      <p className="text-center text-lg font-medium py-3 text-muted-foreground">
        Home . Sign Up
      </p>

      <div className="w-full flex justify-center">
        <div className="w-full max-w-130 p-8 bg-background shadow rounded-lg">
          {showOtpForm && userData ? (
            <OTPForm
              userData={userData}
              verifyOtp={handleVerifyOtp}
              isVerifying={isLoadingVerify}
            />
          ) : (
            <>
              <h3 className="text-2xl font-semibold text-primary text-center mb-2">
                Create an E-Shop Account
              </h3>

              <p className="text-center text-gray-500 mb-4 text-sm">
                Already have an account?{' '}
                <Link
                  href={Routes.auth.login}
                  className="text-blue-500 hover:underline"
                >
                  Login here
                </Link>
              </p>

              <GoogleButton />

              <div className="flex items-center my-5 text-gray-400 text-sm">
                <div className="flex-1 border-t border-gray-300" />
                <span className="mx-3">Or Sign in with Email</span>
                <div className="flex-1 border-t border-gray-300" />
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-full space-y-3"
                >
                  {/* Business Email */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Full Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g: John Doe"
                            className="w-full"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Password <span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="flex items-center gap-2 relative">
                          <FormControl>
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              className="w-full"
                              {...field}
                            />
                          </FormControl>
                          <button
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <FaEyeSlash className="size-4 text-slate-400" />
                            ) : (
                              <FaEye className="size-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    isLoading={isLoadingRegister}
                    size="lg"
                    className="w-full my-8!"
                  >
                    Create an Account
                  </Button>
                </form>
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
