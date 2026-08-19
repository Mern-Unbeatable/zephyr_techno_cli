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

  const res = await fetch(`${BASE_URL}/api/public/product/stripe-config`);
  const data = await res.json();
  if (!data.success || !data.data?.publishableKey) {
    throw new Error(data.message || 'Stripe is not configured');
  }

  stripePromise = loadStripe(data.data.publishableKey);
  return stripePromise;
}
