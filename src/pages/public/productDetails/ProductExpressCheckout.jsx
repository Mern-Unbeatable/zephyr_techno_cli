import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  PaymentRequestButtonElement,
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

const EXPRESS_SHIPPING = {
  id: 'express',
  displayName: 'Express Delivery',
  amount: 1500,
};

const WALLET_SHIPPING_RATES = [STANDARD_SHIPPING, EXPRESS_SHIPPING];

const PR_SHIPPING_OPTIONS = [
  {
    id: 'standard',
    label: 'Standard Delivery',
    detail: '3-5 working days',
    amount: 0,
  },
  {
    id: 'express',
    label: 'Express Delivery',
    detail: '1-2 working days',
    amount: 1500,
  },
];

function shippingFromWalletRate(rate) {
  const amountPence = Number(rate?.amount || 0);
  const isExpress = rate?.id === 'express' || amountPence >= 1500;
  return {
    shippingMethod: isExpress ? 'Express Delivery' : 'Standard Delivery',
    shippingCost: amountPence / 100,
  };
}

function lineItemsFor(amountPence, shippingPence = 0) {
  const items = [{ name: 'Subtotal', amount: amountPence }];
  if (shippingPence > 0) {
    items.push({ name: 'Express Delivery', amount: shippingPence });
  } else {
    items.push({ name: 'Standard Delivery', amount: 0 });
  }
  return items;
}

function mapWalletAddressToOrder(event) {
  const shipping = event.shippingAddress;
  if (!shipping?.address) return null;
  const addr = shipping.address;
  const street = [addr.line1, addr.line2].filter(Boolean).join(', ');
  if (!street) return null;
  return {
    fullName: shipping.name || event.billingDetails?.name || 'Customer',
    phone: event.billingDetails?.phone || null,
    street,
    city: addr.city || 'To be confirmed',
    state: addr.state || null,
    zipCode: addr.postal_code || 'TBC',
    country: addr.country === 'GB' ? 'United Kingdom' : addr.country || 'United Kingdom',
  };
}

function mapPaymentRequestShipping(ev) {
  const addr = ev.shippingAddress;
  if (!addr) return null;
  const line1 = addr.addressLine?.[0] || addr.address?.line1;
  const line2 = addr.addressLine?.[1] || addr.address?.line2;
  const street = [line1, line2].filter(Boolean).join(', ');
  if (!street) return null;
  return {
    fullName: addr.recipient || ev.payerName || 'Customer',
    phone: addr.phone || ev.payerPhone || null,
    street,
    city: addr.city || 'To be confirmed',
    state: addr.region || null,
    zipCode: addr.postalCode || 'TBC',
    country: addr.country === 'GB' ? 'United Kingdom' : addr.country || 'United Kingdom',
  };
}

function WalletCheckoutForm({
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
  const payLock = useRef(false);
  const pendingIntent = useRef(null);
  const [walletRequest, setWalletRequest] = useState(null);
  const isApple = walletType === 'apple';
  const isGoogle = walletType === 'google';

  useEffect(() => {
    if (!elements || !amountPence) return;
    elements.update({ amount: amountPence }).catch(() => {});
  }, [elements, amountPence]);

  const createIntent = useCallback(
    ({ shippingCost = 0, shippingAddress = null, guestEmail = null } = {}) =>
      createExpressCheckoutIntent({
        productId,
        colorId,
        storageOptionId,
        quantity,
        shippingMethod: shippingCost >= 15 ? 'Express Delivery' : 'Standard Delivery',
        shippingCost,
        shippingAddress,
        guestEmail,
        paymentMethodTypes: ['card'],
      }).catch((error) => {
        console.error('[Express checkout] Failed to start payment intent', error);
        return null;
      }),
    [productId, colorId, storageOptionId, quantity],
  );

  useEffect(() => {
    if (!stripe || !isGoogle || !amountPence) {
      setWalletRequest(null);
      return undefined;
    }

    const pr = stripe.paymentRequest({
      country: 'GB',
      currency: 'gbp',
      total: {
        label: 'Zephyr Technology',
        amount: amountPence,
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestShipping: true,
      shippingOptions: PR_SHIPPING_OPTIONS,
    });

    let cancelled = false;

    const onShippingAddressChange = (ev) => {
      ev.updateWith({
        status: 'success',
        shippingOptions: PR_SHIPPING_OPTIONS,
        total: { label: 'Zephyr Technology', amount: amountPence },
      });
    };

    const onShippingOptionChange = (ev) => {
      const extra = Number(ev.shippingOption?.amount || 0);
      ev.updateWith({
        status: 'success',
        total: { label: 'Zephyr Technology', amount: amountPence + extra },
      });
    };

    const onPaymentMethod = async (ev) => {
      if (payLock.current || disabled) {
        ev.complete('fail');
        return;
      }

      payLock.current = true;
      try {
        const shippingCost = Number(ev.shippingOption?.amount || 0) / 100;
        const intent = await createIntent({
          shippingCost,
          shippingAddress: mapPaymentRequestShipping(ev),
          guestEmail: ev.payerEmail || null,
        });

        if (!intent?.success || !intent.data?.clientSecret) {
          ev.complete('fail');
          return;
        }

        const { clientSecret, paymentIntentId } = intent.data;
        sessionStorage.setItem('stripePaymentIntentId', paymentIntentId);

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false },
        );

        if (error) {
          ev.complete('fail');
          return;
        }

        ev.complete('success');

        if (paymentIntent?.status === 'requires_action') {
          const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
          if (actionError) return;
        }

        const result = await confirmExpressPayment(paymentIntentId);
        if (result?.success) {
          navigate('/checkout/success', { state: { order: result.data } });
        }
      } catch (error) {
        console.error('[Google Pay] Payment Request failed', error);
        ev.complete('fail');
      } finally {
        payLock.current = false;
      }
    };

    pr.on('shippingaddresschange', onShippingAddressChange);
    pr.on('shippingoptionchange', onShippingOptionChange);
    pr.on('paymentmethod', onPaymentMethod);

    pr.canMakePayment().then((result) => {
      if (cancelled) return;
      if (result) {
        setWalletRequest(pr);
        onAvailabilityChange?.(true);
        return;
      }
      setWalletRequest(null);
    });

    return () => {
      cancelled = true;
      pr.off('shippingaddresschange');
      pr.off('shippingoptionchange');
      pr.off('paymentmethod');
      setWalletRequest(null);
    };
  }, [
    amountPence,
    createIntent,
    disabled,
    isGoogle,
    navigate,
    onAvailabilityChange,
    stripe,
  ]);

  const handleClick = useCallback(
    (event) => {
      pendingIntent.current = createIntent({ shippingCost: 0 });
      event.resolve({
        lineItems: lineItemsFor(amountPence, 0),
        emailRequired: false,
        phoneNumberRequired: false,
        billingAddressRequired: false,
        shippingAddressRequired: true,
        shippingRates: WALLET_SHIPPING_RATES,
        allowedShippingCountries: ['GB'],
      });
    },
    [amountPence, createIntent],
  );

  const handleConfirm = useCallback(
    async (event) => {
      if (!stripe || !elements || payLock.current || disabled) {
        event.paymentFailed({ reason: 'fail' });
        return;
      }

      payLock.current = true;
      try {
        const shipping = shippingFromWalletRate(event.shippingRate);
        const shippingCost = shipping.shippingCost;

        const intentPromise =
          pendingIntent.current ||
          createIntent({
            shippingCost,
            shippingAddress: mapWalletAddressToOrder(event),
            guestEmail: event.billingDetails?.email || null,
          });
        pendingIntent.current = null;

        const { error: submitError } = await elements.submit();
        if (submitError) {
          event.paymentFailed({ reason: 'fail' });
          return;
        }

        const intent = await intentPromise;
        if (!intent?.success || !intent.data?.clientSecret) {
          event.paymentFailed({ reason: 'fail' });
          return;
        }

        const { clientSecret, paymentIntentId } = intent.data;
        sessionStorage.setItem('stripePaymentIntentId', paymentIntentId);

        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success`,
          },
        });

        if (error) {
          event.paymentFailed({ reason: 'fail' });
          return;
        }

        if (
          paymentIntent?.status === 'processing' ||
          paymentIntent?.status === 'requires_action' ||
          !paymentIntent
        ) {
          return;
        }

        if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'requires_capture') {
          event.paymentFailed({ reason: 'fail' });
          return;
        }

        const result = await confirmExpressPayment(paymentIntentId);
        if (!result?.success) {
          event.paymentFailed({ reason: 'fail' });
          return;
        }

        navigate('/checkout/success', { state: { order: result.data } });
      } catch (error) {
        console.error('[Express checkout] confirm failed', error);
        event.paymentFailed({ reason: 'fail' });
      } finally {
        payLock.current = false;
      }
    },
    [createIntent, disabled, elements, navigate, stripe],
  );

  const handleShippingAddressChange = useCallback(
    (event) => {
      event.resolve({
        lineItems: lineItemsFor(amountPence, 0),
        shippingRates: WALLET_SHIPPING_RATES,
      });
    },
    [amountPence],
  );

  const handleShippingRateChange = useCallback((event) => {
    event.resolve({
      lineItems: lineItemsFor(amountPence, Number(event.shippingRate?.amount || 0)),
    });
  }, [amountPence]);

  const handleCancel = useCallback(() => {
    pendingIntent.current = null;
    payLock.current = false;
  }, []);

  const walletAvailable = useCallback(
    (methods) => {
      if (!methods) return;
      const appleOn = Boolean(methods.applePay?.available ?? methods.applePay);
      const googleOn = Boolean(methods.googlePay?.available ?? methods.googlePay);
      onAvailabilityChange?.(appleOn || googleOn);
    },
    [onAvailabilityChange],
  );

  const expressOptions = useMemo(
    () => ({
      emailRequired: false,
      phoneNumberRequired: false,
      billingAddressRequired: false,
      shippingAddressRequired: false,
      lineItems: lineItemsFor(amountPence, 0),
      paymentMethodOrder: isApple ? ['apple_pay'] : ['google_pay'],
      paymentMethods: {
        applePay: isApple ? 'always' : 'never',
        googlePay: isApple ? 'never' : 'always',
        paypal: 'never',
        klarna: 'never',
        link: 'never',
        amazonPay: 'never',
      },
      buttonType: {
        applePay: 'buy',
        googlePay: 'buy',
      },
      buttonTheme: {
        applePay: 'black',
        googlePay: 'black',
      },
      buttonHeight: 48,
      layout: { maxColumns: 1, maxRows: 1, overflow: 'never' },
    }),
    [amountPence, isApple],
  );

  const busyClass = disabled ? 'opacity-60 pointer-events-none' : '';

  if (isGoogle && walletRequest) {
    return (
      <div className={`h-12 overflow-hidden rounded-sm ${busyClass}`}>
        <PaymentRequestButtonElement
          options={{
            paymentRequest: walletRequest,
            style: {
              paymentRequestButton: {
                type: 'buy',
                theme: 'dark',
                height: '48px',
              },
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-12 ${busyClass}`}>
      <ExpressCheckoutElement
        onClick={handleClick}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onShippingAddressChange={handleShippingAddressChange}
        onShippingRateChange={handleShippingRateChange}
        onLoadError={() => {}}
        onReady={({ availablePaymentMethods }) => {
          walletAvailable(availablePaymentMethods);
        }}
        onAvailablePaymentMethodsChange={({ paymentMethods }) => walletAvailable(paymentMethods)}
        options={expressOptions}
      />
    </div>
  );
}

function PayPalPaymentForm({
  productId,
  colorId,
  storageOptionId,
  quantity,
  amountPence,
  disabled,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(true);
  const [paying, setPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!elements || !amountPence) return;
    elements.update({ amount: amountPence }).catch(() => {});
  }, [elements, amountPence]);

  const handlePayPal = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || paying || disabled) return;

    setPaying(true);
    setErrorMessage('');
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || 'PayPal could not start.');
        return;
      }

      const intent = await createExpressCheckoutIntent({
        productId,
        colorId,
        storageOptionId,
        quantity,
        shippingMethod: 'Standard Delivery',
        shippingCost: 0,
        shippingAddress: null,
        guestEmail: null,
        paymentMethodTypes: ['paypal'],
      });

      if (!intent?.success || !intent.data?.clientSecret) {
        setErrorMessage(intent?.message || 'Unable to start PayPal payment.');
        return;
      }

      sessionStorage.setItem('stripePaymentIntentId', intent.data.paymentIntentId);

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret: intent.data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'PayPal payment failed.');
      }
    } catch (error) {
      console.error('[PayPal] Payment Element confirm failed', error);
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (!available) return null;

  return (
    <form onSubmit={handlePayPal} className="relative space-y-2">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
      >
        <PaymentElement
          onReady={() => setReady(true)}
          onLoadError={() => setAvailable(false)}
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['paypal'],
            terms: { paypal: 'never' },
            wallets: {
              applePay: 'never',
              googlePay: 'never',
              link: 'never',
            },
          }}
        />
      </div>
      {errorMessage ? (
        <p className="text-sm text-red-500">{errorMessage}</p>
      ) : null}
      <button
        type="submit"
        disabled={!stripe || !ready || paying || disabled}
        className="flex h-11 w-full items-center justify-center rounded-sm bg-[#FFC439] text-sm font-semibold text-[#003087] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {paying ? <span className="loading loading-spinner loading-xs" /> : 'Pay with PayPal'}
      </button>
    </form>
  );
}

export default function ProductExpressCheckout({
  productId,
  colorId,
  storageOptionId,
  quantity,
  amount,
  disabled,
  walletType,
  onAvailabilityChange,
}) {
  const [stripePromise, setStripePromise] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const amountPence = Math.max(50, Math.round((Number(amount) || 0) * 100));
  const walletElementsOptions = useMemo(
    () => ({
      mode: 'payment',
      amount: amountPence,
      currency: 'gbp',
      paymentMethodTypes: ['card'],
    }),
    [amountPence],
  );
  const paypalElementsOptions = useMemo(
    () => ({
      mode: 'payment',
      amount: amountPence,
      currency: 'gbp',
      paymentMethodTypes: ['paypal'],
    }),
    [amountPence],
  );

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
      <div className="h-12 flex items-center justify-center rounded-sm bg-[#F6F7F9]">
        <span className="loading loading-spinner loading-xs text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {walletType === 'apple' || walletType === 'google' ? (
        <Elements stripe={stripePromise} options={walletElementsOptions}>
          <WalletCheckoutForm
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
      ) : null}
      <Elements stripe={stripePromise} options={paypalElementsOptions}>
        <PayPalPaymentForm
          productId={productId}
          colorId={colorId}
          storageOptionId={storageOptionId}
          quantity={quantity}
          amountPence={amountPence}
          disabled={disabled}
        />
      </Elements>
    </div>
  );
}
