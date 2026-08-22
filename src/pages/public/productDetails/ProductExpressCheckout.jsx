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

const PR_SHIPPING_OPTIONS = [
  {
    id: 'standard',
    label: 'Standard Delivery',
    detail: 'UK delivery',
    amount: 0,
  },
];

function methodAvailable(methods, key) {
  const value = methods?.[key];
  return Boolean(value?.available ?? value);
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

function ExpressCheckoutForm({
  productId,
  colorId,
  storageOptionId,
  quantity,
  amountPence,
  disabled,
  walletType,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [googlePayRequest, setGooglePayRequest] = useState(null);
  const [showExpressWallets, setShowExpressWallets] = useState(true);
  const payLock = useRef(false);

  useEffect(() => {
    if (!elements || !amountPence) return;
    elements.update({ amount: amountPence }).catch(() => {});
  }, [elements, amountPence]);

  useEffect(() => {
    if (!stripe || walletType === 'apple') return undefined;

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
        if (result?.googlePay) setGooglePayRequest(pr);
      })
      .catch(() => {});

    const onShippingAddressChange = (ev) => {
      ev.updateWith({ status: 'success', shippingOptions: PR_SHIPPING_OPTIONS });
    };

    const onPaymentMethod = async (ev) => {
      if (payLock.current) {
        ev.complete('fail');
        return;
      }
      payLock.current = true;
      setProcessing(true);
      try {
        const intent = await createExpressCheckoutIntent({
          productId,
          colorId,
          storageOptionId,
          quantity,
          shippingMethod: 'Standard Delivery',
          shippingCost: 0,
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
    pr.on('paymentmethod', onPaymentMethod);
    return () => {
      pr.off('shippingaddresschange', onShippingAddressChange);
      pr.off('paymentmethod', onPaymentMethod);
    };
  }, [
    stripe,
    walletType,
    amountPence,
    productId,
    colorId,
    storageOptionId,
    quantity,
    navigate,
  ]);

  useEffect(() => {
    if (!googlePayRequest || googlePayRequest.isShowing()) return;
    googlePayRequest.update({
      total: { label: 'Zephyr Technology', amount: amountPence },
    });
  }, [googlePayRequest, amountPence]);

  const handleClick = (event) => {
    event.resolve({
      emailRequired: true,
      phoneNumberRequired: true,
      billingAddressRequired: true,
      shippingAddressRequired: true,
      allowedShippingCountries: ['GB'],
      lineItems: [{ name: 'Order total', amount: amountPence }],
      shippingRates: [STANDARD_SHIPPING],
    });
  };

  const handleShippingAddressChange = (event) => {
    event.resolve({
      lineItems: [{ name: 'Order total', amount: amountPence }],
      shippingRates: [STANDARD_SHIPPING],
    });
  };

  const handleShippingRateChange = (event) => {
    event.resolve({
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
        shippingAddress: mapWalletAddressToOrder(event),
        guestEmail: event.billingDetails?.email || null,
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
    <div className={`space-y-3 ${processing || disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {googlePayRequest ? (
        <div className="h-12 overflow-hidden rounded-sm">
          <PaymentRequestButtonElement
            options={{
              paymentRequest: googlePayRequest,
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

      {showExpressWallets ? (
        <ExpressCheckoutElement
          onClick={handleClick}
          onConfirm={handleConfirm}
          onShippingAddressChange={handleShippingAddressChange}
          onShippingRateChange={handleShippingRateChange}
          onReady={({ availablePaymentMethods }) => {
            if (!availablePaymentMethods) return;
            const available =
              methodAvailable(availablePaymentMethods, 'applePay') ||
              methodAvailable(availablePaymentMethods, 'paypal') ||
              methodAvailable(availablePaymentMethods, 'klarna') ||
              (walletType !== 'apple' && methodAvailable(availablePaymentMethods, 'googlePay'));
            setShowExpressWallets(available || walletType === 'apple');
          }}
          onAvailablePaymentMethodsChange={({ paymentMethods }) => {
            if (!paymentMethods) return;
            const available =
              methodAvailable(paymentMethods, 'applePay') ||
              methodAvailable(paymentMethods, 'paypal') ||
              methodAvailable(paymentMethods, 'klarna');
            if (walletType === 'apple') {
              setShowExpressWallets(available || methodAvailable(paymentMethods, 'applePay'));
            } else {
              setShowExpressWallets(available);
            }
          }}
          options={{
            emailRequired: true,
            phoneNumberRequired: true,
            billingAddressRequired: true,
            shippingAddressRequired: true,
            allowedShippingCountries: ['GB'],
            lineItems: [{ name: 'Order total', amount: amountPence }],
            shippingRates: [STANDARD_SHIPPING],
            paymentMethodOrder:
              walletType === 'apple'
                ? ['apple_pay', 'paypal', 'klarna']
                : ['paypal', 'klarna', 'google_pay'],
            paymentMethods: {
              applePay: walletType === 'apple' ? 'always' : 'never',
              googlePay: 'never',
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
      ) : null}
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
}) {
  const [stripePromise, setStripePromise] = useState(null);
  const amountPence = Math.max(50, Math.round((Number(amount) || 0) * 100));

  useEffect(() => {
    getStripe().then(setStripePromise).catch(() => setStripePromise(null));
  }, []);

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
      />
    </Elements>
  );
}
