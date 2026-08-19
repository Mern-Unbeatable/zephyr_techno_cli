import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Elements,
  ExpressCheckoutElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { FaApple } from 'react-icons/fa';
import { getStripe } from '../../../utils/stripe';
import { checkout, confirmExpressPayment, createExpressCheckoutIntent } from '../../../utils/cartApi';

function FallbackApplePayButton({ productId, colorId, storageOptionId, quantity, disabled }) {
  const [paying, setPaying] = useState(false);

  const handleClick = async () => {
    if (disabled || paying) return;
    setPaying(true);
    try {
      await checkout({
        collectAddressOnStripe: true,
        shippingMethod: 'Standard Delivery',
        shippingCost: 0,
        promoCode: null,
        directProduct: {
          productId,
          colorId: colorId || null,
          storageOptionId: storageOptionId || null,
          quantity,
        },
      });
    } finally {
      setPaying(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || paying}
      className="w-full bg-black text-white hover:bg-[#1a1a1a] rounded-sm font-medium text-sm transition-colors h-11 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {paying ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <FaApple className="h-5 w-5" />
      )}
      {paying ? 'Redirecting…' : 'Apple Pay'}
    </button>
  );
}

function ExpressCheckoutForm({
  productId,
  colorId,
  storageOptionId,
  quantity,
  amountPence,
  disabled,
  onAvailabilityChange,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!elements || !amountPence) return;
    elements.update({ amount: amountPence }).catch(() => {});
  }, [elements, amountPence]);

  const handleConfirm = async (event) => {
    if (!stripe || !elements || processing || disabled) return;

    setProcessing(true);
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        event.paymentFailed({ reason: 'fail' });
        return;
      }

      const intent = await createExpressCheckoutIntent({
        productId,
        colorId,
        storageOptionId,
        quantity,
        shippingMethod: 'Standard Delivery',
        shippingCost: 0,
      });

      if (!intent?.success || !intent.data?.clientSecret) {
        event.paymentFailed({ reason: 'fail' });
        return;
      }

      const { clientSecret, paymentIntentId } = intent.data;

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
        clientSecret,
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
    <div className={`min-h-11 ${processing || disabled ? 'opacity-60 pointer-events-none' : ''}`}>
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
  amount,
  disabled,
  onAvailabilityChange,
}) {
  const [stripePromise, setStripePromise] = useState(null);
  const [useFallback, setUseFallback] = useState(false);
  const amountPence = Math.max(50, Math.round((Number(amount) || 0) * 100));

  useEffect(() => {
    getStripe()
      .then(setStripePromise)
      .catch(() => {
        setUseFallback(true);
        onAvailabilityChange?.(true);
      });
  }, [onAvailabilityChange]);

  if (useFallback || !stripePromise) {
    if (useFallback) {
      return (
        <FallbackApplePayButton
          productId={productId}
          colorId={colorId}
          storageOptionId={storageOptionId}
          quantity={quantity}
          disabled={disabled}
        />
      );
    }

    return (
      <div className="h-11 flex items-center justify-center rounded-sm bg-[#F6F7F9]">
        <span className="loading loading-spinner loading-xs text-gray-400" />
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: 'payment',
        amount: amountPence,
        currency: 'gbp',
      }}
    >
      <ExpressCheckoutForm
        productId={productId}
        colorId={colorId}
        storageOptionId={storageOptionId}
        quantity={quantity}
        amountPence={amountPence}
        disabled={disabled}
        onAvailabilityChange={(available) => {
          if (available) {
            onAvailabilityChange?.(true);
            return;
          }
          setUseFallback(true);
          onAvailabilityChange?.(true);
        }}
      />
    </Elements>
  );
}
