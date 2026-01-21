import { env } from '../../env/index.js';
import Stripe from 'stripe';

export const appStripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
});
