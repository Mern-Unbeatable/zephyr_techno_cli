import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.zephyrtechnology.co.uk';

const overlayTransition = { duration: 0.22, ease: [0.4, 0, 0.2, 1] };
const panelTransition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] };

const NotifyMeModal = ({
  isOpen,
  onClose,
  productId,
  productTitle,
  colors = [],
  storageOptions = [],
  initialEmail = '',
  variantStocks = [],
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [colorId, setColorId] = useState('');
  const [storageOptionId, setStorageOptionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isVariantOutOfStock = (color, storage) => {
    const cell = variantStocks.find(
      (row) => row.colorId === color && row.storageOptionId === storage,
    );
    return Math.max(0, Number(cell?.stockQuantity) || 0) <= 0;
  };

  const findFirstOutOfStockVariant = () => {
    for (const color of colors) {
      for (const storage of storageOptions) {
        if (isVariantOutOfStock(color.id, storage.id)) {
          return { colorId: color.id, storageOptionId: storage.id };
        }
      }
    }
    return {
      colorId: colors[0]?.id || '',
      storageOptionId: storageOptions[0]?.id || '',
    };
  };

  useEffect(() => {
    if (!isOpen) return;
    const defaults = findFirstOutOfStockVariant();
    setEmail(initialEmail || '');
    setColorId(defaults.colorId);
    setStorageOptionId(defaults.storageOptionId);
    setError('');
    setSuccess(false);
  }, [isOpen, initialEmail, colors, storageOptions, variantStocks]);

  const selectedVariantIsOutOfStock = isVariantOutOfStock(colorId, storageOptionId);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedVariantIsOutOfStock) {
      setError('Please choose a color and storage combination that is out of stock.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/public/stock-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productId,
          colorId,
          storageOptionId,
          email,
        }),
      });

      let payload = {};
      try {
        payload = await res.json();
      } catch {
        payload = {};
      }

      if (!res.ok || payload.success === false) {
        throw new Error(payload.message || 'Could not save your request.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
        >
          <motion.button
            type="button"
            aria-label="Close modal backdrop"
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notify-me-title"
            className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={panelTransition}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="notify-me-title" className="text-lg font-semibold text-gray-900">
                Notify Me
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-2xl leading-none text-gray-400 transition hover:text-gray-600"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {success ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Thanks — we will email you at <strong>{email}</strong> when{' '}
                  <strong>{productTitle}</strong> is back in stock for your selected variant.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-sm bg-[#47B5C9] py-2.5 text-sm font-medium text-white hover:bg-[#349eab]"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-600">
                  Enter your email and choose the out-of-stock color and storage you want.
                  We will notify you when it is available again.
                </p>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#47B5C9]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-700">
                    Color
                  </label>
                  <select
                    required
                    value={colorId}
                    onChange={(e) => setColorId(e.target.value)}
                    className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#47B5C9]"
                  >
                    {colors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-700">
                    Storage
                  </label>
                  <select
                    required
                    value={storageOptionId}
                    onChange={(e) => setStorageOptionId(e.target.value)}
                    className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#47B5C9]"
                  >
                    {storageOptions.map((storage) => (
                      <option key={storage.id} value={storage.id}>
                        {storage.name}
                        {colorId && isVariantOutOfStock(colorId, storage.id)
                          ? ' (out of stock)'
                          : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {!selectedVariantIsOutOfStock ? (
                  <p className="text-sm text-amber-600">
                    This color and storage combination is currently in stock. Please choose an out-of-stock variant.
                  </p>
                ) : null}

                {error ? <p className="text-sm text-red-500">{error}</p> : null}

                <button
                  type="submit"
                  disabled={submitting || !selectedVariantIsOutOfStock}
                  className="w-full rounded-sm bg-[#47B5C9] py-2.5 text-sm font-medium text-white hover:bg-[#349eab] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving…' : 'Notify Me'}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default NotifyMeModal;
