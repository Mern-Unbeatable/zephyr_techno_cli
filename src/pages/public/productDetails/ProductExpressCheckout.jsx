import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router";
import {
  Elements,
  PaymentRequestButtonElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { getStripe } from "../../../utils/stripe";
import {
  confirmExpressPayment,
  createExpressCheckoutIntent,
  checkout,
} from "../../../utils/cartApi";
import PayPalWordmark from "../../../components/shared/PayPalWordmark";

const STANDARD_SHIPPING = {
  id: "standard",
  displayName: "Standard Delivery",
  amount: 0,
};

const EXPRESS_SHIPPING = {
  id: "express",
  displayName: "Express Delivery",
  amount: 1500,
};

const WALLET_SHIPPING_RATES = [STANDARD_SHIPPING, EXPRESS_SHIPPING];

const PR_SHIPPING_OPTIONS = [
  {
    id: "standard",
    label: "Standard Delivery",
    detail: "3-5 working days",
    amount: 0,
  },
  {
    id: "express",
    label: "Express Delivery",
    detail: "1-2 working days",
    amount: 1500,
  },
];

function shippingRatesForVariant(expressDeliveryEnabled = true) {
  if (expressDeliveryEnabled) return WALLET_SHIPPING_RATES;
  return [STANDARD_SHIPPING];
}

function paymentRequestOptionsForVariant(expressDeliveryEnabled = true) {
  if (expressDeliveryEnabled) return PR_SHIPPING_OPTIONS;
  return PR_SHIPPING_OPTIONS.filter((option) => option.id !== "express");
}

function shippingFromWalletRate(rate) {
  const amountPence = Number(rate?.amount || 0);
  const isExpress = rate?.id === "express" || amountPence >= 1500;
  return {
    shippingMethod: isExpress ? "Express Delivery" : "Standard Delivery",
    shippingCost: amountPence / 100,
  };
}

function lineItemsFor(amountPence, shippingPence = 0) {
  const items = [{ name: "Subtotal", amount: amountPence }];
  if (shippingPence > 0) {
    items.push({ name: "Express Delivery", amount: shippingPence });
  } else {
    items.push({ name: "Standard Delivery", amount: 0 });
  }
  return items;
}

function mapWalletAddressToOrder(event) {
  const shipping = event.shippingAddress;
  if (!shipping?.address) return null;
  const addr = shipping.address;
  const street = [addr.line1, addr.line2].filter(Boolean).join(", ");
  if (!street) return null;
  return {
    fullName: shipping.name || event.billingDetails?.name || "Customer",
    phone: event.billingDetails?.phone || null,
    street,
    city: addr.city,
    state: addr.state || null,
    zipCode: addr.postal_code,
    country:
      addr.country === "GB"
        ? "United Kingdom"
        : addr.country || "United Kingdom",
  };
}

function mapPaymentRequestShipping(ev) {
  const addr = ev.shippingAddress;
  if (!addr) return null;
  const line1 = addr.addressLine?.[0] || addr.address?.line1;
  const line2 = addr.addressLine?.[1] || addr.address?.line2;
  const street = [line1, line2].filter(Boolean).join(", ");
  if (!street) return null;
  return {
    fullName: addr.recipient || ev.payerName || "Customer",
    phone: addr.phone || ev.payerPhone || null,
    street,
    city: addr.city,
    state: addr.region || null,
    zipCode: addr.postalCode,
    country:
      addr.country === "GB"
        ? "United Kingdom"
        : addr.country || "United Kingdom",
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
  expressDeliveryEnabled = true,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const payLock = useRef(false);
  const [walletRequest, setWalletRequest] = useState(null);
  const isApple = walletType === "apple";
  const isGoogle = walletType === "google";
  const walletShippingRates = useMemo(
    () => shippingRatesForVariant(expressDeliveryEnabled),
    [expressDeliveryEnabled],
  );
  const paymentRequestShippingOptions = useMemo(
    () => paymentRequestOptionsForVariant(expressDeliveryEnabled),
    [expressDeliveryEnabled],
  );

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
        shippingMethod:
          !expressDeliveryEnabled || shippingCost < 15
            ? "Standard Delivery"
            : "Express Delivery",
        shippingCost: expressDeliveryEnabled ? shippingCost : 0,
        shippingAddress,
        guestEmail,
        paymentMethodTypes: ["card"],
      }).catch((error) => {
        console.error(
          "[Express checkout] Failed to start payment intent",
          error,
        );
        return null;
      }),
    [productId, colorId, storageOptionId, quantity, expressDeliveryEnabled],
  );

  useEffect(() => {
    if (!stripe || !(isApple || isGoogle) || !amountPence) {
      setWalletRequest(null);
      return undefined;
    }

    let cancelled = false;
    const requests = [];

    const onShippingAddressChange = (ev) => {
      ev.updateWith({
        status: "success",
        shippingOptions: paymentRequestShippingOptions,
        total: { label: "Zephyr Technology", amount: amountPence },
      });
    };

    const onShippingOptionChange = (ev) => {
      const extra = Number(ev.shippingOption?.amount || 0);
      ev.updateWith({
        status: "success",
        total: { label: "Zephyr Technology", amount: amountPence + extra },
      });
    };

    const onPaymentMethod = async (ev) => {
      if (payLock.current || disabled) {
        ev.complete("fail");
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
          ev.complete("fail");
          return;
        }

        const { clientSecret, paymentIntentId } = intent.data;
        sessionStorage.setItem("stripePaymentIntentId", paymentIntentId);

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false },
        );

        if (error) {
          ev.complete("fail");
          return;
        }

        ev.complete("success");

        if (paymentIntent?.status === "requires_action") {
          const { error: actionError } =
            await stripe.confirmCardPayment(clientSecret);
          if (actionError) return;
        }

        const result = await confirmExpressPayment(paymentIntentId);
        if (result?.success) {
          navigate("/checkout/success", { state: { order: result.data } });
        }
      } catch (error) {
        console.error("[Wallet] Payment Request failed", error);
        ev.complete("fail");
      } finally {
        payLock.current = false;
      }
    };

    const makeRequest = (withShipping) => {
      const pr = stripe.paymentRequest({
        country: "GB",
        currency: "gbp",
        total: {
          label: "Zephyr Technology",
          amount: amountPence,
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestPayerPhone: true,
        ...(withShipping
          ? {
              requestShipping: true,
              shippingOptions: paymentRequestShippingOptions,
            }
          : {}),
      });
      pr.on("shippingaddresschange", onShippingAddressChange);
      pr.on("shippingoptionchange", onShippingOptionChange);
      pr.on("paymentmethod", onPaymentMethod);
      requests.push(pr);
      return pr;
    };

    const isUsable = (result) => {
      if (!result) return false;
      if (isApple) return Boolean(result.applePay);
      return Boolean(result.googlePay || result.applePay);
    };

    (async () => {
      const withShipping = makeRequest(true);
      const first = await withShipping.canMakePayment();
      if (cancelled) return;
      if (isUsable(first)) {
        setWalletRequest(withShipping);
        onAvailabilityChange?.(true);
        return;
      }

      const withoutShipping = makeRequest(false);
      const second = await withoutShipping.canMakePayment();
      if (cancelled) return;
      if (isUsable(second)) {
        setWalletRequest(withoutShipping);
        onAvailabilityChange?.(true);
        return;
      }

      setWalletRequest(null);
    })();

    return () => {
      cancelled = true;
      requests.forEach((pr) => {
        pr.off("shippingaddresschange");
        pr.off("shippingoptionchange");
        pr.off("paymentmethod");
      });
      setWalletRequest(null);
    };
  }, [
    amountPence,
    createIntent,
    disabled,
    isApple,
    isGoogle,
    navigate,
    onAvailabilityChange,
    stripe,
  ]);

  const busyClass = disabled ? "opacity-60 pointer-events-none" : "";

  if (walletRequest) {
    return (
      <div className={`h-12 overflow-hidden rounded-sm ${busyClass}`}>
        <PaymentRequestButtonElement
          options={{
            paymentRequest: walletRequest,
            style: {
              paymentRequestButton: {
                type: "buy",
                theme: "dark",
                height: "48px",
              },
            },
          }}
        />
      </div>
    );
  }

  return null;
}

function PayPalCheckoutButton({
  productId,
  colorId,
  storageOptionId,
  quantity,
  disabled,
  expressDeliveryEnabled = true,
}) {
  const [paying, setPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePayPal = async (event) => {
    event.preventDefault();
    if (paying || disabled) return;

    setPaying(true);
    setErrorMessage("");
    try {
      const stripe = await getStripe();
      const intent = await createExpressCheckoutIntent({
        productId,
        colorId,
        storageOptionId,
        quantity,
        shippingMethod: "Standard Delivery",
        shippingCost: 0,
        paymentMethodTypes: ["paypal"],
      });

      if (!intent?.success || !intent.data?.clientSecret) {
        setErrorMessage(
          intent?.message || "Unable to start PayPal checkout.",
        );
        setPaying(false);
        return;
      }

      const { clientSecret, paymentIntentId } = intent.data;
      sessionStorage.setItem("stripePaymentIntentId", paymentIntentId);
      if (intent.data?.orderId) {
        sessionStorage.setItem("pendingOrderId", intent.data.orderId);
      }

      const { error } = await stripe.confirmPayPalPayment(clientSecret, {
        return_url: `${window.location.origin}/checkout/success`,
      });

      if (error) {
        setErrorMessage(error.message || "PayPal checkout was cancelled.");
        setPaying(false);
      }
    } catch (error) {
      console.error("[PayPal] Direct checkout failed", error);
      setErrorMessage("Something went wrong. Please try again.");
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handlePayPal} className="space-y-2">
      {errorMessage ? (
        <p className="text-sm text-red-500">{errorMessage}</p>
      ) : null}
      <button
        type="submit"
        disabled={paying || disabled}
        className="flex h-[45px] w-full items-center justify-center gap-2 rounded-[4px] bg-[#FFC439] transition hover:brightness-[0.98] active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {paying ? (
          <span className="loading loading-spinner loading-xs text-[#003087]" />
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="text-[14px] font-medium leading-none text-[#2C2E2F]">
              Pay with
            </span>
            <PayPalWordmark className="h-[19px] w-auto" />
          </span>
        )}
      </button>
      {!expressDeliveryEnabled ? (
        <p className="text-[11px] text-gray-500">
          PayPal checkout uses Standard Delivery for this variant.
        </p>
      ) : null}
    </form>
  );
}

function KlarnaWordmark() {
  return (
    <span className="inline-flex items-center rounded-md bg-[#FFB3C7] px-2.5 py-[3px] text-[15px] font-black leading-none tracking-tight text-[#0B051D]">
      Klarna
    </span>
  );
}

function KlarnaPaymentForm({
  productId,
  colorId,
  storageOptionId,
  quantity,
  disabled,
}) {
  const [paying, setPaying] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleKlarna = async (event) => {
    event.preventDefault();
    if (paying || disabled) return;

    setPaying(true);
    setErrorMessage("");
    try {
      await checkout({
        directProduct: { productId, colorId, storageOptionId, quantity },
        collectAddressOnStripe: true,
      });
      // Checkout will redirect the user
    } catch (error) {
      console.error("[Klarna] Checkout failed", error);
      setErrorMessage("Something went wrong. Please try again.");
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handleKlarna} className="relative space-y-2">
      {errorMessage ? (
        <p className="text-sm text-red-500">{errorMessage}</p>
      ) : null}
      <button
        type="submit"
        disabled={paying || disabled}
        className="flex h-11 w-full items-center justify-center rounded-md bg-[#0B051D] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {paying ? (
          <span className="loading loading-spinner loading-xs text-white" />
        ) : (
          <span className="flex items-center gap-2">
            <span className="text-sm font-semibold leading-none text-white">
              Pay with
            </span>
            <KlarnaWordmark />
          </span>
        )}
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
  expressDeliveryEnabled = true,
}) {
  const [stripePromise, setStripePromise] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const amountPence = Math.max(50, Math.round((Number(amount) || 0) * 100));
  const walletElementsOptions = useMemo(
    () => ({
      mode: "payment",
      amount: amountPence,
      currency: "gbp",
      paymentMethodTypes: ["card"],
    }),
    [amountPence],
  );

  useEffect(() => {
    if (walletType !== "apple" && walletType !== "google") return undefined;

    getStripe()
      .then(setStripePromise)
      .catch(() => {
        setLoadError(true);
        onAvailabilityChange?.(false);
      });

    return undefined;
  }, [onAvailabilityChange, walletType]);

  return (
    <div className="space-y-3">
      {!expressDeliveryEnabled ? (
        <p className="text-xs text-gray-500">
          Express Delivery is not available for this colour / storage. Standard
          Delivery only.
        </p>
      ) : null}
      {walletType === "apple" || walletType === "google" ? (
        loadError ? null : stripePromise ? (
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
              expressDeliveryEnabled={expressDeliveryEnabled}
            />
          </Elements>
        ) : (
          <div className="h-12 flex items-center justify-center rounded-sm bg-[#F6F7F9]">
            <span className="loading loading-spinner loading-xs text-gray-400" />
          </div>
        )
      ) : null}
      <PayPalCheckoutButton
        productId={productId}
        colorId={colorId}
        storageOptionId={storageOptionId}
        quantity={quantity}
        disabled={disabled}
        expressDeliveryEnabled={expressDeliveryEnabled}
      />
      <KlarnaPaymentForm
        productId={productId}
        colorId={colorId}
        storageOptionId={storageOptionId}
        quantity={quantity}
        disabled={disabled}
      />
    </div>
  );
}
