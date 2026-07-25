const CHECKOUT_ITEMS_KEY = 'checkoutCartItemIds';
const BUY_NOW_KEY = 'buyNowProduct';

export function setCheckoutCartItemIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    sessionStorage.removeItem(CHECKOUT_ITEMS_KEY);
    return;
  }
  sessionStorage.removeItem(BUY_NOW_KEY);
  sessionStorage.setItem(CHECKOUT_ITEMS_KEY, JSON.stringify(ids));
}

export function readCheckoutCartItemIds() {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_ITEMS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function setBuyNowProduct(product) {
  if (!product?.productId) {
    sessionStorage.removeItem(BUY_NOW_KEY);
    return;
  }
  sessionStorage.removeItem(CHECKOUT_ITEMS_KEY);
  sessionStorage.setItem(BUY_NOW_KEY, JSON.stringify(product));
}

export function readBuyNowProduct() {
  try {
    const raw = sessionStorage.getItem(BUY_NOW_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.productId ? parsed : null;
  } catch {
    return null;
  }
}

export function clearCheckoutCartItemIds() {
  sessionStorage.removeItem(CHECKOUT_ITEMS_KEY);
}

export function clearBuyNowProduct() {
  sessionStorage.removeItem(BUY_NOW_KEY);
}

export function clearCheckoutSession() {
  clearCheckoutCartItemIds();
  clearBuyNowProduct();
}
