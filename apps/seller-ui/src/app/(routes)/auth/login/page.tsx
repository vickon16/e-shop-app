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

import { Button, buttonVariants } from '@/components/ui/button';
import { Routes } from '@/configs/routes';
import { loginSchema, TLoginSchema } from '@e-shop-app/packages/zod-schemas';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { Checkbox } from '@/components/ui/checkbox';
import { useBaseMutation } from '@/actions/mutations/base.mutation';
import { errorToast } from '@/lib/utils';
import { toast } from 'sonner';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<TLoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const loginMutation = useBaseMutation<TLoginSchema, any>({
    endpoint: '/auth/login?accountType=seller',
  });

  async function onSubmit(data: TLoginSchema) {
    startTransition(async () => {
      try {
        await loginMutation.mutateAsync(data);
        toast.success('Login Successful');
        router.push(Routes.dashboard.base);
      } catch (error) {
        errorToast(error, 'Failed to Login. Please try again');
      }
    });
  }

  const isLoading = isPending || loginMutation.isPending;

  return (
    <div className="w-full py-10 min-h-screen bg-accent">
      <h1 className="text-4xl font-poppins font-semibold text-foreground text-center">
        Login
      </h1>
      <p className="text-center text-lg font-medium py-3 text-muted-foreground">
        Home . Login
      </p>

      <div className="w-full flex justify-center">
        <div className="w-full max-w-130 p-8 bg-background shadow rounded-lg">
          <h3 className="text-2xl font-semibold text-primary text-center mb-2">
            Login to E-Shop
          </h3>

          <p className="text-center text-gray-500 mb-4 text-sm">
            Don't have an account?{' '}
            <Link
              href={Routes.auth.signup}
              className="text-blue-500 hover:underline"
            >
              Register here
            </Link>
          </p>

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

              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-2"
                        />
                      </FormControl>

                      <FormLabel className="m-0!">Remember me</FormLabel>
                    </FormItem>
                  )}
                />

                <Link
                  href={Routes.auth.forgotPassword}
                  className={buttonVariants({
                    variant: 'link',
                  })}
                >
                  Forget Password?
                </Link>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                size="lg"
                className="w-full my-8!"
              >
                Sign In
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
