'use client';

import CreateSellerAccountForm from '@/components/sellers/CreateSellerAccountForm';
import CreateShop from '@/components/sellers/shops/CreateShop';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const Steps = {
  CREATE_ACCOUNT: 1,
  SETUP_SHOP: 2,
  CONNECT_BANK: 3,
} as const;

type TSteps = (typeof Steps)[keyof typeof Steps];

const SignUpPage = () => {
  const [sellerId, setSellerId] = useState<string>();
  const [activeStep, setActiveStep] = useState<TSteps>(Steps.CREATE_ACCOUNT);
  const router = useRouter();

  return (
    <div className="w-full flex flex-col items-center pt-10 min-h-screen">
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
              console.log({ data });
              setSellerId(data.id);
              setActiveStep(Steps.SETUP_SHOP);
            }}
          />
        )}

        {activeStep === Steps.SETUP_SHOP && sellerId && (
          <CreateShop
            sellerId={sellerId}
            onShopCreated={(data) => {
              console.log({ data });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
