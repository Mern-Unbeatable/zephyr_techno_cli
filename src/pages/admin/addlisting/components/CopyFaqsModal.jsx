import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Search, X } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://api.zephyrtechnology.co.uk";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const CopyFaqsModal = ({ isOpen, onClose, onCopy, excludeProductId = null }) => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [sourceFaqs, setSourceFaqs] = useState([]);
  const [checked, setChecked] = useState({});
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) return;
    setSearch("");
    setSelectedId("");
    setSourceFaqs([]);
    setChecked({});
    setError("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    let cancelled = false;
    const timer = setTimeout(() => {
      setLoadingProducts(true);
      const params = new URLSearchParams({ page: "1", limit: "100" });
      if (search.trim()) params.set("search", search.trim());
      fetch(`${API_BASE_URL}/api/admin/products?${params}`, {
        headers: authHeaders(),
      })
        .then((res) => res.json())
        .then((payload) => {
          if (cancelled) return;
          const items = payload?.data?.items || [];
          setProducts(items.filter((p) => p.id !== excludeProductId));
        })
        .catch(() => !cancelled && setError("Could not load products."))
        .finally(() => !cancelled && setLoadingProducts(false));
    }, search ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, search, excludeProductId]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const selectProduct = async (productId) => {
    setSelectedId(productId);
    setSourceFaqs([]);
    setChecked({});
    setError("");
    setLoadingFaqs(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
        headers: authHeaders(),
      });
      const payload = await res.json();
      if (!res.ok || payload.success === false) {
        throw new Error(payload.message || "Could not load FAQs.");
      }
      const faqs = [...(payload.data?.faqs || [])]
        .filter((faq) => faq?.question?.trim() || faq?.answer?.trim())
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      setSourceFaqs(faqs);
      setChecked(Object.fromEntries(faqs.map((_, i) => [i, true])));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingFaqs(false);
    }
  };

  const selectedFaqs = sourceFaqs.filter((_, i) => checked[i]);
  const allChecked = sourceFaqs.length > 0 && selectedFaqs.length === sourceFaqs.length;

  const handleCopy = () => {
    if (!selectedFaqs.length) return;
    onCopy(
      selectedFaqs.map((faq) => ({ question: faq.question || "", answer: faq.answer || "" })),
    );
    onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-cyan-600 to-teal-500 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Copy className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">Copy FAQs from another product</h2>
                  <p className="text-xs text-white/80">
                    Pick a product, choose the FAQs, and they will be added to this listing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)]">
              <div className="flex min-h-0 flex-col border-b border-gray-100 md:border-b-0 md:border-r">
                <div className="p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search products"
                      className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-custom focus:outline-none focus:ring-1 focus:ring-custom"
                    />
                  </div>
                </div>
                <div className="max-h-48 flex-1 overflow-y-auto px-2 pb-3 md:max-h-none">
                  {loadingProducts ? (
                    <p className="px-2 py-4 text-sm text-gray-400">Loading products…</p>
                  ) : products.length === 0 ? (
                    <p className="px-2 py-4 text-sm text-gray-400">No products found.</p>
                  ) : (
                    products.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => selectProduct(product.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${
                          selectedId === product.id
                            ? "bg-cyan-50 font-semibold text-cyan-800"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded object-contain bg-gray-50"
                          />
                        ) : (
                          <span className="h-8 w-8 shrink-0 rounded bg-gray-100" />
                        )}
                        <span className="line-clamp-2">{product.title}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="min-h-0 overflow-y-auto p-4">
                {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
                {!selectedId ? (
                  <p className="py-10 text-center text-sm text-gray-400">
                    Select a product to see its FAQs.
                  </p>
                ) : loadingFaqs ? (
                  <p className="py-10 text-center text-sm text-gray-400">Loading FAQs…</p>
                ) : sourceFaqs.length === 0 ? (
                  <p className="py-10 text-center text-sm text-gray-400">
                    This product has no FAQs.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={(e) =>
                          setChecked(
                            Object.fromEntries(sourceFaqs.map((_, i) => [i, e.target.checked])),
                          )
                        }
                        className="h-4 w-4 accent-[#3DB4CC]"
                      />
                      Select all ({sourceFaqs.length})
                    </label>
                    {sourceFaqs.map((faq, index) => (
                      <label
                        key={faq.id || index}
                        className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${
                          checked[index] ? "border-cyan-200 bg-cyan-50/40" : "border-gray-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!checked[index]}
                          onChange={(e) =>
                            setChecked((prev) => ({ ...prev, [index]: e.target.checked }))
                          }
                          className="mt-0.5 h-4 w-4 shrink-0 accent-[#3DB4CC]"
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-900">
                            {faq.question}
                          </span>
                          <span className="mt-0.5 block whitespace-pre-line text-xs text-gray-600">
                            {faq.answer}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!selectedFaqs.length}
                className="rounded-lg bg-custom px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#12806f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add {selectedFaqs.length || ""} FAQ{selectedFaqs.length === 1 ? "" : "s"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default CopyFaqsModal;
