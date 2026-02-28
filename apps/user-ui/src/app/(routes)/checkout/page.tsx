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
import { TCreatePaymentIntentSchema } from '@e-shop-app/packages/zod-schemas';

type Props = {
  searchParams: Promise<{ sessionId: string }>;
};

const verifySessionId = async (cookies: string, sessionId: string) => {
  try {
    const response = await axiosInstance.get<
      TBaseServerResponse<TPaymentSession>
    >(`/order/verify-payment-session/${sessionId}`, {
      headers: {
        Cookie: cookies,
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

const createPaymentIntent = async (
  cookies: string,
  data: TCreatePaymentIntentSchema,
) => {
  try {
    const response = await axiosInstance.post<
      TBaseServerResponse<{ clientSecret: string }>
    >(`/order/create-payment-intent`, data, {
      headers: {
        Cookie: cookies,
      },
    });

    if (!response.data.success || !response.data.data) {
      throw new Error('Failed to create payment intent');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return null;
  }
};

const CheckoutPage = async (props: Props) => {
  const searchParams = await props.searchParams;
  const sessionId = searchParams?.sessionId;
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();

  if (!sessionId) {
    return redirect(Routes.cart);
  }

  // verify session Id
  const sessionData = await verifySessionId(cookieString, sessionId);
  if (!sessionData) {
    return redirect(Routes.cart);
  }

  const { coupon, totalAmount, sellersData } = sessionData;

  // create payment intent
  const paymentIntent = await createPaymentIntent(cookieString, {
    amount: coupon?.discountAmount
      ? totalAmount - coupon?.discountAmount
      : totalAmount,
    sellerStripeAccountId: sellersData[0]?.stripeAccountId || '', // Assuming single seller for simplicity
    sessionId,
  });

  if (!paymentIntent) {
    return redirect(Routes.cart);
  }

  return (
    <CheckoutPageClient
      sessionData={sessionData}
      clientSecret={paymentIntent.clientSecret}
    />
  );
};

export default CheckoutPage;
