import { loadStripe } from '@stripe/stripe-js';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.zephyrtechnology.co.uk';

let stripePromise = null;

export async function getStripe() {
  if (stripePromise) return stripePromise;

  const envKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (envKey) {
    stripePromise = loadStripe(envKey);
    return stripePromise;
  }

  const endpoints = [
    `${BASE_URL}/api/public/stripe-config`,
    `${BASE_URL}/api/public/product/stripe-config`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data?.publishableKey) {
        stripePromise = loadStripe(data.data.publishableKey);
        return stripePromise;
      }
    } catch {
      // try next endpoint
    }
  }

  throw new Error('Stripe is not configured');
}
