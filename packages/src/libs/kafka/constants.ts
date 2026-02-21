import { z } from '../../zod-schemas/base-zod.js';

export const KafkaGroups = {
  USERS_EVENTS_GROUP: 'users-events-group',
};

export const KafkaTopics = {
  USER_EVENTS: 'users.events',
  ORDER_CREATED: 'order.created',
  PAYMENT_COMPLETED: 'payment.completed',
};

const kakfaProductEventActions = [
  'shop-visit',
  'add-to-wishlist',
  'add-to-cart',
  'product-view',
  'remove-from-wishlist',
  'remove-from-cart',
  'purchase', // New action type for when a purchase is made
] as const;

export const kafkaProductEventSchema = z.object({
  action: z.enum(kakfaProductEventActions).openapi({
    description: 'Type of user action being tracked',
    example: 'add-to-cart',
  }),
  userId: z.string().optional().openapi({
    description: 'ID of the user performing the action',
    example: '123e4567-e89b-12d3-a456-426614174000',
  }),
  productId: z.string().optional().openapi({
    description: 'ID of the product involved in the event',
    example: '987e6543-e21b-12d3-a456-426614174000',
  }),
  shopId: z.string().optional().openapi({
    description: 'ID of the shop where the event occurred',
    example: '555e4444-e21b-12d3-a456-426614174000',
  }),
  timestamp: z.string().optional().openapi({
    description: 'ISO string timestamp of when the event occurred',
    example: '2024-01-01T12:00:00Z',
  }),
  country: z.string().optional().openapi({
    description: "User's country for better analytics and recommendations",
    example: 'US',
  }),
  city: z.string().optional().openapi({
    description: "User's city for better analytics and recommendations",
    example: 'New York',
  }),
  device: z.string().optional().openapi({
    description: "User's device type for better analytics and recommendations",
    example: 'iPhone 12',
  }),
});

export type TKafkaProductEventSchemaType = z.infer<
  typeof kafkaProductEventSchema
>;
