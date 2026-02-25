import React from 'react';
import { CheckoutPageClient } from './_components/CheckoutPageClient';
import { axiosInstance } from '@/lib/axios';
import { redirect } from 'next/navigation';
import { Routes } from '@/configs/routes';
import {
  TBaseServerResponse,
  TPaymentSession,
} from '@e-shop-app/packages/types';
import { cookies } from 'next/headers';

type Props = {
  searchParams: Promise<{ sessionId: string }>;
};

const verifySessionId = async (sessionId: string) => {
  const cookieStore = await cookies();
  try {
    const response = await axiosInstance.get<
      TBaseServerResponse<TPaymentSession>
    >(`/order/verify-payment-session/${sessionId}`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    if (!response.data.success || !response.data.data) {
      throw new Error('Failed to verify session ID');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error verifying session ID:', error);
    return null;
  }
};

const CheckoutPage = async (props: Props) => {
  const searchParams = await props.searchParams;
  const sessionId = searchParams?.sessionId;

  if (!sessionId) {
    return redirect(Routes.cart);
  }

  // verify session Id
  const sessionData = await verifySessionId(sessionId);
  if (!sessionData) {
    return redirect(Routes.cart);
  }

  return <CheckoutPageClient sessionData={sessionData} />;
};

export default CheckoutPage;
