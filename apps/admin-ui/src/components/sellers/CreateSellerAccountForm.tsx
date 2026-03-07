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
import OTPForm from '@/components/common/OTPForm';
import { Button } from '@/components/ui/button';
import { Routes } from '@/configs/routes';
import { cn, errorToast } from '@/lib/utils';
import {
  createSellerSchema,
  TCreateSellerSchema,
  TVerifySellerSchema,
} from '@e-shop-app/packages/zod-schemas';
import { countryList } from '@e-shop-app/packages/constants';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TSeller } from '@e-shop-app/packages/types';

type Props = {
  onSellerCreated: (data: TSeller) => void;
};

const CreateSellerAccountForm = (props: Props) => {
  const { onSellerCreated } = props;
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [sellerData, setSellerData] = useState<TCreateSellerSchema>();

  const form = useForm<TCreateSellerSchema>({
    resolver: zodResolver(createSellerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      country: '',
    },
  });

  const signUpMutation = useBaseMutation<TCreateSellerSchema, any>({
    endpoint: '/auth/seller-registration',
  });
  const verifySellerMutation = useBaseMutation<TVerifySellerSchema, TSeller>({
    endpoint: '/auth/verify-seller',
  });

  async function onSubmit(data: TCreateSellerSchema) {
    startTransition(async () => {
      try {
        await signUpMutation.mutateAsync(data);

        setSellerData(data);
        setShowOtpForm(true);
      } catch (error) {
        errorToast(error, 'Failed to Sign up. Please try again');
      }
    });
  }

  const isLoadingRegister = isPending || signUpMutation.isPending;
  const isLoadingVerify = isPending || verifySellerMutation.isPending;

  const handleVerifyOtp = async (otp: string) => {
    if (!sellerData) return;

    startTransition(async () => {
      try {
        const response = await verifySellerMutation.mutateAsync({
          ...sellerData,
          otp,
        });

        if (response.success && response.data) {
          onSellerCreated(response.data);
        }
      } catch (error) {
        errorToast(error, 'Failed to Sign up. Please try again');
      }
    });
  };

  return (
    <>
      {showOtpForm && sellerData ? (
        <OTPForm
          userData={sellerData}
          verifyOtp={handleVerifyOtp}
          isVerifying={isLoadingVerify}
        />
      ) : (
        <>
          <h3 className="text-2xl font-semibold text-primary text-center mb-2">
            Create an E-Shop Seller Account
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

              {/* Business Phone number */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Phone Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g: +1234567890"
                        className="w-full"
                        type="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Country */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Country <span className="text-red-500">*</span>
                    </FormLabel>

                    <Select {...field} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className={cn('w-full')}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className="max-h-70">
                        {countryList.map((item) => (
                          <SelectItem key={item.code} value={item.code}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
    </>
  );
};

export default CreateSellerAccountForm;
