import Stripe from 'stripe';

// Initialize Stripe lazily to avoid build-time errors
let _stripe: Stripe | null = null;

export function getStripeServer(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }
  return _stripe;
}

// For backwards compatibility
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripeServer()[prop as keyof Stripe];
  },
});

// Subscription tier configuration
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    credits: 5,
    priceMonthly: 0,
    priceYearly: 0,
    features: ['5 analyses per month', 'Basic signals', 'CSV export'],
  },
  starter: {
    name: 'Starter',
    credits: 50,
    priceMonthly: 29,
    priceYearly: 290,
    features: ['50 analyses per month', 'All signals', 'Priority support'],
  },
  pro: {
    name: 'Pro',
    credits: 200,
    priceMonthly: 79,
    priceYearly: 790,
    features: ['200 analyses per month', 'All signals', 'API access', 'Priority support'],
  },
  enterprise: {
    name: 'Enterprise',
    credits: 1000,
    priceMonthly: 199,
    priceYearly: 1990,
    features: ['1000 analyses per month', 'All signals', 'API access', 'Dedicated support', 'Custom integrations'],
  },
} as const;

// Credit pack configuration for one-time purchases
export const CREDIT_PACKS = {
  small: {
    name: '25 Credits',
    credits: 25,
    price: 15,
  },
  medium: {
    name: '50 Credits',
    credits: 50,
    price: 25,
  },
  large: {
    name: '100 Credits',
    credits: 100,
    price: 45,
  },
  xl: {
    name: '250 Credits',
    credits: 250,
    price: 99,
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
export type CreditPack = keyof typeof CREDIT_PACKS;
