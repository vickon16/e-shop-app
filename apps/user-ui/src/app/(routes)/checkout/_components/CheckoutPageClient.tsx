'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { TCreatePaymentSessionSchema } from '@e-shop-app/packages/zod-schemas';
import { useRouter } from 'next/navigation';
import { TPaymentSession } from '@e-shop-app/packages/types';

type Props = {
  sessionData: TPaymentSession;
};

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export const CheckoutPageClient = (props: Props) => {
  const { sessionData } = props;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<
    TCreatePaymentSessionSchema['cart']
  >([]);
  const [coupon, setCoupon] =
    useState<TCreatePaymentSessionSchema['coupon']>(null);
  const router = useRouter();

  return <div>CheckoutPageClient</div>;
};
