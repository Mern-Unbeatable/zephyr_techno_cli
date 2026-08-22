import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AddressElement,
  Elements,
  ExpressCheckoutElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { getStripe } from '../../../utils/stripe';
import { confirmExpressPayment, createExpressCheckoutIntent } from '../../../utils/cartApi';

const STANDARD_SHIPPING = {
  id: 'standard',
  displayName: 'Standard Delivery',
  amount: 0,
};

const ADDRESS_ELEMENT_OPTIONS = {
  mode: 'shipping',
  allowedCountries: ['GB'],
  autocomplete: { mode: 'automatic' },
  blockPoBox: false,
  fields: { phone: 'always' },
  validation: { phone: { required: 'always' } },
  display: { name: 'full' },
  defaultValues: {
    address: { country: 'GB' },
  },
};

function methodAvailable(methods, key) {
  const value = methods?.[key];
  return Boolean(value?.available ?? value);
}

function isExpressMethodAvailable(walletType, methods) {
  if (!methods) return false;
  return (
    methodAvailable(methods, 'paypal') ||
    methodAvailable(methods, 'klarna') ||
    (walletType === 'google' && methodAvailable(methods, 'googlePay')) ||
    (walletType === 'apple' && methodAvailable(methods, 'applePay'))
  );
}

function mapAddressToOrder(value) {
  if (!value?.address?.line1) return null;
  const street = [value.address.line1, value.address.line2].filter(Boolean).join(', ');
  return {
    fullName: value.name || 'Customer',
    phone: value.phone || null,
    street,
    city: value.address.city || 'To be confirmed',
    state: value.address.state || null,
    zipCode: value.address.postal_code || 'TBC',
    country: value.address.country === 'GB' ? 'United Kingdom' : value.address.country || 'United Kingdom',
  };
}

function mapAddressToStripeShipping(value) {
  if (!value?.address?.line1) return null;
  return {
    name: value.name,
    phone: value.phone || undefined,
    address: {
      line1: value.address.line1,
      line2: value.address.line2 || undefined,
      city: value.address.city,
      state: value.address.state || undefined,
      postal_code: value.address.postal_code,
      country: value.address.country,
    },
  };
}

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
  const [addressError, setAddressError] = useState('');
  const [typedAddress, setTypedAddress] = useState(null);

  useEffect(() => {
    if (!elements || !amountPence) return;
    elements.update({ amount: amountPence }).catch(() => {});
  }, [elements, amountPence]);

  const handleClick = (event) => {
    if (!typedAddress?.address?.line1) {
      setAddressError('Enter your shipping address to continue. Start typing for suggestions.');
      event.reject();
      return;
    }

    setAddressError('');
    event.resolve({
      lineItems: [{ name: 'Order total', amount: amountPence }],
      shippingRates: [STANDARD_SHIPPING],
    });
  };

  const handleWalletAvailability = (methods) => {
    onAvailabilityChange?.(isExpressMethodAvailable(walletType, methods));
  };

  const handleConfirm = async (event) => {
    if (!stripe || !elements || processing || disabled) {
      event.paymentFailed({ reason: 'fail' });
      return;
    }

    setProcessing(true);
    try {
      if (!typedAddress?.address?.line1) {
        setAddressError('Enter your shipping address to continue.');
        event.paymentFailed({ reason: 'fail' });
        return;
      }

      const { error: submitError } = await elements.submit();
      if (submitError) {
        event.paymentFailed({ reason: 'fail' });
        return;
      }

      const shippingAddress = mapAddressToOrder(typedAddress);
      const intent = await createExpressCheckoutIntent({
        productId,
        colorId,
        storageOptionId,
        quantity,
        shippingMethod: 'Standard Delivery',
        shippingCost: 0,
        shippingAddress,
        guestEmail: event.billingDetails?.email || null,
      });

      if (!intent?.success || !intent.data?.clientSecret) {
        event.paymentFailed({ reason: 'fail' });
        return;
      }

      const { clientSecret, paymentIntentId } = intent.data;
      const confirmParams = {
        return_url: `${window.location.origin}/checkout/success`,
        shipping: mapAddressToStripeShipping(typedAddress),
      };

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
    <div className="space-y-3">
      <div className={processing || disabled ? 'opacity-60 pointer-events-none' : ''}>
        <p className="text-xs font-bold uppercase tracking-[0.55px] text-[#6B7280] mb-2">
          Shipping address
        </p>
        <p className="text-xs text-[#64748B] mb-3">
          Start typing your house or street name — matching UK addresses will appear as suggestions.
        </p>
        <div className="rounded-sm border border-[#E5E7EB] bg-white px-3 py-3">
          <AddressElement
            options={ADDRESS_ELEMENT_OPTIONS}
            onChange={(event) => {
              if (event.complete) {
                setTypedAddress(event.value);
                setAddressError('');
                return;
              }
              setTypedAddress(null);
            }}
          />
        </div>
        {addressError ? (
          <p className="text-xs text-red-500 mt-2">{addressError}</p>
        ) : null}
      </div>

      <div className={`min-h-11 ${processing || disabled ? 'opacity-60 pointer-events-none' : ''}`}>
        <ExpressCheckoutElement
          onClick={handleClick}
          onConfirm={handleConfirm}
          onLoadError={() => onAvailabilityChange?.(false)}
          onReady={({ availablePaymentMethods }) => {
            if (availablePaymentMethods) {
              handleWalletAvailability(availablePaymentMethods);
            }
          }}
          onAvailablePaymentMethodsChange={({ paymentMethods }) => {
            handleWalletAvailability(paymentMethods);
          }}
          options={{
            emailRequired: true,
            phoneNumberRequired: false,
            billingAddressRequired: false,
            shippingAddressRequired: false,
            lineItems: [{ name: 'Order total', amount: amountPence }],
            paymentMethodOrder:
              walletType === 'google'
                ? ['google_pay', 'paypal', 'klarna', 'apple_pay']
                : walletType === 'apple'
                  ? ['apple_pay', 'paypal', 'klarna', 'google_pay']
                  : ['paypal', 'klarna', 'google_pay', 'apple_pay'],
            paymentMethods: {
              applePay: walletType === 'apple' ? 'always' : 'never',
              googlePay: walletType === 'google' ? 'always' : 'never',
              paypal: 'auto',
              klarna: 'auto',
              link: 'never',
              amazonPay: 'never',
            },
            buttonType: {
              applePay: 'buy',
              googlePay: 'buy',
              paypal: 'buynow',
            },
            buttonTheme: {
              applePay: 'black',
              googlePay: 'black',
              paypal: 'gold',
            },
            buttonHeight: 48,
            layout: {
              maxColumns: 1,
              maxRows: 4,
              overflow: 'auto',
            },
          }}
        />
      </div>
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
  walletType = null,
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
        appearance: {
          theme: 'stripe',
          variables: {
            borderRadius: '2px',
            fontFamily: 'Manrope, system-ui, sans-serif',
            colorPrimary: '#47B5C9',
          },
        },
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
