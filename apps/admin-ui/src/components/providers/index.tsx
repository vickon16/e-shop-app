'use client';

import { type PropsWithChildren } from 'react';
import ReactQueryProvider from './ReactQueryProvider';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from '@/components/ui/sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <NuqsAdapter>
      <ReactQueryProvider>
        <NextTopLoader color="hsl(var(--primary))" showSpinner={false} />
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            duration: 5000,
          }}
        />
        {children}
      </ReactQueryProvider>
    </NuqsAdapter>
  );
};

export default Providers;
