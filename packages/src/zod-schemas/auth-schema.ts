import { z } from './base-zod.js';
import {
  emailSchema,
  otpSchema,
  passwordSchema,
  phoneNumberSchema,
  requiredString,
} from './base.schemas.js';

export const createUserSchema = z
  .object({
    name: requiredString('Name is required', 3, 50).openapi({
      description: 'Full name of the user',
      example: 'John Doe',
    }),
    email: emailSchema.shape.email,
    password: passwordSchema,
    phoneNumber: phoneNumberSchema.optional(),
    country: requiredString('Country is required', 2, 56).optional().openapi({
      example: 'United States',
    }),
  })
  .openapi({
    title: 'CreateUserSchema',
    description: 'Schema for user registration',
  });

export type TCreateUserSchema = z.infer<typeof createUserSchema>;

export const verifyUserSchema = createUserSchema
  .pick({ name: true, email: true, password: true })
  .extend({ ...otpSchema.shape })
  .openapi({
    title: 'VerifyUserSchema',
  });

export type TVerifyUserSchema = z.infer<typeof verifyUserSchema>;

export const loginSchema = createUserSchema
  .pick({ email: true, password: true })
  .extend({
    rememberMe: z.boolean().optional().openapi({
      description: 'Remember me option for login',
      example: true,
    }),
  })
  .openapi({
    title: 'LoginSchema',
  });

export type TLoginSchema = z.infer<typeof loginSchema>;

export const resetPasswordSchema = verifyUserSchema
  .pick({ email: true, otp: true })
  .extend({ newPassword: passwordSchema })
  .openapi({
    title: 'ResetPasswordSchema',
  });

export type TResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .openapi({
    title: 'NewPasswordSchema',
  });

export type TNewPasswordSchema = z.infer<typeof newPasswordSchema>;

export const verifyOtpSchema = verifyUserSchema
  .pick({ email: true, otp: true })
  .openapi({
    title: 'VerifyOtpSchema',
  });

export type TVerifyOtpSchema = z.infer<typeof verifyOtpSchema>;
