import { z } from './base-zod.js';

export const emailSchema = z.object({
  email: z.email({ message: 'Invalid email address' }).openapi({
    description: 'User email address',
    example: 'nkachukwuvictor2016@gmail.com',
  }),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(4, { message: 'OTP must be exactly 4 characters' })
    .regex(/^\d+$/, { message: 'OTP must contain only digits' })
    .openapi({
      description: 'One-Time Password (OTP) for verification',
      example: '1234',
    }),
});

export type TEmailSchema = z.infer<typeof emailSchema>;

export const baseApiResponse = z.object({
  success: z.boolean().openapi({
    description: 'Indicates if the operation was successful',
    example: true,
  }),
  message: z.string().openapi({
    description: 'A descriptive message about the response',
  }),
});

export type TBaseApiResponse = z.infer<typeof baseApiResponse>;

export const requiredString = (title: string, min: number, max: number) => {
  return z
    .string()
    .min(min, { message: `${title} must be minimum of ${min} characters` })
    .max(max, { message: `${title} must be maximum of ${max} characters` })
    .trim()
    .refine((value) => !/<\/?[a-z][\s\S]*>/i.test(value), {
      message: 'HTML tags are not allowed.',
    });
};

export const phoneNumberSchema = z
  .string()
  .trim()
  // E.164 format: + and up to 15 digits
  .regex(
    /^\+[1-9]\d{7,14}$/,
    'Enter a valid phone number in international format. e.g., +15555555555',
  )
  .openapi({
    example: '+15555555555',
  });

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(50, 'Password must be at most 50 characters')
  .regex(/[0-9]/, 'Password must contain at least 1 number')
  .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least 1 capital letter')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least 1 special character')
  .refine((password) => {
    // Check for 3 or more recurring characters
    const recurringPattern = /(.)\1{2,}/;
    return !recurringPattern.test(password);
  }, 'Avoid 3 or more recurring characters')
  .openapi({
    description:
      'Password must be 8-50 characters long, include at least 1 number, 1 lowercase letter, 1 capital letter, and 1 special character.',
    example: 'Password123!',
  });

export const stringNumberSchema = z
  .string()
  .min(1, 'Value is required')
  .refine((value) => !isNaN(Number(value)), {
    message: 'Must be a valid number',
  })
  .refine((value) => value.trim() !== '', {
    message: 'Cannot be empty',
  })
  .refine((value) => !value.includes(' '), {
    message: 'Cannot contain spaces',
  })
  .refine((value) => /^\d+$/.test(value), {
    message: 'Must contain only digits (no decimal points or negative signs)',
  });
