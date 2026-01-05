'use client';

import { useBaseMutation } from '@/actions/mutations/base.mutation';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import useCountDownTimer from '@/hooks/use-countdown-timer';
import { cn, errorToast } from '@/lib/utils';
import {
  otpSchema,
  TCreateUserSchema,
  TEmailSchema,
} from '@e-shop-app/packages/zod-schemas';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useEffect, useState, useTransition } from 'react';
import { LuDot } from 'react-icons/lu';
import { toast } from 'sonner';

type Props = {
  userData: Pick<TCreateUserSchema, 'name' | 'email'>;
  verifyOtp: (otp: string) => Promise<void>;
  isVerifying: boolean;
};

const slotClass = 'size-10! sm:size-14! text-xl border-primary/50 border-y-2';
const TIMER_DURATION = 60; // in seconds

const OTPForm = (props: Props) => {
  const { userData, verifyOtp, isVerifying } = props;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { countdown, setCountDown } = useCountDownTimer();
  const [isPending, startTransition] = useTransition();

  const resendOtpMutation = useBaseMutation<TEmailSchema, any>({
    endpoint: `/auth/resend-otp?withUserName=${userData.name}`,
  });

  const handleVerify = async () => {
    setError('');
    const validator = otpSchema.shape.otp.safeParse(code);
    if (!validator.success) {
      setError('Invalid OTP');
      toast.error('Invalid OTP', {
        description: 'Please enter a valid OTP.',
      });
      return;
    }

    verifyOtp(code);
  };

  const handleResendEmailOTP = () => {
    setCountDown(TIMER_DURATION);

    startTransition(async () => {
      try {
        const response = await resendOtpMutation.mutateAsync({
          email: userData.email,
        });

        toast.success(response.message, {
          description: 'OTP has been resent to your email address.',
        });
      } catch (error) {
        errorToast(error, 'Failed to resend OTP. Please try again');
      }
    });
  };

  const isLoadingResend = isPending || resendOtpMutation.isPending;

  // Initialize countdown on component mount
  useEffect(() => {
    setCountDown(TIMER_DURATION);
  }, []);

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-xl font-bold text-primary">Verify OTP</h1>
        <p className="text-muted-foreground max-w-[80%] text-sm mx-auto">
          The OTP has been sent to your email address. <br />
          <span className="text-primary text-sm wrap-break-word font-semibold">
            {userData.email}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-y-8 w-full">
        <div className="w-full flex items-center justify-center flex-col gap-y-4">
          <h2 className="text-center font-semibold text-sm">
            Enter your OTP code below
          </h2>
          <InputOTP
            maxLength={4}
            pattern={REGEXP_ONLY_DIGITS}
            value={code}
            onChange={(value) => setCode(value)}
            disabled={isVerifying}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className={cn(slotClass)} />
              <InputOTPSlot index={1} className={cn(slotClass)} />
            </InputOTPGroup>
            <div role="separator" className="text-muted-foreground">
              <LuDot className="size-5!" />
            </div>
            <InputOTPGroup>
              <InputOTPSlot index={2} className={cn(slotClass)} />
              <InputOTPSlot index={3} className={cn(slotClass)} />
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <p className="text-red-500 font-semibold text-center">{error}</p>
          )}
        </div>

        <div className="w-full flex flex-col items-center justify-center">
          <Button
            variant="link"
            className="text-foreground"
            type="button"
            onClick={handleResendEmailOTP}
            isLoading={isVerifying || isLoadingResend || countdown !== 0}
            disabled={countdown !== 0}
          >
            Resend Code {countdown !== 0 && `(${countdown}s)`}
          </Button>
          <Button
            size="lg"
            className="w-full"
            type="button"
            onClick={handleVerify}
            isLoading={isVerifying || isLoadingResend}
          >
            Verify
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OTPForm;
