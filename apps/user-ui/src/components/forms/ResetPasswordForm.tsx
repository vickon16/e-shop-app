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

import { Button } from '@/components/ui/button';
import { Routes } from '@/configs/routes';
import {
  newPasswordSchema,
  TNewPasswordSchema,
} from '@e-shop-app/packages/zod-schemas';
import Link from 'next/link';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';

type Props = {
  onSetNewPassword: (newPassword: string) => void;
};

const ResetPasswordForm = (props: Props) => {
  const { onSetNewPassword } = props;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<TNewPasswordSchema>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: TNewPasswordSchema) {
    onSetNewPassword(data.password);
  }

  return (
    <div className="w-full py-10 min-h-[85vh] bg-accent">
      <h1 className="text-4xl font-poppins font-semibold text-foreground text-center">
        Reset Password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-muted-foreground">
        Home . Reset Password
      </p>

      <div className="w-full flex justify-center">
        <div className="w-full max-w-130 p-8 bg-background shadow rounded-lg">
          <h3 className="text-2xl font-semibold text-primary text-center mb-2">
            Create a New Password
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
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-3"
            >
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

              {/* Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Confirm Password <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="flex items-center gap-2 relative">
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
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

              <Button type="submit" size="lg" className="w-full my-8!">
                Set New Password
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
