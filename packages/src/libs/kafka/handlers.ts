import { TKafkaProductEventSchemaType } from './constants.js';
import { updateUserAnalytics } from './service-workers/analytics.service.js';

export const productEventHandlers: Record<
  TKafkaProductEventSchemaType['action'],
  (event: TKafkaProductEventSchemaType) => Promise<void>
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
