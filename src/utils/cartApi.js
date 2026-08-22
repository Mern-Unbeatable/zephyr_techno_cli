import { getOrCreateGuestSessionId, getGuestSessionId, clearGuestSessionId } from './guestSession';
import { clearCheckoutSession } from './checkoutSession';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.zephyrtechnology.co.uk';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAccessToken() {
  return (
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem('auth') || '{}').token || null;
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
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAccessToken()}`,
  };
}

function guestHeaders() {
  return { 'Content-Type': 'application/json' };
}

// ─── Cart Migration (guest → authenticated) ──────────────────────────────────

export async function migrateGuestCart(token) {
  const guestSessionId = getGuestSessionId();
  if (!guestSessionId || !token) return;
  try {
    await fetch(`${BASE_URL}/api/cart/migrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ guestSessionId }),
    });
  } finally {
    clearGuestSessionId();
  }
}

// ─── Cart Operations ──────────────────────────────────────────────────────────

export async function addToCart({ productId, colorId, storageOptionId, quantity }) {
  const body = { productId, colorId, storageOptionId, quantity };

  if (isLoggedIn()) {
    const res = await fetch(`${BASE_URL}/api/cart`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, message: data?.message || 'Failed to add to cart' };
    }
    return data;
  }

  const guestSessionId = getOrCreateGuestSessionId();
  const res = await fetch(`${BASE_URL}/api/cart`, {
    method: 'POST',
    headers: guestHeaders(),
    body: JSON.stringify({ guestSessionId, ...body }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data?.message || 'Failed to add to cart' };
  }
  return data;
}

export async function getCart() {
  if (isLoggedIn()) {
    return fetch(`${BASE_URL}/api/cart`, { headers: authHeaders() }).then((r) => r.json());
  }
  const guestSessionId = getOrCreateGuestSessionId();
  return fetch(`${BASE_URL}/api/cart?guestSessionId=${guestSessionId}`).then((r) => r.json());
}

export async function updateCartItem(cartItemId, quantity) {
  if (isLoggedIn()) {
    return fetch(`${BASE_URL}/api/cart/${cartItemId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ quantity }),
    }).then((r) => r.json());
  }
  const guestSessionId = getOrCreateGuestSessionId();
  return fetch(`${BASE_URL}/api/cart/${cartItemId}`, {
    method: 'PATCH',
    headers: guestHeaders(),
    body: JSON.stringify({ guestSessionId, quantity }),
  }).then((r) => r.json());
}

export async function removeCartItem(cartItemId) {
  if (isLoggedIn()) {
    return fetch(`${BASE_URL}/api/cart/${cartItemId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((r) => r.json());
  }
  const guestSessionId = getOrCreateGuestSessionId();
  return fetch(`${BASE_URL}/api/cart/${cartItemId}`, {
    method: 'DELETE',
    headers: guestHeaders(),
    body: JSON.stringify({ guestSessionId }),
  }).then((r) => r.json());
}

export async function clearCart() {
  if (isLoggedIn()) {
    return fetch(`${BASE_URL}/api/cart`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((r) => r.json());
  }
  const guestSessionId = getOrCreateGuestSessionId();
  return fetch(`${BASE_URL}/api/cart`, {
    method: 'DELETE',
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
    method: 'POST',
    headers: isLoggedIn() ? authHeaders() : guestHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
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
    shippingMethod: shippingMethod || 'Standard Delivery',
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
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (data.success) {
    clearCheckoutSession();
    sessionStorage.setItem('stripeSessionId', data.data.sessionId);
    sessionStorage.setItem('pendingOrderId', data.data.orderId);
    window.location.href = data.data.checkoutUrl;
  }

  return data;
}

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
  };

  let headers;
  if (isLoggedIn()) {
    headers = authHeaders();
  } else {
    headers = guestHeaders();
    body.guestSessionId = getOrCreateGuestSessionId();
  }

  const res = await fetch(`${BASE_URL}/api/public/product/express-checkout/intent`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return res.json();
}

export async function confirmExpressPayment(paymentIntentId) {
  const id = paymentIntentId || sessionStorage.getItem('stripePaymentIntentId');
  if (!id) throw new Error('No pending payment intent found');

  const res = await fetch(`${BASE_URL}/api/public/product/express-checkout/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentIntentId: id }),
  });

  const data = await res.json();

  if (data.success) {
    sessionStorage.removeItem('stripePaymentIntentId');
    sessionStorage.removeItem('pendingOrderId');
    if (!isLoggedIn()) {
      clearGuestSessionId();
    }
  }

  return data;
}

// ─── Cancel unpaid checkout draft ─────────────────────────────────────────────

export async function cancelUnpaidCheckout(orderId) {
  const id = orderId || sessionStorage.getItem('pendingOrderId');
  if (!id) return { success: true };

  try {
    const res = await fetch(`${BASE_URL}/api/public/product/checkout/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: id }),
    });
    const data = await res.json().catch(() => ({}));
    sessionStorage.removeItem('stripeSessionId');
    sessionStorage.removeItem('pendingOrderId');
    return data;
  } catch {
    return { success: false };
  }
}

// ─── Payment Confirmation ─────────────────────────────────────────────────────

export async function confirmPayment() {
  const redirectedIntentId =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('payment_intent')
      : null;
  const paymentIntentId =
    redirectedIntentId || sessionStorage.getItem('stripePaymentIntentId');
  if (paymentIntentId) {
    return confirmExpressPayment(paymentIntentId);
  }

  const sessionId = sessionStorage.getItem('stripeSessionId');
  if (!sessionId) throw new Error('No pending Stripe session found');

  const res = await fetch(`${BASE_URL}/api/public/product/checkout/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });

  const data = await res.json();

  if (data.success) {
    sessionStorage.removeItem('stripeSessionId');
    sessionStorage.removeItem('pendingOrderId');
    if (!isLoggedIn()) {
      clearGuestSessionId();
    }
  }

  return data;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function getOrders({ page = 1, limit = 20, status } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (status) params.append('status', status);

  return fetch(`${BASE_URL}/api/orders?${params}`, {
    headers: authHeaders(),
  }).then((r) => r.json());
}

export async function cancelOrder(orderId, reason) {
  return fetch(`${BASE_URL}/api/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ reason }),
  }).then((r) => r.json());
}
