import React from 'react';

const Logo = ({ size = 56 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <defs>
      <linearGradient
        id="bagGradient"
        x1="0"
        y1="0"
        x2="56"
        y2="56"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6C63FF" />
        <stop offset="1" stopColor="#48C9B0" />
      </linearGradient>
      <linearGradient
        id="handleGradient"
        x1="0"
        y1="0"
        x2="56"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FFB347" />
        <stop offset="1" stopColor="#FF6F61" />
      </linearGradient>
    </defs>
    {/* Bag body */}
    <rect
      x="10"
      y="18"
      width="36"
      height="28"
      rx="8"
      fill="url(#bagGradient)"
      stroke="#22223B"
      strokeWidth="2"
      filter="drop-shadow(0 2px 6px rgba(108,99,255,0.15))"
    />
    {/* Bag handle */}
    <path
      d="M18 18c0-6 6-10 10-10s10 4 10 10"
      stroke="url(#handleGradient)"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    {/* Stylized 'e' */}
    <path
      d="M28 38c-5 0-8-3-8-7s3-7 8-7c3.5 0 6 1.5 7 4h-7v3h10c0 5-4 7-10 7z"
      fill="#fff"
      stroke="#22223B"
      strokeWidth="1.2"
      style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))' }}
    />
    {/* App name */}
    <text
      x="28"
      y="58"
      textAnchor="middle"
      fontFamily="'Inter', 'Segoe UI', Arial, sans-serif"
      fontWeight="bold"
      fontSize="14"
      fill="#4f4f88"
      letterSpacing="1.5"
    >
      e-shop
    </text>
  </svg>
);

export default Logo;
