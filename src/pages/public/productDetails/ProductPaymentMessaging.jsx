import React, { useEffect, useState } from 'react';
import { Elements, PaymentMethodMessagingElement } from '@stripe/react-stripe-js';
import { getStripe } from '../../../utils/stripe';

export default function ProductPaymentMessaging({ amount }) {
  const [stripePromise, setStripePromise] = useState(null);
  const amountPence = Math.max(50, Math.round((Number(amount) || 0) * 100));

  useEffect(() => {
    getStripe().then(setStripePromise).catch(() => setStripePromise(null));
  }, []);

  if (!stripePromise) return null;

  return (
    <div className="mt-3 min-h-6">
      <Elements stripe={stripePromise}>
        <PaymentMethodMessagingElement
          options={{
            amount: amountPence,
            currency: 'GBP',
            countryCode: 'GB',
            paymentMethodTypes: ['klarna'],
            logoColor: 'color',
          }}
        />
      </Elements>
    </div>
  );
}
