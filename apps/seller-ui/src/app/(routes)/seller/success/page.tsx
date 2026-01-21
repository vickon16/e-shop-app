'use client';

import React from 'react';
import Link from 'next/link';
import { Routes } from '@/configs/routes';

const SellerSuccessPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary2/10">
      <div className="bg-card shadow-xl rounded-2xl p-8 sm:p-12 flex flex-col items-center max-w-md w-full animate-fade-in">
        {/* Success Icon */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 animate-pulse-scale">
          <svg
            className="w-12 h-12 text-primary animate-beat"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              className="stroke-primary/30"
              strokeWidth="2.5"
            />
            <path
              d="M8 12.5l3 3 5-5"
              className="stroke-primary"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
          </svg>
        </div>
        {/* Headline */}
        <h1 className="text-3xl font-bold text-primary mb-2 text-center font-poppins">
          Account Created!
        </h1>
        {/* Subtext */}
        <p className="text-muted-foreground text-center mb-6 font-roboto">
          Your seller account has been successfully created and connected to
          Stripe.
          <br />
          You can now access your dashboard and start selling.
        </p>
        {/* CTA Button */}
        <Link
          href={Routes.auth.login}
          className="inline-block px-6 py-3 rounded-lg bg-gradient-to-br from-primary to-primary2 text-primary-foreground font-semibold shadow-lg hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60"
        >
          Login to Dashboard
        </Link>
      </div>
      <style jsx>{`
        .font-poppins {
          font-family: var(--font-poppins), sans-serif;
        }
        .font-roboto {
          font-family: var(--font-roboto), sans-serif;
        }
        .animate-fade-in {
          animation: fadeIn 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-beat {
          animation: beat 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SellerSuccessPage;
