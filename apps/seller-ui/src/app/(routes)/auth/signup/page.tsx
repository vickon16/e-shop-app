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
  TVerifyUserSchema,
} from '@e-shop-app/packages/zod-schemas';
import { countryList } from '@e-shop-app/packages/constants';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [userData, setUserData] = useState<TCreateSellerSchema>();
  const [activeStep, setActiveStep] = useState(1);
  const router = useRouter();

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
  const verifyUserMutation = useBaseMutation<TVerifyUserSchema, any>({
    endpoint: '/auth/verify-user',
  });

  async function onSubmit(data: TCreateSellerSchema) {
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
    <div className="w-full flex flex-col items-center pt-10 min-h-screen">
      {/* Stepper */}

      <div className="relative flex items-center justify-between md:w-[40%] mb-8">
        <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10" />

        {[1, 2, 3].map((step) => (
          <div key={step}>
            <div
              className={`size-10 rounded-full flex items-center justify-center text-white font-bold ${
                step <= activeStep ? 'bg-color1' : 'bg-gray-300'
              }`}
            >
              {step}
            </div>
            <span className="text-sm">
              {step === 1
                ? 'Create Account'
                : step === 2
                  ? 'Setup Shop'
                  : 'Connect Bank'}
            </span>
          </div>
        ))}
      </div>

      {/* Steps content */}

      <div className="w-full max-w-125 p-8 bg-background shadow rounded-lg">
        {activeStep === 1 && (
          <>
            {showOtpForm && userData ? (
              <OTPForm
                userData={userData}
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
                            Email Address{' '}
                            <span className="text-red-500">*</span>
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
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
