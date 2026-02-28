'use client';

import { useBaseMutation } from '@/actions/mutations/base.mutation';
import StripeLogo from '@/assets/stripe-log.png';
import CreateSellerAccountForm from '@/components/sellers/CreateSellerAccountForm';
import CreateShop from '@/components/sellers/shops/CreateShop';
import { Button } from '@/components/ui/button';
import { Routes } from '@/configs/routes';
import { errorToast } from '@/lib/utils';
import { TCreateStripeConnectLinkSchema } from '@e-shop-app/packages/zod-schemas';
import Image from 'next/image';
import { useState, useTransition } from 'react';

const Steps = {
  CREATE_ACCOUNT: 1,
  SETUP_SHOP: 2,
  CONNECT_BANK: 3,
} as const;

type TSteps = (typeof Steps)[keyof typeof Steps];

const SignUpPage = () => {
  const [sellerId, setSellerId] = useState<string>();
  const [activeStep, setActiveStep] = useState<TSteps>(Steps.CREATE_ACCOUNT);
  const [isPending, startTransition] = useTransition();

  const createShopMutation = useBaseMutation<
    TCreateStripeConnectLinkSchema,
    { url: string }
  >({
    endpoint: '/auth/create-stripe-connect-link',
  });

  async function connectStripe() {
    if (!sellerId) return;

    startTransition(async () => {
      try {
        const response = await createShopMutation.mutateAsync({
          sellerId,
          refreshUrl: `${Routes.sellerAppUrl}${Routes.auth.signup}`,
          returnUrl: Routes.sellerSuccessLink,
        });

        if (response.success && response.data.url) {
          window.location.href = response.data.url;
        }
      } catch (error) {
        errorToast(error, 'Failed to Sign up. Please try again');
      }
    });
  }

  const isLoadingCreateLink = isPending || createShopMutation.isPending;

  return (
    <div className="w-full flex flex-col items-center pt-10 min-h-screen dark">
      {/* Stepper */}

      <div className="relative flex items-center justify-between md:w-[40%] mb-8">
        <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10" />

        {Object.values(Steps).map((step) => (
          <div key={step}>
            <div
              className={`size-10 rounded-full flex items-center justify-center text-white font-bold ${
                step <= activeStep ? 'bg-color1' : 'bg-gray-300'
              }`}
            >
              {step}
            </div>
            <span className="text-sm">
              {step === Steps.CREATE_ACCOUNT
                ? 'Create Account'
                : step === Steps.SETUP_SHOP
                  ? 'Setup Shop'
                  : 'Connect Bank'}
            </span>
          </div>
        ))}
      </div>

      {/* Steps content */}

      <div className="w-full max-w-125 p-8 bg-background shadow rounded-lg">
        {activeStep === Steps.CREATE_ACCOUNT && (
          <CreateSellerAccountForm
            onSellerCreated={(data) => {
              setSellerId(data.id);
              setActiveStep(Steps.SETUP_SHOP);
            }}
          />
        )}

        {activeStep === Steps.SETUP_SHOP && sellerId && (
          <CreateShop
            sellerId={sellerId}
            onShopCreated={(data) => {
              setActiveStep(Steps.CONNECT_BANK);
            }}
          />
        )}

        {activeStep === Steps.CONNECT_BANK && sellerId && (
          <div className="text-center">
            <h3 className="text-2xl font-semibold">Withdraw Method</h3>

            <br />

            <Button
              className="w-full"
              onClick={connectStripe}
              isLoading={isLoadingCreateLink}
            >
              Connect With Stripe
              <Image
                src={StripeLogo}
                width={30}
                height={30}
                alt="Stripe Logo"
                className="size-[30px] object-contain ml-2 inline"
              />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
