import { Button } from '@/components/ui/button';
import { TPaymentSession } from '@e-shop-app/packages/types';
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useState } from 'react';
import { LuCircleCheck, LuCircleX } from 'react-icons/lu';

type Props = {
  clientSecret: string;
  sessionData: TPaymentSession;
};

export const CheckoutForm = (props: Props) => {
  const { sessionData, clientSecret } = props;
  const { cart, coupon, totalAmount, sessionId } = sessionData;
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'failed' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage(null);
    setStatus(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?sessionId=${sessionId}`,
      },
    });

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
      setStatus('failed');
    } else {
      setStatus('success');
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 my-10">
      <form
        className="bg-white w-full max-w-lg p-8 rounded-md shadow space-y-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold text-center mb-2">
          Secure Payment checkout
        </h2>

        <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-700 space-y-2">
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm pb-1">
              <span>
                {item.quantity} * {item.title}
              </span>
              <span>
                ${((item.quantity || 0) * Number(item.salePrice)).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="flex justify-between font-semibold pt-2 border-t border-t-gray-300 mt-2">
            {!!coupon && coupon?.discountAmount !== 0 && (
              <>
                <span>Discount</span>
                <span className="text-green-600">
                  -${Number(coupon.discountAmount).toFixed(2)}
                </span>
              </>
            )}
          </div>

          <div className="flex justify-between font-semibold mt-2">
            <span>Total</span>
            <span>
              ${Number(totalAmount - (coupon?.discountAmount || 0)).toFixed(2)}
            </span>
          </div>
        </div>

        <PaymentElement />

        <Button
          type="submit"
          disabled={!stripe || loading}
          isLoading={loading}
          className="w-full"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </Button>

        {errorMessage ||
          (status === 'failed' && (
            <div className="text-red-600 flex items-center gap-2 text-sm justify-center text-center">
              <LuCircleX className="size-5" />
              {errorMessage || 'Payment Failed. Please try again.'}
            </div>
          ))}

        {status === 'success' && (
          <div className="text-green-600 flex items-center gap-2 text-sm justify-center text-center">
            <LuCircleCheck className="size-5" />
            Payment Successful!
          </div>
        )}
      </form>
    </div>
  );
};
