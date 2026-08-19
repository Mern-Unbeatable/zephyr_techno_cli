import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Elements,
  ExpressCheckoutElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { getStripe } from '../../../utils/stripe';
import {
  cancelUnpaidCheckout,
  confirmExpressPayment,
  createExpressCheckoutIntent,
} from '../../../utils/cartApi';

function ExpressCheckoutForm({ paymentIntentId, disabled, onAvailabilityChange }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async (event) => {
    if (!stripe || !elements || processing || disabled) return;

    setProcessing(true);
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        event.paymentFailed({ reason: 'fail' });
        return;
      }

      const confirmParams = {
        return_url: `${window.location.origin}/checkout/success`,
      };

      if (event.shippingAddress) {
        confirmParams.shipping = {
          name: event.shippingAddress.name,
          address: event.shippingAddress.address,
        };
      }

      if (event.billingDetails?.email) {
        confirmParams.receipt_email = event.billingDetails.email;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams,
        redirect: 'if_required',
      });

      if (error) {
        event.paymentFailed({ reason: 'fail' });
        return;
      }

      sessionStorage.setItem('stripePaymentIntentId', paymentIntentId);
      const result = await confirmExpressPayment(paymentIntentId);
      if (!result?.success) {
        event.paymentFailed({ reason: 'fail' });
        return;
      }

      navigate('/checkout/success', { state: { order: result.data } });
    } catch {
      event.paymentFailed({ reason: 'fail' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={`min-h-11 ${processing ? 'opacity-60 pointer-events-none' : ''}`}>
      <ExpressCheckoutElement
        onConfirm={handleConfirm}
        onReady={({ availablePaymentMethods }) => {
          onAvailabilityChange?.(Boolean(availablePaymentMethods?.applePay));
        }}
        options={{
          paymentMethods: {
            applePay: 'always',
            googlePay: 'never',
            link: 'never',
            paypal: 'never',
            amazonPay: 'never',
            klarna: 'never',
          },
          buttonType: {
            applePay: 'buy',
          },
          buttonTheme: {
            applePay: 'black',
          },
          buttonHeight: 44,
          shippingAddressRequired: true,
          allowedShippingCountries: ['GB'],
          emailRequired: true,
          phoneNumberRequired: true,
          layout: {
            maxColumns: 1,
            maxRows: 1,
          },
        }}
      />
    </div>
  );
}

export default function ProductExpressCheckout({
  productId,
  colorId,
  storageOptionId,
  quantity,
  disabled,
  onAvailabilityChange,
}) {
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const previousOrderIdRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [stripeError, setStripeError] = useState('');
  const [walletAvailable, setWalletAvailable] = useState(null);

  useEffect(() => {
    getStripe()
      .then(setStripePromise)
      .catch((err) => {
        setStripeError(err.message || 'Stripe unavailable');
        onAvailabilityChange?.(false);
      });
  }, []);

  useEffect(() => {
    if (disabled || !productId) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setStripeError('');

    const loadIntent = async () => {
      setLoading(true);
      setWalletAvailable(null);

      try {
        const result = await createExpressCheckoutIntent({
          productId,
          colorId,
          storageOptionId,
          quantity,
          shippingMethod: 'Standard Delivery',
          shippingCost: 0,
        });

        if (cancelled) return;

        if (!result?.success) {
          setStripeError(result?.message || 'Unable to start express checkout');
          setClientSecret(null);
          onAvailabilityChange?.(false);
          return;
        }

        if (previousOrderIdRef.current && previousOrderIdRef.current !== result.data.orderId) {
          cancelUnpaidCheckout(previousOrderIdRef.current);
        }

        previousOrderIdRef.current = result.data.orderId;
        setClientSecret(result.data.clientSecret);
        setPaymentIntentId(result.data.paymentIntentId);
        sessionStorage.setItem('pendingOrderId', result.data.orderId);
        sessionStorage.setItem('stripePaymentIntentId', result.data.paymentIntentId);
        setStripeError('');
      } catch (err) {
        if (!cancelled) {
          setStripeError(err.message || 'Unable to start express checkout');
          onAvailabilityChange?.(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadIntent();

    return () => {
      cancelled = true;
    };
  }, [productId, colorId, storageOptionId, quantity, disabled]);

  if (stripeError || walletAvailable === false) return null;

  if (!stripePromise || loading || !clientSecret) {
    return (
      <div className="h-11 flex items-center justify-center rounded-sm bg-[#F6F7F9]">
        <span className="loading loading-spinner loading-xs text-gray-400" />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }} key={clientSecret}>
      <ExpressCheckoutForm
        paymentIntentId={paymentIntentId}
        disabled={disabled}
        onAvailabilityChange={(available) => {
          setWalletAvailable(available);
          onAvailabilityChange?.(available);
        }}
      />
    </Elements>
  );
}
