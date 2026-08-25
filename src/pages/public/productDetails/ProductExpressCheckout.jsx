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
  const [walletRequest, setWalletRequest] = useState(null);
  const payLock = useRef(false);
  const pendingIntent = useRef(null);
  const lastWallet = useRef(null);
  const isApple = walletType === 'apple';

  useEffect(() => {
    if (!elements || !amountPence) return;
    elements.update({ amount: amountPence }).catch(() => {});
  }, [elements, amountPence]);

  useEffect(() => {
    if (!stripe || isApple) return undefined;

    const pr = stripe.paymentRequest({
      country: 'GB',
      currency: 'gbp',
      total: { label: 'Zephyr Technology', amount: amountPence },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestShipping: true,
      shippingOptions: PR_SHIPPING_OPTIONS,
      disableWallets: ['applePay', 'link', 'browserCard'],
    });

    pr.canMakePayment()
      .then((result) => {
        if (result?.googlePay) {
          setWalletRequest(pr);
          onAvailabilityChange?.(true);
        }
      })
      .catch(() => {});

    const onShippingAddressChange = (ev) => {
      ev.updateWith({ status: 'success', shippingOptions: PR_SHIPPING_OPTIONS });
    };

    const onShippingOptionChange = (ev) => {
      const shippingPence = Number(ev.shippingOption?.amount || 0);
      ev.updateWith({
        status: 'success',
        total: { label: 'Zephyr Technology', amount: amountPence + shippingPence },
      });
    };

    const onPaymentMethod = async (ev) => {
      if (payLock.current) {
        ev.complete('fail');
        return;
      }
      payLock.current = true;
      try {
        const shipping = shippingFromWalletRate(ev.shippingOption);
        const intent = await createExpressCheckoutIntent({
          productId,
          colorId,
          storageOptionId,
          quantity,
          shippingMethod: shipping.shippingMethod,
          shippingCost: shipping.shippingCost,
          shippingAddress: mapPaymentRequestShipping(ev),
          guestEmail: ev.payerEmail || null,
        });

        if (!intent?.success || !intent.data?.clientSecret) {
          ev.complete('fail');
          return;
        }

        const { error } = await stripe.confirmCardPayment(
          intent.data.clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false },
        );

        if (error) {
          ev.complete('fail');
          return;
        }

        ev.complete('success');
        sessionStorage.setItem('stripePaymentIntentId', intent.data.paymentIntentId);
        const result = await confirmExpressPayment(intent.data.paymentIntentId);
        if (result?.success) {
          navigate('/checkout/success', { state: { order: result.data } });
        }
      } catch {
        ev.complete('fail');
      } finally {
        payLock.current = false;
      }
    };

    pr.on('shippingaddresschange', onShippingAddressChange);
    pr.on('shippingoptionchange', onShippingOptionChange);
    pr.on('paymentmethod', onPaymentMethod);
    return () => {
      pr.off('shippingaddresschange', onShippingAddressChange);
      pr.off('shippingoptionchange', onShippingOptionChange);
      pr.off('paymentmethod', onPaymentMethod);
    };
  }, [
    stripe,
    isApple,
    amountPence,
    productId,
    colorId,
    storageOptionId,
    quantity,
    navigate,
    onAvailabilityChange,
  ]);

  useEffect(() => {
    if (!walletRequest || walletRequest.isShowing()) return;
    walletRequest.update({
      total: { label: 'Zephyr Technology', amount: amountPence },
    });
  }, [walletRequest, amountPence]);

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
      }).catch((error) => {
        console.error('[Express checkout] Failed to start payment intent', error);
        return null;
      }),
    [productId, colorId, storageOptionId, quantity],
  );

  const handleClick = useCallback(
    (event) => {
      lastWallet.current = event.expressPaymentType;
      pendingIntent.current = createIntent({ shippingCost: 0 });
      event.resolve({
        lineItems: lineItemsFor(amountPence, 0),
        emailRequired: false,
        phoneNumberRequired: false,
        billingAddressRequired: false,
        shippingAddressRequired: event.expressPaymentType !== 'klarna',
        ...(event.expressPaymentType === 'klarna'
          ? {}
          : {
              shippingRates: WALLET_SHIPPING_RATES,
              allowedShippingCountries: ['GB'],
            }),
      });
    },
    [amountPence, createIntent],
  );

  const handleConfirm = useCallback(
    async (event) => {
      const walletPay =
        event.expressPaymentType === 'paypal' || event.expressPaymentType === 'klarna';

      if (!stripe || !elements || payLock.current || disabled) {
        event.paymentFailed({ reason: 'fail' });
        return;
      }

      payLock.current = true;
      try {
        const shipping = shippingFromWalletRate(event.shippingRate);
        const shippingCost = walletPay ? 0 : shipping.shippingCost;

        const intentPromise =
          pendingIntent.current ||
          createIntent({
            shippingCost,
            shippingAddress: mapWalletAddressToOrder(event),
            guestEmail: event.billingDetails?.email || null,
          });
        pendingIntent.current = null;

        if (!walletPay) {
          const { error: submitError } = await elements.submit();
          if (submitError) {
            event.paymentFailed({ reason: 'fail' });
            return;
          }
        }

        const intent = await intentPromise;
        if (!intent?.success || !intent.data?.clientSecret) {
          event.paymentFailed({ reason: 'fail' });
          return;
        }

        const { clientSecret, paymentIntentId } = intent.data;
        sessionStorage.setItem('stripePaymentIntentId', paymentIntentId);

        // Never use redirect: 'if_required' here — PayPal stays on
        // "Taking you to PayPal" and never opens the login sheet.
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

        // Redirect wallets leave this tab; confirmPayment may resolve empty.
        if (
          walletPay ||
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
      if (lastWallet.current === 'paypal' || lastWallet.current === 'klarna') {
        event.resolve({ lineItems: lineItemsFor(amountPence, 0) });
        return;
      }
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
      const klarnaOn = Boolean(methods.klarna?.available ?? methods.klarna);
      const appleOn = Boolean(methods.applePay?.available ?? methods.applePay);
      const googleOn = Boolean(methods.googlePay?.available ?? methods.googlePay);
      onAvailabilityChange?.(klarnaOn || appleOn || googleOn || Boolean(walletRequest));
    },
    [onAvailabilityChange, walletRequest],
  );

  const expressOptions = useMemo(
    () => ({
      emailRequired: false,
      phoneNumberRequired: false,
      billingAddressRequired: false,
      shippingAddressRequired: false,
      lineItems: lineItemsFor(amountPence, 0),
      paymentMethodOrder: ['apple_pay', 'google_pay', 'klarna'],
      paymentMethods: {
        applePay: isApple ? 'always' : 'never',
        googlePay: isApple || walletRequest ? 'never' : 'always',
        paypal: 'never',
        klarna: 'auto',
        link: 'never',
        amazonPay: 'never',
      },
      buttonType: {
        applePay: 'buy',
        googlePay: 'buy',
        paypal: 'paypal',
      },
      buttonTheme: {
        applePay: 'black',
        googlePay: 'black',
        paypal: 'blue',
      },
      buttonHeight: 48,
      layout: { maxColumns: 3, maxRows: 2, overflow: 'auto' },
    }),
    [amountPence, isApple, walletRequest],
  );

  const showGooglePayButton = Boolean(walletRequest && !isApple);

  return (
    <div className="space-y-3">
      {showGooglePayButton ? (
        <div className={`h-12 overflow-hidden rounded-sm ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
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
      ) : null}
      <div className={`min-h-12 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
        <ExpressCheckoutElement
          onClick={handleClick}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onShippingAddressChange={handleShippingAddressChange}
          onShippingRateChange={handleShippingRateChange}
          onLoadError={() => {}}
          onReady={({ availablePaymentMethods }) => {
            walletAvailable(availablePaymentMethods);
            if (isApple) onAvailabilityChange?.(true);
          }}
          onAvailablePaymentMethodsChange={({ paymentMethods }) => walletAvailable(paymentMethods)}
          options={expressOptions}
        />
      </div>
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
      paymentMethodTypes: ['card', 'klarna'],
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
