import { discountTypes, YesNo } from '../constants/index.js';
import { z } from './base-zod.js';
import { optionalPriceSchema, requiredString } from './base.schemas.js';

export const commaSeparatedStringRaw = z
  .string()
  .min(1)
  .regex(/^(\s*[^,\s]+(\s*,\s*[^,\s]+)*)$/, 'Must be a comma-separated list');

export const productSchema = z.object({
  title: requiredString('Product Title', 3, 100).openapi({
    description: 'One-Time Password (OTP) for verification',
    example: '1234',
  }),
  description: requiredString('Product Description', 10, 150).openapi({
    description: 'Detailed description of the product',
    example: 'This is a great product that serves many purposes.',
  }),
  tags: commaSeparatedStringRaw.openapi({
    description: "Separate related products tags with a comma ','",
    example: 'electronics, gadgets, sale',
  }),
  warranty: requiredString('Warranty', 3, 100).openapi({
    description: 'Product Warranty',
    example: '1 Year/ No Warranty',
  }),
  slug: requiredString('Product Slug', 3, 50)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)',
    )
    .openapi({
      description: 'URL-friendly identifier for the product',
      example: 'my-awesome-product',
    }),

  brand: z.string().optional().openapi({
    description: 'Product Brand',
    example: 'Apple',
  }),
  cashOnDelivery: z.enum(YesNo).openapi({
    description: 'Select if it is cash on delivery',
    example: 'Yes/No',
  }),
  category: requiredString('Category', 3, 50).openapi({
    description: 'Product Category',
    example: 'electronics',
  }),
  subCategory: z.string().optional().openapi({
    description: 'Product Sub Category',
    example: 'mobile phones',
  }),
  detailedDescription: requiredString(
    'Detailed Description',
    100,
    1000,
  ).openapi({
    description: 'Detailed Description of the product',
    example:
      'This product features a high-resolution display, long-lasting battery life, and a powerful processor to handle all your tasks with ease.',
  }),
  videoUrl: z
    .string()
    .regex(
      /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
      'URL must be a valid YouTube embed link (e.g., https://www.youtube.com/embed/examplevideo)',
    )
    .optional()
    .openapi({
      description: 'Product Video URL (YouTube embed only)',
      example: 'https://www.youtube.com/embed/examplevideo',
    }),
  regularPrice: optionalPriceSchema.openapi({
    description: 'Product price as a string (validated as a number, minimum 0)',
    example: '499.99',
  }),
  salePrice: optionalPriceSchema.openapi({
    description: 'Product price as a string (validated as a number, minimum 0)',
    example: '499.99',
  }),

  stock: z
    .string()
    .regex(/^\d+$/, 'Stock must be an integer between 1 and 1000')
    .refine(
      (val) => {
        const num = Number(val);
        return Number.isInteger(num) && num >= 1 && num <= 1000;
      },
      {
        message: 'Stock must be an integer between 1 and 1000',
      },
    )
    .openapi({
      description: 'Stock quantity as a string (integer between 1 and 1000)',
      example: '100',
    }),

  sizes: z
    .string()
    .array()
    .openapi({
      description: 'Available sizes for the product',
      example: ['S', 'M', 'L', 'XL'],
    }),
});

export type TProductSchema = z.infer<typeof productSchema>;

export const createDiscountCodesSchema = z
  .object({
    publicName: requiredString('Public Name', 3, 100),
    discountType: z.enum(discountTypes).openapi({
      description: 'Type of discount',
      example: 'percentage',
    }),
    discountValue: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Invalid discount format')
      .openapi({
        description: 'Value of the discount',
        example: 10.5,
      }),
    discountCode: z
      .string()
      .trim()
      .min(3, 'Discount code is too short')
      .max(20, 'Discount code is too long')
      .regex(
        /^[A-Z0-9]+$/,
        'Discount code must be uppercase letters and numbers only',
      ),
  })
  .superRefine(({ discountType, discountValue }, ctx) => {
    const value = Number(discountValue);

    if (value <= 0) {
      ctx.addIssue({
        path: ['discountValue'],
        code: 'custom',
        message: 'Discount must be greater than 0',
      });
    }

    if (discountType === 'percentage' && value > 100) {
      ctx.addIssue({
        path: ['discountValue'],
        code: 'custom',
        message: 'Percentage discount cannot exceed 100',
      });
    }
  });

export type TCreateDiscountCodesSchema = z.infer<
  typeof createDiscountCodesSchema
>;
