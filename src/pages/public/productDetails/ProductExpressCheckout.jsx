import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Elements,
  ExpressCheckoutElement,
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
  const [processing, setProcessing] = useState(false);
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
      setProcessing(true);
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
        setProcessing(false);
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

  const prefetchIntent = (shippingCost = 0) => {
    pendingIntent.current = createExpressCheckoutIntent({
      productId,
      colorId,
      storageOptionId,
      quantity,
      shippingMethod: shippingCost >= 15 ? 'Express Delivery' : 'Standard Delivery',
      shippingCost,
      shippingAddress: null,
      guestEmail: null,
    }).catch((error) => {
      console.error('[PayPal] Failed to start payment intent', error);
      return null;
    });
  };

  const handleClick = (event) => {
    const walletPay =
      event.expressPaymentType === 'paypal' || event.expressPaymentType === 'klarna';
    lastWallet.current = event.expressPaymentType;
    event.resolve({
      lineItems: lineItemsFor(amountPence, 0),
      emailRequired: false,
      phoneNumberRequired: false,
      billingAddressRequired: false,
      shippingAddressRequired: !walletPay,
      ...(walletPay
        ? {}
        : {
            shippingRates: WALLET_SHIPPING_RATES,
            allowedShippingCountries: ['GB'],
          }),
    });
    prefetchIntent(0);
  };

  const handleConfirm = async (event) => {
    if (!stripe || !elements || processing || disabled) {
      event.paymentFailed({ reason: 'fail' });
      return;
    }

    setProcessing(true);
    try {
      const shipping = shippingFromWalletRate(event.shippingRate);
      const walletPay =
        event.expressPaymentType === 'paypal' || event.expressPaymentType === 'klarna';
      const shippingCost = walletPay ? 0 : shipping.shippingCost;

      const intentPromise =
        pendingIntent.current ||
        createExpressCheckoutIntent({
          productId,
          colorId,
          storageOptionId,
          quantity,
          shippingMethod: shippingCost >= 15 ? 'Express Delivery' : 'Standard Delivery',
          shippingCost,
          shippingAddress: mapWalletAddressToOrder(event),
          guestEmail: event.billingDetails?.email || null,
        });
      pendingIntent.current = null;

      const [{ error: submitError }, intent] = await Promise.all([
        elements.submit(),
        intentPromise,
      ]);

      if (submitError) {
        event.paymentFailed({ reason: 'fail' });
        return;
      }

      if (!intent?.success || !intent.data?.clientSecret) {
        event.paymentFailed({ reason: 'fail' });
        return;
      }

      const { clientSecret, paymentIntentId } = intent.data;
      sessionStorage.setItem('stripePaymentIntentId', paymentIntentId);

      // Express Checkout + PayPal must use the default redirect. `if_required`
      // leaves the PayPal popup stuck on "Taking you to PayPal".
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
      setProcessing(false);
    }
  };

  const walletAvailable = (methods) => {
    if (!methods) return;
    const available = isApple
      ? Boolean(methods.applePay?.available ?? methods.applePay)
      : Boolean(methods.googlePay?.available ?? methods.googlePay);
    onAvailabilityChange?.(available || Boolean(walletRequest));
  };

  return (
    <div className={`space-y-3 ${processing || disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {walletRequest && !isApple ? (
        <div className="h-12 overflow-hidden rounded-sm">
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
      ) : (
        <div className="min-h-12">
          <ExpressCheckoutElement
          onClick={handleClick}
          onConfirm={handleConfirm}
          onShippingAddressChange={(event) => {
            const walletPay =
              lastWallet.current === 'paypal' || lastWallet.current === 'klarna';
            event.resolve({
              lineItems: lineItemsFor(amountPence, 0),
              ...(walletPay ? {} : { shippingRates: WALLET_SHIPPING_RATES }),
            });
          }}
          onShippingRateChange={(event) => {
            event.resolve({
              lineItems: lineItemsFor(amountPence, Number(event.shippingRate?.amount || 0)),
            });
          }}
          onLoadError={() => {}}
          onReady={({ availablePaymentMethods }) => {
            walletAvailable(availablePaymentMethods);
            if (isApple) onAvailabilityChange?.(true);
          }}
          onAvailablePaymentMethodsChange={({ paymentMethods }) => walletAvailable(paymentMethods)}
          options={{
            emailRequired: false,
            phoneNumberRequired: false,
            billingAddressRequired: false,
            shippingAddressRequired: false,
            lineItems: lineItemsFor(amountPence, 0),
            paymentMethodOrder: ['apple_pay', 'google_pay', 'paypal', 'klarna'],
            paymentMethods: {
              applePay: isApple ? 'always' : 'never',
              googlePay: isApple ? 'never' : 'always',
              paypal: 'auto',
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
          }}
          />
        </div>
      )}
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
  walletType,
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
      <div className="h-12 flex items-center justify-center rounded-sm bg-[#F6F7F9]">
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
  );
}
