import {
  getOrCreateGuestSessionId,
  getGuestSessionId,
  clearGuestSessionId,
} from "./guestSession";
import { clearCheckoutSession } from "./checkoutSession";

const BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://api.zephyrtechnology.co.uk";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAccessToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("auth") || "{}").token || null;
      } catch {
        return null;
      }
    })()
  );
}

function isLoggedIn() {
  return !!getAccessToken();
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAccessToken()}`,
  };
}

function guestHeaders() {
  return { "Content-Type": "application/json" };
}

// ─── Cart Migration (guest → authenticated) ──────────────────────────────────

export async function migrateGuestCart(token) {
  const guestSessionId = getGuestSessionId();
  if (!guestSessionId || !token) return;
  try {
    await fetch(`${BASE_URL}/api/cart/migrate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ guestSessionId }),
    });
  } finally {
    clearGuestSessionId();
  }
}

// ─── Cart Operations ──────────────────────────────────────────────────────────

export async function addToCart({
  productId,
  colorId,
  storageOptionId,
  quantity,
}) {
  const body = { productId, colorId, storageOptionId, quantity };

  if (isLoggedIn()) {
    const res = await fetch(`${BASE_URL}/api/cart`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to add to cart",
      };
    }
    return data;
  }

  const guestSessionId = getOrCreateGuestSessionId();
  const res = await fetch(`${BASE_URL}/api/cart`, {
    method: "POST",
    headers: guestHeaders(),
    body: JSON.stringify({ guestSessionId, ...body }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      message: data?.message || "Failed to add to cart",
    };
  }
  return data;
}

export async function getCart() {
  if (isLoggedIn()) {
    return fetch(`${BASE_URL}/api/cart`, { headers: authHeaders() }).then((r) =>
      r.json(),
    );
  }
  const guestSessionId = getOrCreateGuestSessionId();
  return fetch(`${BASE_URL}/api/cart?guestSessionId=${guestSessionId}`).then(
    (r) => r.json(),
  );
}

export async function updateCartItem(cartItemId, quantity) {
  if (isLoggedIn()) {
    return fetch(`${BASE_URL}/api/cart/${cartItemId}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ quantity }),
    }).then((r) => r.json());
  }
  const guestSessionId = getOrCreateGuestSessionId();
  return fetch(`${BASE_URL}/api/cart/${cartItemId}`, {
    method: "PATCH",
    headers: guestHeaders(),
    body: JSON.stringify({ guestSessionId, quantity }),
  }).then((r) => r.json());
}

export async function removeCartItem(cartItemId) {
  if (isLoggedIn()) {
    return fetch(`${BASE_URL}/api/cart/${cartItemId}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then((r) => r.json());
  }
  const guestSessionId = getOrCreateGuestSessionId();
  return fetch(`${BASE_URL}/api/cart/${cartItemId}`, {
    method: "DELETE",
    headers: guestHeaders(),
    body: JSON.stringify({ guestSessionId }),
  }).then((r) => r.json());
}

export async function clearCart() {
  if (isLoggedIn()) {
    return fetch(`${BASE_URL}/api/cart`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then((r) => r.json());
  }
  const guestSessionId = getOrCreateGuestSessionId();
  return fetch(`${BASE_URL}/api/cart`, {
    method: "DELETE",
    headers: guestHeaders(),
    body: JSON.stringify({ guestSessionId }),
  }).then((r) => r.json());
}

// ─── Promo Code Validation ────────────────────────────────────────────────────

export async function validatePromo({ promoCode, cartItemIds = [] }) {
  const body = { promoCode, cartItemIds };
  if (!isLoggedIn()) {
    body.guestSessionId = getOrCreateGuestSessionId();
  }
  const res = await fetch(`${BASE_URL}/api/public/product/promo/validate`, {
    method: "POST",
    headers: isLoggedIn() ? authHeaders() : guestHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

// Persist Stripe refs in both session + local storage so PayPal redirects
// (which often wipe sessionStorage on mobile) can still confirm the order.
function setCheckoutRef(key, value) {
  if (!value || typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, value);
    localStorage.setItem(key, value);
  } catch {
    // ignore storage failures
  }
}

function getCheckoutRef(key) {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(key) || localStorage.getItem(key) || null;
  } catch {
    return null;
  }
}

function clearCheckoutRefs() {
  if (typeof window === "undefined") return;
  for (const key of [
    "stripePaymentIntentId",
    "stripeSessionId",
    "pendingOrderId",
  ]) {
    try {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export async function checkout({
  guestEmail,
  shippingAddress,
  shippingMethod,
  shippingCost,
  promoCode,
  cartItemIds,
  directProduct,
  collectAddressOnStripe = false,
} = {}) {
  const shared = {
    shippingMethod: shippingMethod || "Standard Delivery",
    shippingCost: shippingCost || 0,
    promoCode: promoCode || null,
    collectAddressOnStripe: Boolean(collectAddressOnStripe),
  };

  if (shippingAddress) {
    shared.shippingAddress = shippingAddress;
  }

  if (directProduct?.productId) {
    Object.assign(shared, {
      productId: directProduct.productId,
      colorId: directProduct.colorId || null,
      storageOptionId: directProduct.storageOptionId || null,
      quantity: directProduct.quantity || 1,
    });
  } else {
    shared.cartItemIds = cartItemIds || [];
  }

  let body;
  let headers;

  if (isLoggedIn()) {
    headers = authHeaders();
    body = { ...shared };
  } else {
    headers = guestHeaders();
    const guestSessionId = getOrCreateGuestSessionId();
    body = { guestSessionId, guestEmail, ...shared };
  }

  const res = await fetch(`${BASE_URL}/api/public/product/checkout`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (data.success) {
    clearCheckoutSession();
    clearCheckoutRefs();
    setCheckoutRef("stripeSessionId", data.data.sessionId);
    setCheckoutRef("pendingOrderId", data.data.orderId);
    window.location.href = data.data.checkoutUrl;
  }

  return data;
}

export {
  setCheckoutRef,
  getCheckoutRef,
  clearCheckoutRefs,
};

// ─── Express Checkout (Apple Pay / Google Pay / PayPal / Klarna) ─────────────

export async function createExpressCheckoutIntent({
  productId,
  colorId,
  storageOptionId,
  quantity,
  shippingMethod,
  shippingCost,
  shippingAddress,
  guestEmail,
  paymentMethodTypes,
}) {
  const body = {
    productId,
    colorId: colorId || null,
    storageOptionId: storageOptionId || null,
    quantity: quantity || 1,
    shippingMethod,
    shippingCost,
    shippingAddress: shippingAddress || null,
    guestEmail: guestEmail || undefined,
    paymentMethodTypes: paymentMethodTypes || undefined,
  };

  let headers;
  if (isLoggedIn()) {
    headers = authHeaders();
  } else {
    headers = guestHeaders();
    body.guestSessionId = getOrCreateGuestSessionId();
  }

  const res = await fetch(
    `${BASE_URL}/api/public/product/express-checkout/intent`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
  );

  return res.json();
}

export async function confirmExpressPayment(paymentIntentId) {
  const id = paymentIntentId || getCheckoutRef("stripePaymentIntentId");
  if (!id) throw new Error("No pending payment intent found");

  const res = await fetch(
    `${BASE_URL}/api/public/product/express-checkout/confirm`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId: id }),
    },
  );

  const data = await res.json();

  if (data.success) {
    clearCheckoutRefs();
    if (!isLoggedIn()) {
      clearGuestSessionId();
    }
  }

  return data;
}

// ─── Cancel unpaid checkout draft ─────────────────────────────────────────────

export async function cancelUnpaidCheckout(orderId) {
  const id = orderId || sessionStorage.getItem("pendingOrderId");
  if (!id) return { success: true };

  try {
    const res = await fetch(`${BASE_URL}/api/public/product/checkout/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id }),
    });
    const data = await res.json().catch(() => ({}));
    clearCheckoutRefs();
    return data;
  } catch {
    return { success: false };
  }
}

// ─── Payment Confirmation ─────────────────────────────────────────────────────

export async function confirmPayment() {
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;

  const redirectedIntentId = params?.get("payment_intent") || null;
  const redirectedSessionId = params?.get("session_id") || null;
  const redirectedOrderId = params?.get("orderId") || null;

  const paymentIntentId =
    redirectedIntentId || getCheckoutRef("stripePaymentIntentId");
  if (paymentIntentId) {
    return confirmExpressPayment(paymentIntentId);
  }

  const sessionId = redirectedSessionId || getCheckoutRef("stripeSessionId");
  const orderId = redirectedOrderId || getCheckoutRef("pendingOrderId");

  if (!sessionId && !orderId) {
    throw new Error("No pending Stripe session found");
  }

  const res = await fetch(`${BASE_URL}/api/public/product/checkout/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(sessionId ? { sessionId } : {}),
      ...(orderId ? { orderId } : {}),
    }),
  });

  const data = await res.json();

  if (data.success) {
    clearCheckoutRefs();
    if (!isLoggedIn()) {
      clearGuestSessionId();
    }
  }

  return data;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function getOrders({ page = 1, limit = 20, status } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (status) params.append("status", status);

  return fetch(`${BASE_URL}/api/orders?${params}`, {
    headers: authHeaders(),
  }).then((r) => r.json());
}

export async function cancelOrder(orderId, reason) {
  return fetch(`${BASE_URL}/api/orders/${orderId}/cancel`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ reason }),
  }).then((r) => r.json());
}
