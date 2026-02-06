import { cn } from '@/lib/utils';
import React from 'react';

type Props = {
  rating: number; // rating value (e.g., 3.5)
  max?: number; // max stars, default 5
  size?: number; // star size in px, default 20
  className?: string;
};

export const Ratings = ({ rating, max = 5, size = 20, className }: Props) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <svg
          key={`full-${i}`}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill="#FFD700"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
        </svg>
      ))}
      {hasHalfStar && (
        <svg
          key="half"
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="half-gradient">
              <stop offset="50%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#E0E0E0" />
            </linearGradient>
          </defs>
          <path
            d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"
            fill="url(#half-gradient)"
          />
        </svg>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <svg
          key={`empty-${i}`}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill="#E0E0E0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
        </svg>
      ))}
    </div>
  );
};
