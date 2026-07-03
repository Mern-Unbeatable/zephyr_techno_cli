import { getOrCreateGuestSessionId, getGuestSessionId, clearGuestSessionId } from './guestSession';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

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

export async function addToCart({ productId, colorId, storageOptionId, ramOptionId, quantity }) {
  if (isLoggedIn()) {
    return fetch(`${BASE_URL}/api/cart`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ productId, colorId, storageOptionId, ramOptionId, quantity }),
    }).then((r) => r.json());
  }

  const guestSessionId = getOrCreateGuestSessionId();
  return fetch(`${BASE_URL}/api/cart`, {
    method: 'POST',
    headers: guestHeaders(),
    body: JSON.stringify({ guestSessionId, productId, colorId, storageOptionId, ramOptionId, quantity }),
  }).then((r) => r.json());
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

export async function checkout({ guestEmail, shippingAddress, shippingMethod, shippingCost, promoCode, cartItemIds } = {}) {
  let body;
  let headers;

  if (isLoggedIn()) {
    headers = authHeaders();
    body = {
      cartItemIds: cartItemIds || [],
      shippingAddress,
      shippingMethod: shippingMethod || 'Standard Delivery',
      shippingCost: shippingCost || 0,
      promoCode: promoCode || null,
    };
  } else {
    headers = guestHeaders();
    const guestSessionId = getOrCreateGuestSessionId();
    body = {
      guestSessionId,
      guestEmail,
      cartItemIds: cartItemIds || [],
      shippingAddress,
      shippingMethod: shippingMethod || 'Standard Delivery',
      shippingCost: shippingCost || 0,
      promoCode: promoCode || null,
    };
  }

  const res = await fetch(`${BASE_URL}/api/public/product/checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (data.success) {
    sessionStorage.setItem('stripeSessionId', data.data.sessionId);
    sessionStorage.setItem('pendingOrderId', data.data.orderId);
    window.location.href = data.data.checkoutUrl;
  }

  return data;
}

// ─── Payment Confirmation ─────────────────────────────────────────────────────

export async function confirmPayment() {
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
