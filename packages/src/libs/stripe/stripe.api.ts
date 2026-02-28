import Stripe from 'stripe';
import { env } from '../../env/index.js';

export const appStripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
});
