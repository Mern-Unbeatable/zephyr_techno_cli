import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Elements,
  ExpressCheckoutElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { getStripe } from '../../../utils/stripe';
import { confirmExpressPayment, createExpressCheckoutIntent } from '../../../utils/cartApi';

function ExpressCheckoutForm({
  productId,
  colorId,
  storageOptionId,
  quantity,
  amountPence,
  disabled,
  walletType,
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

  const handleClick = (event) => {
    event.resolve({
      emailRequired: true,
      phoneNumberRequired: true,
      shippingAddressRequired: true,
      allowedShippingCountries: ['GB'],
      lineItems: [{ name: 'Order total', amount: amountPence }],
    });
  };

  const handleConfirm = async (event) => {
    if (!stripe || !elements || processing || disabled) {
      event.paymentFailed({ reason: 'fail' });
      return;
    }

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
        onClick={handleClick}
        onConfirm={handleConfirm}
        onReady={({ availablePaymentMethods }) => {
          const available =
            walletType === 'google'
              ? Boolean(availablePaymentMethods?.googlePay)
              : Boolean(availablePaymentMethods?.applePay);
          onAvailabilityChange?.(available);
        }}
        options={{
          paymentMethods: {
            applePay: walletType === 'apple' ? 'always' : 'never',
            googlePay: walletType === 'google' ? 'always' : 'never',
            link: 'never',
            paypal: 'never',
            amazonPay: 'never',
            klarna: 'never',
          },
          buttonType: {
            applePay: 'buy',
            googlePay: 'buy',
          },
          buttonTheme: {
            applePay: 'black',
            googlePay: 'black',
          },
          buttonHeight: 44,
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
  walletType = 'apple',
  onAvailabilityChange,
}) {
  const [stripePromise, setStripePromise] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const amountPence = Math.max(50, Math.round((Number(amount) || 0) * 100));

  useEffect(() => {
    getStripe()
      .then(setStripePromise)
      .catch(() => {
        setLoadError(true);
        onAvailabilityChange?.(false);
      });
  }, [onAvailabilityChange]);

  if (loadError) return null;

  if (!stripePromise) {
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
        walletType={walletType}
        onAvailabilityChange={onAvailabilityChange}
      />
    </Elements>
  );
}
