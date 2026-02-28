'use client';

import { buttonVariants } from '@/components/ui/button';
import { Routes } from '@/configs/routes';
import { useAppStore } from '@/store';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { LuCircleCheck, LuTruck } from 'react-icons/lu';

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    useAppStore.setState({ cart: [] }); // Clear the cart after successful payment

    // confetti burst
    confetti({
      particleCount: 150,
      spread: 150,
      origin: { y: 0.5 },
    });
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg max-w-xl px-5 py-8 flex items-center justify-center text-center flex-col">
        <div className="text-green-500 mb-4">
          <LuCircleCheck className="size-16 mx-auto" />
        </div>

        <h2 className="text-2xl font-semibold text-green-800 mb-2">
          Payment Successful!
        </h2>

        <p className="text-sm text-gray-600 mb-8 max-w-[90%] mx-auto">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        <Link
          className={buttonVariants({ className: 'w-full ' })}
          href={`${Routes.profile}?active=My+Orders`}
        >
          <LuTruck className="size-5" />
          Track Order
        </Link>

        <div className="mt-8 text-xs text-gray-400">
          Payment Session ID: <span className="font-mono">{sessionId}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
