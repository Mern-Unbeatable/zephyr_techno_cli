import { Check } from 'lucide-react';
import React, { useState, useRef, useMemo } from 'react';
import { useLocation } from 'react-router';
import Container from '../../../layout/Container';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { checkout, validatePromo } from '../../../utils/cartApi';
import { filterUkCounties } from '../../../data/ukCounties';
import {
  clearCheckoutSession,
  readCheckoutCartItemIds,
  readBuyNowProduct,
} from '../../../utils/checkoutSession';

const EXPRESS_COST = 15;

const Checkout = () => {
    const location = useLocation();
    const { cartItems } = useCart();
    const { isAuthenticated } = useAuth();

    const buyNowProduct = useMemo(() => {
        const fromSession = readBuyNowProduct();
        if (fromSession) return fromSession;
        const fromNav = location.state?.buyNow;
        return fromNav?.productId ? fromNav : null;
    }, [location.key, location.state]);

    const checkoutItemIds = useMemo(
        () => (buyNowProduct ? null : readCheckoutCartItemIds()),
        [location.key, buyNowProduct],
    );

    const isBuyNowCheckout = Boolean(buyNowProduct);

    const activeCartItems = useMemo(() => {
        if (isBuyNowCheckout) return [];
        if (!checkoutItemIds?.length) return cartItems;
        return cartItems.filter((item) => checkoutItemIds.includes(item.id));
    }, [cartItems, checkoutItemIds, isBuyNowCheckout]);

    const activeSubtotal = useMemo(() => {
        if (isBuyNowCheckout) {
            const unitPrice = Number(buyNowProduct.unitPrice) || 0;
            const qty = Number(buyNowProduct.quantity) || 1;
            return unitPrice * qty;
        }
        return activeCartItems.reduce((sum, item) => sum + (item.total ?? 0), 0);
    }, [activeCartItems, isBuyNowCheckout, buyNowProduct]);
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [promoCode, setPromoCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoResult, setPromoResult] = useState(null); // { discount, finalTotal, promoCode }
    const [promoError, setPromoError] = useState('');
    const [countyOpen, setCountyOpen] = useState(false);
    const countyBlurTimer = useRef(null);

    const [form, setForm] = useState({
        email: '',
        fullName: '',
        country: 'United Kingdom',
        street: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
    });

    const countySuggestions = useMemo(
        () => filterUkCounties(form.state),
        [form.state],
    );

    const shippingCost = shippingMethod === 'express' ? EXPRESS_COST : 0;
    const baseTotal = activeSubtotal + shippingCost;
    const discount = promoResult?.discount ?? 0;
    const total = promoResult ? promoResult.finalTotal + shippingCost : baseTotal;

    const handleChange = (e) => {
      const { name, value } = e.target;
      // Sanitize phone input to allow only digits and common phone characters
      if (name === 'phone') {
        const sanitized = value.replace(/[^\d+()\-\s]/g, '');
        setForm((prev) => ({ ...prev, [name]: sanitized }));
      } else {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
    };

    const handleCountyFocus = () => {
      if (countyBlurTimer.current) clearTimeout(countyBlurTimer.current);
      setCountyOpen(true);
    };

    const handleCountyBlur = () => {
      countyBlurTimer.current = setTimeout(() => setCountyOpen(false), 150);
    };

    const selectCounty = (county) => {
      setForm((prev) => ({ ...prev, state: county }));
      setCountyOpen(false);
    };

    const handleApplyPromo = async () => {
        if (isBuyNowCheckout) {
            setPromoError('Promo codes cannot be applied to Buy Now checkout.');
            return;
        }
        if (!promoCode.trim()) return;
        setPromoError('');
        setPromoResult(null);
        setPromoLoading(true);
        try {
            const cartItemIds = activeCartItems.map((i) => i.id);
            const res = await validatePromo({ promoCode: promoCode.trim(), cartItemIds });
            if (res.success && res.data?.valid) {
                setPromoResult(res.data);
            } else {
                setPromoError(res.message || 'Invalid promo code.');
            }
        } catch {
            setPromoError('Failed to validate promo code.');
        } finally {
            setPromoLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        setError('');

        if (!form.fullName || !form.street || !form.city || !form.zipCode || !form.phone) {
            setError('Please fill in all required shipping address fields.');
            return;
        }
        if (!isAuthenticated && !form.email) {
            setError('Please enter your email address.');
            return;
        }
        if (!isBuyNowCheckout && activeCartItems.length === 0) {
            setError('Your cart is empty.');
            return;
        }

        try {
            setSubmitting(true);
            const streetLine = form.street.trim();
            const addressLine2 = form.addressLine2.trim();
            const street = addressLine2 ? `${streetLine}, ${addressLine2}` : streetLine;

            const checkoutPayload = {
                guestEmail: isAuthenticated ? undefined : form.email,
                shippingAddress: {
                    fullName: form.fullName.trim(),
                    phone: form.phone.trim(),
                    street,
                    city: form.city.trim(),
                    state: form.state.trim() || undefined,
                    zipCode: form.zipCode.trim().toUpperCase(),
                    country: form.country,
                },
                shippingMethod: shippingMethod === 'express' ? 'Express Delivery' : 'Standard Delivery',
                shippingCost,
                promoCode: isBuyNowCheckout ? null : promoCode || null,
            };

            if (isBuyNowCheckout) {
                checkoutPayload.directProduct = {
                    productId: buyNowProduct.productId,
                    colorId: buyNowProduct.colorId,
                    storageOptionId: buyNowProduct.storageOptionId,
                    ramOptionId: buyNowProduct.ramOptionId,
                    quantity: buyNowProduct.quantity,
                };
            } else {
                checkoutPayload.cartItemIds =
                    checkoutItemIds || activeCartItems.map((i) => i.id);
            }

            await checkout(checkoutPayload);
            // checkout() redirects to Stripe on success — code below only runs on API error
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Container>
        <div className="flex flex-col lg:flex-row gap-16 py-10 lg:py-14">
          {/* LEFT COLUMN */}
          <div className="flex-1 flex flex-col gap-16">
            {/* Contact Information — only shown for guests */}
            {!isAuthenticated && (
            <section className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-baseline">
                <h1 className="text-2xl md:text-3xl font-bold text-[#151A2A]">Contact Information</h1>
                <a href="/login" className="text-sm font-semibold text-custom hover:underline md:whitespace-nowrap md:ml-4">
                  Already have an account? Log in
                </a>
              </div>

                <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-[0.55px] text-[#6B7280]">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={handleChange}
                    className="h-12 px-4 border border-[#E5E7EB] rounded-sm text-base text-[#151A2A] placeholder-[#6B7280] focus:outline-none focus:border-custom focus:ring-1 focus:ring-custom bg-white"
                />
              </div>
            </section>
            )}

            {/* Shipping Address */}
            <section className="flex flex-col gap-6">
              <h2 className="text-3xl font-bold text-[#151A2A]">Shipping Address</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name — full width */}
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-[0.55px] text-[#6B7280]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="John Smith"
                    value={form.fullName}
                    onChange={handleChange}
                    className="h-12 px-4 border border-[#E5E7EB] rounded-sm text-base text-[#151A2A] placeholder-[#6B7280] focus:outline-none focus:border-custom focus:ring-1 focus:ring-custom bg-white"
                  />
                </div>

                {/* Country — UK only */}
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-[0.55px] text-[#6B7280]">
                    Country
                  </label>
                  <div className="h-12 px-4 border border-[#E5E7EB] rounded-sm text-base text-[#151A2A] bg-[#F9FAFB] flex items-center">
                    United Kingdom
                  </div>
                </div>

                {/* Address Line 1 — full width */}
                  <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-[0.55px] text-[#6B7280]">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    name="street"
                    placeholder="221B Baker Street"
                    value={form.street}
                    onChange={handleChange}
                    className="h-12 px-4 border border-[#E5E7EB] rounded-sm text-base text-[#151A2A] placeholder-[#6B7280] focus:outline-none focus:border-custom focus:ring-1 focus:ring-custom bg-white"
                  />
                </div>

                {/* Address Line 2 (Optional) */}
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-[0.55px] text-[#6B7280]">
                    Address Line 2 <span className="font-normal normal-case tracking-normal text-[#9CA3AF]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    placeholder="Flat 2"
                    value={form.addressLine2}
                    onChange={handleChange}
                    className="h-12 px-4 border border-[#E5E7EB] rounded-sm text-base text-[#151A2A] placeholder-[#6B7280] focus:outline-none focus:border-custom focus:ring-1 focus:ring-custom bg-white"
                  />
                </div>

                {/* Town / City */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-[0.55px] text-[#6B7280]">Town / City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="London"
                    value={form.city}
                    onChange={handleChange}
                    className="h-12 px-4 border border-[#E5E7EB] rounded-sm text-base text-[#151A2A] placeholder-[#6B7280] focus:outline-none focus:border-custom focus:ring-1 focus:ring-custom bg-white"
                  />
                </div>

                {/* County + Postcode */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-xs font-bold uppercase tracking-[0.55px] text-[#6B7280]">
                      County <span className="font-normal normal-case tracking-normal text-[#9CA3AF]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      placeholder="Greater London"
                      value={form.state}
                      onChange={handleChange}
                      onFocus={handleCountyFocus}
                      onBlur={handleCountyBlur}
                      autoComplete="address-level1"
                      className="h-12 px-4 border border-[#E5E7EB] rounded-sm text-base text-[#151A2A] placeholder-[#6B7280] focus:outline-none focus:border-custom focus:ring-1 focus:ring-custom bg-white"
                    />
                    {countyOpen && countySuggestions.length > 0 && (
                      <ul
                        className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-sm border border-[#E5E7EB] bg-white py-1 shadow-lg"
                        role="listbox"
                      >
                        {countySuggestions.map((county) => (
                          <li key={county} role="option">
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => selectCounty(county)}
                              className="w-full px-4 py-2.5 text-left text-sm text-[#151A2A] hover:bg-[#F0F4F6] transition-colors"
                            >
                              {county}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-[0.55px] text-[#6B7280]">Postcode</label>
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="NW1 6XE"
                      value={form.zipCode}
                      onChange={handleChange}
                      autoComplete="postal-code"
                      className="h-12 px-4 border border-[#E5E7EB] rounded-sm text-base text-[#151A2A] placeholder-[#6B7280] focus:outline-none focus:border-custom focus:ring-1 focus:ring-custom bg-white"
                    />
                  </div>
                </div>

                {/* Phone Number — full width */}
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-[0.55px] text-[#6B7280]">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+44"
                    value={form.phone}
                    onChange={handleChange}
                    inputMode="tel"
                    autoComplete="tel"
                    pattern="[0-9()+\-\s]*"
                    className="h-12 px-4 border border-[#E5E7EB] rounded-sm text-base text-[#151A2A] placeholder-[#6B7280] focus:outline-none focus:border-custom focus:ring-1 focus:ring-custom bg-white"
                  />
                </div>
              </div>
            </section>

            {/* Shipping Method */}
            <section className="flex flex-col gap-6">
              <h2 className="text-3xl font-bold text-[#151A2A]">Shipping Method</h2>

              <div className="flex flex-col gap-3">
                {/* Standard Delivery */}
                <button
                  type="button"
                  onClick={() => setShippingMethod("standard")}
                  className={`flex justify-between items-center p-4 border-2 transition-colors text-left ${
                    shippingMethod === "standard"
                      ? "border-custom"
                      : "border-[#E5E7EB]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border-4 transition-colors ${
                        shippingMethod === "standard"
                          ? "border-custom"
                          : "border-[#D1D5DB]"
                      }`}
                    />
                    <div>
                      <p className={`text-sm font-bold leading-5 ${shippingMethod === "standard" ? "text-[#151A2A]" : "text-[#9CA3AF]"}`}>
                        Standard Delivery
                      </p>
                      <p className={`text-xs leading-4 ${shippingMethod === "standard" ? "text-[#6B7280]" : "text-[#9CA3AF]"}`}>
                        3-5 Business Days
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${shippingMethod === "standard" ? "text-[#151A2A]" : "text-[#9CA3AF]"}`}>
                    Free
                  </span>
                </button>

                {/* Express Delivery */}
                <button
                  type="button"
                  onClick={() => setShippingMethod("express")}
                  className={`flex justify-between items-center p-4 border-2 transition-colors text-left ${
                    shippingMethod === "express"
                      ? "border-custom"
                      : "border-[#E5E7EB]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border-4 transition-colors ${
                        shippingMethod === "express"
                          ? "border-custom"
                          : "border-[#D1D5DB]"
                      }`}
                    />
                    <div>
                      <p className={`text-sm font-bold leading-5 ${shippingMethod === "express" ? "text-[#151A2A]" : "text-[#9CA3AF]"}`}>
                        Express Delivery
                      </p>
                      <p className={`text-xs leading-4 ${shippingMethod === "express" ? "text-[#6B7280]" : "text-[#9CA3AF]"}`}>
                        1-2 Business Days
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${shippingMethod === "express" ? "text-[#151A2A]" : "text-[#9CA3AF]"}`}>
                    £{EXPRESS_COST}.00
                  </span>
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN — Order Summary */}
          <aside className="w-full lg:w-143 lg:shrink-0">
            <div className="bg-[#F0F4F6] rounded-xl shadow-sm p-8 flex flex-col gap-6">
              <h2 className="text-3xl font-bold text-[#171C1E]">Order Summary</h2>

              {/* Line Items */}
              <div className="flex flex-col gap-4">
                {isBuyNowCheckout && (
                  <div className="flex justify-between items-start gap-4 pb-2 border-b border-[#D1D5DB]">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#171C1E] truncate">
                        {buyNowProduct.title || 'Selected product'}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        Qty: {Number(buyNowProduct.quantity) || 1}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-[#3D494C] shrink-0">
                      £{activeSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-base text-[#3D494C]">Subtotal</span>
                  <span className="text-base text-[#3D494C]">£{activeSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base text-[#3D494C]">Shipping</span>
                  <span className="text-base font-medium text-[#006878]">
                    {shippingMethod === "standard" ? "Free" : `£${EXPRESS_COST}.00`}
                  </span>
                </div>
                {promoResult && (
                  <div className="flex justify-between items-center">
                    <span className="text-base text-green-600">Discount ({promoResult.promoCode?.code})</span>
                    <span className="text-base font-medium text-green-600">-£{promoResult.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              {/* Promo Code */}
              {!isBuyNowCheckout && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value); setPromoResult(null); setPromoError(''); }}
                      className="flex-1 h-12 px-4 border border-[#BDC9CC] rounded-lg text-sm text-[#151A2A] placeholder-[#6B7280] focus:outline-none focus:border-custom focus:ring-1 focus:ring-custom bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoCode.trim()}
                      className="px-4 py-2 bg-[#171C1E] text-white text-sm rounded-lg hover:bg-[#2a3035] transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {promoLoading ? <span className="loading loading-spinner loading-xs"></span> : 'Apply'}
                    </button>
                  </div>
                  {promoError && <p className="text-xs text-red-500">{promoError}</p>}
                  {promoResult && <p className="text-xs text-green-600">✓ Promo applied! You save £{promoResult.discount.toFixed(2)}</p>}
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-6 border-t border-[#BDC9CC]">
                <span className="text-base text-[#171C1E]">Total</span>
                <span className="text-[40px] font-bold text-[#171C1E] leading-[1.2] tracking-[-0.4px]">
                  £{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
              )}

              {/* Place Order */}
              <button
                onClick={handlePlaceOrder}
                disabled={submitting || (!isBuyNowCheckout && activeCartItems.length === 0)}
                className="w-full h-12 bg-custom hover:bg-[#2fa3bb] text-white text-sm font-bold uppercase tracking-wide rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </aside>
        </div>
            </Container>
        </div>
    );
};

export default Checkout;