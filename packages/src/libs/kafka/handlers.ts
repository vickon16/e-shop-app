import { TKafkaProductEventSchemaType } from './constants.js';
import { updateUserAnalytics } from './service-workers/analytics.service.js';

type Handler = (event: TKafkaProductEventSchemaType) => Promise<void>;

export const eventHandlers: Record<
  TKafkaProductEventSchemaType['action'],
  Handler
> = {
  'shop-visit': async () => {
    console.log('Shop visit tracked');
  },

  'add-to-cart': updateUserAnalytics,
  'remove-from-cart': updateUserAnalytics,
  'product-view': updateUserAnalytics,
  'add-to-wishlist': updateUserAnalytics,
  'remove-from-wishlist': updateUserAnalytics,
  purchase: updateUserAnalytics,
};
