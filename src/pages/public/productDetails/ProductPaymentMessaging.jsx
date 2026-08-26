import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Elements, PaymentMethodMessagingElement } from '@stripe/react-stripe-js';
import { FiX } from 'react-icons/fi';
import { getStripe } from '../../../utils/stripe';

function formatGbp(value) {
  const amount = Number(value) || 0;
  return amount.toLocaleString('en-GB', {
    style: 'currency',
    currency: 'GBP',
  });
}

function splitAmount(total, parts) {
  const pence = Math.round((Number(total) || 0) * 100);
  const base = Math.floor(pence / parts);
  const remainder = pence - base * parts;
  return Array.from({ length: parts }, (_, index) =>
    (base + (index < remainder ? 1 : 0)) / 100,
  );
}

function ClearpayMark() {
  return (
    <span className="inline-flex h-6 items-center rounded bg-[#B2FCE4] px-1.5 text-[10px] font-black tracking-tight text-black">
      clearpay
    </span>
  );
}

function KlarnaMark() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-[#FFB3C7] text-xs font-black text-[#0A0B09]">
      K
    </span>
  );
}

function PayPalMark() {
  return (
    <span className="text-[15px] font-semibold italic tracking-tight text-[#003087]">
      Pay<span className="text-[#009CDE]">Pal</span>
    </span>
  );
}

export default function ProductPaymentMessaging({ amount }) {
  const [stripePromise, setStripePromise] = useState(null);
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const total = Math.max(0, Number(amount) || 0);
  const amountPence = Math.max(50, Math.round(total * 100));

  const plans = useMemo(() => {
    const [clearpay] = splitAmount(total, 4);
    const [klarna] = splitAmount(total, 3);
    return [
      {
        id: 'clearpay',
        title: `4 payments of ${formatGbp(clearpay)} every 2 weeks, interest-free`,
        mark: <ClearpayMark />,
      },
      {
        id: 'klarna-monthly',
        title: `3 payments of ${formatGbp(klarna)} monthly, interest-free`,
        mark: <KlarnaMark />,
      },
      {
        id: 'klarna-later',
        title: `${formatGbp(total)} in 30 days interest-free`,
        mark: <KlarnaMark />,
      },
      {
        id: 'paypal',
        title: 'Pay in full with PayPal',
        mark: <PayPalMark />,
      },
    ];
  }, [total]);

  useEffect(() => {
    getStripe().then(setStripePromise).catch(() => setStripePromise(null));
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (total < 0.5) return null;

  return (
    <>
      <div className="relative mt-3 min-h-10">
        {stripePromise ? (
          <Elements stripe={stripePromise} key={amountPence}>
            <PaymentMethodMessagingElement
              options={{
                amount: amountPence,
                currency: 'GBP',
                countryCode: 'GB',
                paymentMethodTypes: ['klarna', 'afterpay_clearpay'],
                logoColor: 'color',
              }}
            />
          </Elements>
        ) : null}
        <button
          type="button"
          className="absolute inset-0 z-10 cursor-pointer"
          aria-label="See payment plans"
          onClick={() => setOpen(true)}
        />
      </div>

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  key="pay-plans-overlay"
                  className="fixed inset-0 z-100 flex items-center justify-center bg-black/45 p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.22, ease: 'easeOut' }
                  }
                  onClick={() => setOpen(false)}
                >
                  <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="pay-options-title"
                    className="w-full max-w-[420px] overflow-hidden rounded-[20px] bg-white p-5 shadow-2xl"
                    initial={
                      prefersReducedMotion
                        ? { opacity: 1 }
                        : { opacity: 0, y: 28, scale: 0.94 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 16, scale: 0.96 }
                    }
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 420, damping: 32, mass: 0.85 }
                    }
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="relative pr-8">
                      <h2
                        id="pay-options-title"
                        className="text-[22px] font-bold leading-tight text-[#1A1A1A]"
                      >
                        Choose how you want to pay
                      </h2>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="absolute -top-1 right-0 rounded-full p-1 text-[#6B7280] hover:bg-gray-100"
                        aria-label="Close"
                      >
                        <FiX size={18} />
                      </button>
                    </div>

                    <p className="mt-3 text-[15px] text-[#1A1A1A]">
                      Purchase price: {formatGbp(total)}
                    </p>
                    <p className="mt-2 text-[14px] leading-snug text-[#6B7280]">
                      Select Clearpay or Klarna as your payment method to pay in
                      installments.
                    </p>

                    <div className="mt-4 space-y-2.5">
                      {plans.map((plan, index) => (
                        <motion.div
                          key={plan.id}
                          className="rounded-xl bg-[#F3F4F6] px-4 py-3.5"
                          initial={
                            prefersReducedMotion
                              ? false
                              : { opacity: 0, y: 10 }
                          }
                          animate={{ opacity: 1, y: 0 }}
                          transition={
                            prefersReducedMotion
                              ? { duration: 0 }
                              : {
                                  delay: 0.08 + index * 0.04,
                                  duration: 0.28,
                                  ease: 'easeOut',
                                }
                          }
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[14px] font-medium leading-snug text-[#1A1A1A]">
                              {plan.title}
                            </p>
                            <span className="mt-0.5 shrink-0">{plan.mark}</span>
                          </div>
                          <p className="mt-2 text-[13px] text-[#6B7280]">
                            Total: {formatGbp(total)}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl bg-[#F3F4F6] px-4 py-3">
                      <p className="text-[11px] leading-relaxed text-[#6B7280]">
                        Late fees of £6 may apply per missed instalment. Paying with
                        Clearpay is subject to status, late fees, and our terms. 18+,
                        UK residents only. Clearpay is a credit product offered by
                        Clearpay Finance Ltd. You can pay in 4 interest-free
                        instalments of {formatGbp(splitAmount(total, 4)[0])}.
                        Representative example: representative 0% APR. Credit is
                        subject to status. T&amp;Cs apply. PayPal is also available
                        at checkout.
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
