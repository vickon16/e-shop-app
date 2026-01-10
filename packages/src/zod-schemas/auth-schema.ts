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
  })
  .openapi({
    title: 'CreateUserSchema',
    description: 'Schema for user registration',
  });

export type TCreateUserSchema = z.infer<typeof createUserSchema>;

export const createSellerSchema = createUserSchema
  .extend({
    phoneNumber: phoneNumberSchema,
    country: requiredString('Country is required', 2, 56).openapi({
      example: 'United States',
    }),
  })
  .openapi({
    title: 'CreateSellerSchema',
    description: 'Schema for user registration',
  });

export type TCreateSellerSchema = z.infer<typeof createSellerSchema>;

export const verifyUserSchema = createUserSchema
  .extend({ ...otpSchema.shape })
  .openapi({
    title: 'VerifyUserSchema',
  });

export type TVerifyUserSchema = z.infer<typeof verifyUserSchema>;

export const verifySellerSchema = createSellerSchema
  .extend({ ...otpSchema.shape })
  .openapi({
    title: 'VerifySellerSchema',
  });

export type TVerifySellerSchema = z.infer<typeof verifySellerSchema>;

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

export const createShopSchema = z
  .object({
    name: requiredString('Shop name is required', 2, 100).openapi({
      description: 'Name of the shop',
      example: 'Vicy Electronics',
    }),

    category: requiredString('Category is required', 2, 50).openapi({
      description: 'Shop category',
      example: 'Electronics',
    }),

    bio: z
      .string()
      .max(500, 'Bio cannot exceed 500 characters')
      .optional()
      .openapi({
        description: 'Short description of the shop',
        example: 'We sell premium electronics and accessories',
      }),

    avatarId: z.uuid().optional().openapi({
      description: 'Avatar image ID',
      example: 'b1c7d9b2-2e1d-4a0e-b4c3-9e3c0b2f2a11',
    }),

    address: requiredString('Address is required', 5, 255).openapi({
      description: 'Physical address of the shop',
      example: '12 Admiralty Way, Lekki, Lagos',
    }),

    coverBanner: z.url('Invalid cover banner URL').optional().openapi({
      description: 'Cover banner image URL',
      example: 'https://cdn.example.com/banners/shop.png',
    }),

    openingHours: z.string().max(255).optional().openapi({
      description: 'Opening hours of the shop',
      example: 'Mon–Sat: 9am – 6pm',
    }),

    website: z.url('Invalid website URL').optional().openapi({
      description: 'Official shop website',
      example: 'https://victorelectronics.com',
    }),

    socialLinks: z
      .record(z.string(), z.url('Invalid social link URL'))
      .optional()
      .openapi({
        description: 'Social media links',
        example: {
          instagram: 'https://instagram.com/vicy',
          twitter: 'https://twitter.com/vicy',
        },
      }),

    sellerId: z.uuid('Invalid seller ID').openapi({
      description: 'Owner (seller) ID',
      example: 'e9c1a4a5-6c77-4d89-9f41-2e1f9d5c0d88',
    }),
  })
  .openapi({
    title: 'ShopCreationSchema',
    description: 'Schema for creating a new shop',
  });

export type TCreateShopSchema = z.infer<typeof createShopSchema>;
