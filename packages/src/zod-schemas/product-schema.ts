import { discountTypes, YesNo } from '../constants/index.js';
import { z } from './base-zod.js';
import { priceSchema, requiredString } from './base.schemas.js';

export const uploadProductImageResponseSchema = z.object({
  fileUrl: z.url().openapi({
    description: 'URL of the uploaded product image',
    example: 'https://ik.imagekit.io/your_image_path/image.png',
  }),
  fileId: z.string().openapi({
    description: 'Unique identifier for the uploaded image',
    example: 'abcd1234efgh5678',
  }),
});

export type TUploadProductImageResponseSchema = z.infer<
  typeof uploadProductImageResponseSchema
>;

export const commaSeparatedStringRaw = z
  .string()
  .min(1)
  .regex(/^(\s*[^,\s]+(\s*,\s*[^,\s]+)*)$/, 'Must be a comma-separated list');

export const productSchema = z
  .object({
    title: requiredString('Product Title', 3, 100).openapi({
      description: 'One-Time Password (OTP) for verification',
      example: '1234',
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
    description: requiredString('Product Description', 10, 150).openapi({
      description: 'Detailed description of the product',
      example: 'This is a great product that serves many purposes.',
    }),
    category: requiredString('Category', 3, 50).openapi({
      description: 'Product Category',
      example: 'electronics',
    }),
    subCategory: requiredString('Category', 3, 50).openapi({
      description: 'Product Sub Category',
      example: 'mobile phones',
    }),
    salePrice: priceSchema.openapi({
      description:
        'Product price as a string (validated as a number, minimum 0)',
      example: '499.99',
    }),
    tags: commaSeparatedStringRaw.openapi({
      description: "Separate related products tags with a comma ','",
      example: 'electronics, gadgets, sale',
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
    regularPrice: priceSchema.openapi({
      description:
        'Product price as a string (validated as a number, minimum 0)',
      example: '499.99',
    }),

    warranty: z.string().optional().openapi({
      description: 'Product Warranty',
      example: '1 Year/ No Warranty',
    }),

    brand: z.string().optional().openapi({
      description: 'Product Brand',
      example: 'Apple',
    }),
    cashOnDelivery: z.enum(YesNo).openapi({
      description: 'Select if it is cash on delivery',
      example: 'Yes/No',
    }),

    detailedDescription: z.string().max(1000).optional().openapi({
      description: 'Detailed Description of the product',
      example:
        'This product features a high-resolution display, long-lasting battery life, and a powerful processor to handle all your tasks with ease.',
    }),
    customSpecifications: z
      .array(
        z.object({
          name: requiredString('Name', 3, 20),
          value: requiredString('Value', 1, 50),
        }),
      )
      .openapi({
        description: 'Custom specifications for the product',
        example: [
          {
            name: 'Battery Life',
            value: '10 hours',
          },
          {
            name: 'Weight',
            value: '1.5 kg',
          },
        ],
      }),
    customProperties: z
      .array(
        z.object({
          label: requiredString('Label', 1, 30),
          values: z.array(z.string()),
        }),
      )
      .openapi({
        description: 'Custom properties for the product',
        example: [
          {
            label: 'Material',
            value: 'Cotton',
            values: ['Cotton', 'Polyester', 'Wool'],
          },
        ],
      }),
    colors: z.array(z.string()).openapi({
      description: 'Available colors for the product',
      example: ['#FF0000', '#00FF00', '#0000FF'],
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

    sizes: z
      .string()
      .array()
      .nonempty()
      .openapi({
        description: 'Available sizes for the product',
        example: ['S', 'M', 'L', 'XL'],
      }),

    discountCodes: z
      .string()
      .array()
      .optional()
      .openapi({
        description: 'Discount codes for the product',
        example: ['SUMMER21', 'WELCOME10'],
      }),
  })
  .superRefine(({ salePrice, regularPrice }, ctx) => {
    if (salePrice && regularPrice && Number(salePrice) > Number(regularPrice)) {
      ctx.addIssue({
        path: ['salePrice'],
        code: 'custom',
        message: 'Sale price cannot be greater than regular price',
      });
    }
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
