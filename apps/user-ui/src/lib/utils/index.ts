import { AxiosError } from 'axios';
import { clsx, type ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const errorCheck = (error: unknown, message: string): Error => {
  let errorMessage = message;
  const defaultErrorMessage = 'Something went wrong';

  if (error instanceof AxiosError) {
    errorMessage =
      error.response?.data?.message || error?.message || defaultErrorMessage;
  } else if (error instanceof Error && 'message' in error) {
    errorMessage = error?.message || defaultErrorMessage;
  } else if (
    !!error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    errorMessage = error.message;
  } else if (typeof error === 'string' && !!error) {
    errorMessage = error;
  }

  return new Error(errorMessage);
};

export const errorToast = (
  error: unknown,
  message: string,
  shouldToast = true,
) => {
  const errorMessage = errorCheck(error, message).message;

  if (!shouldToast) return errorMessage;
  return toast.error(message, {
    description: errorMessage,
  });
};

export function normalizeAndCapitalize(str?: string | null) {
  if (!str || typeof str !== 'string') return '';

  return str
    .toLowerCase()
    .replace(/[-_]/g, ' ') // Replace - and _ with spaces
    .split(' ') // Split into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' ');
}
