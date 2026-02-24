import Stripe from 'stripe';
import { env } from '../../env/index.js';

export const appStripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
});
