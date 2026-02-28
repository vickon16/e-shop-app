'use client';

import { TPaymentSession } from '@e-shop-app/packages/types';
import { Appearance, loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from '@/components/common/checkout/CheckoutForm';

type Props = {
  sessionData: TPaymentSession;
  clientSecret: string;
};

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export const CheckoutPageClient = (props: Props) => {
  const { sessionData, clientSecret } = props;

  const appearance: Appearance = { theme: 'stripe' };

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <CheckoutForm clientSecret={clientSecret} sessionData={sessionData} />
    </Elements>
  );
};
