import Stripe from 'stripe';

const API_VERSION = '2025-02-24.acacia';

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

/** Lazily build a Stripe client. Throws a clear error if the key is missing. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(key, { apiVersion: API_VERSION });
}
