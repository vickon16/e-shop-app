'use client';

import { useEffect, useState } from 'react';

const LOCATION_STORAGE_KEY = 'user_location';
const LOCATION_EXPIRY_DAYS = 20;

export type TLocationStoredData = {
  ip?: string;
  country?: string;
  countryName?: string;
  timezone?: string;
  city?: string;
  timestamp: number;
};

const getStoredLocation = () => {
  try {
    const storedData = localStorage.getItem(LOCATION_STORAGE_KEY);

    if (!storedData) return null;

    const parsedData = JSON.parse(storedData) as TLocationStoredData;
    const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 20 days

    const isExpired = Date.now() - parsedData.timestamp > expiryTime;

    return isExpired ? null : parsedData;
  } catch (error) {
    console.log('Failed to get location data', error);
    return null;
  }
};

export const useLocationTracking = () => {
  const [location, setLocation] = useState<TLocationStoredData | null>(null);

  useEffect(() => {
    const stored = getStoredLocation();

    if (stored) {
      setLocation(stored);
      return;
    }

    fetch('https://ipapi.co/json')
      .then((res) => res.json())
      .then((data) => {
        const newLocation: TLocationStoredData = {
          ip: data?.ip || undefined,
          country: data?.country || undefined,
          countryName: data?.country_name || undefined,
          timezone: data?.timezone || undefined,
          city: data?.city || undefined,
          timestamp: Date.now(),
        };

        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
        setLocation(newLocation);
      })
      .catch((error) => {
        console.log('Failed to get location', error);
      });
  }, []); // ✅ empty dependency

  return { location };
};
