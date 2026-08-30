import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { FiSearch, FiX } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.zephyrtechnology.co.uk';

const normalize = (value) => String(value || '').toLowerCase().trim();

const matchesQuery = (name, query) => {
  const q = normalize(query);
  if (!q) return false;
  return normalize(name).includes(q);
};

const formatPrice = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return `£${amount.toFixed(2)}`;
};

const fetchProducts = async (params) => {
  const searchParams = new URLSearchParams({ limit: '8', page: '1', ...params });
  const res = await fetch(`${API_BASE_URL}/api/public/product?${searchParams}`);
  const payload = await res.json();
  if (!payload.success) return [];
  return payload.data?.items || [];
};

const mergeProducts = (lists) => {
  const seen = new Set();
  const merged = [];
  for (const list of lists) {
    for (const item of list) {
      if (!item?.id || seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
      if (merged.length >= 8) return merged;
    }
  }
  return merged;
};

const GlobalSearch = ({ className = '', mobile = false, onClose }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(mobile);
  const [attributes, setAttributes] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/product/attributes`);
        const payload = await res.json();
        if (mounted && payload.success) {
          setAttributes(payload.data);
        }
      } catch (err) {
        console.error('Failed to load search attributes', err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (mobile) {
      inputRef.current?.focus();
    }
  }, [mobile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setProducts([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = normalize(trimmed);
        const matchedColors = (attributes?.colors || [])
          .filter((item) => matchesQuery(item.name, q))
          .slice(0, 3);
        const matchedStorages = (attributes?.storageOptions || [])
          .filter((item) => matchesQuery(item.name, q))
          .slice(0, 3);
        const matchedModels = (attributes?.models || [])
          .filter((item) => matchesQuery(item.name, q))
          .slice(0, 3);
        const matchedSeries = (attributes?.series || [])
          .filter((item) => matchesQuery(item.name, q))
          .slice(0, 2);

        const requests = [fetchProducts({ search: trimmed })];

        matchedColors.forEach((color) => {
          requests.push(fetchProducts({ colorId: color.id }));
        });
        matchedStorages.forEach((storage) => {
          requests.push(fetchProducts({ storageOptionId: storage.id }));
        });
        matchedModels.forEach((model) => {
          requests.push(fetchProducts({ deviceModelId: model.id }));
        });
        matchedSeries.forEach((series) => {
          requests.push(fetchProducts({ seriesId: series.id }));
        });

        const results = await Promise.all(requests);
        if (!cancelled) {
          setProducts(mergeProducts(results));
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Product search failed', err);
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, attributes]);

  const closeSearch = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [onClose]);

  const goTo = useCallback(
    (url) => {
      setQuery('');
      setOpen(false);
      closeSearch();
      navigate(url);
    },
    [closeSearch, navigate],
  );

  const buildViewAllUrl = (trimmed) => {
    const q = normalize(trimmed);
    const matchedColors = (attributes?.colors || []).filter((item) =>
      matchesQuery(item.name, q),
    );
    const matchedStorages = (attributes?.storageOptions || []).filter((item) =>
      matchesQuery(item.name, q),
    );
    const matchedModels = (attributes?.models || []).filter((item) =>
      matchesQuery(item.name, q),
    );
    const matchedSeries = (attributes?.series || []).filter((item) =>
      matchesQuery(item.name, q),
    );

    const params = new URLSearchParams();

    // Use a single attribute filter when the query clearly matches one —
    // do not AND it with text search (that would hide valid products).
    if (matchedStorages.length === 1 && !matchedColors.length && !matchedModels.length) {
      params.set('storageOptionId', matchedStorages[0].id);
    } else if (matchedColors.length === 1 && !matchedStorages.length && !matchedModels.length) {
      params.set('colorId', matchedColors[0].id);
    } else if (matchedModels.length === 1) {
      params.set('deviceModelId', matchedModels[0].id);
      if (matchedModels[0].seriesId) {
        params.set('seriesId', matchedModels[0].seriesId);
      }
    } else if (matchedSeries.length === 1 && !matchedModels.length) {
      params.set('seriesId', matchedSeries[0].id);
    } else {
      params.set('search', trimmed);
    }

    return `/products?${params.toString()}`;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    goTo(buildViewAllUrl(trimmed));
  };

  const showDropdown = open && query.trim().length > 0;

  const dropdown = showDropdown ? (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[min(70vh,24rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
      {loading ? (
        <p className="px-3 py-3 text-sm text-gray-500">Searching...</p>
      ) : null}

      {!loading && products.length === 0 ? (
        <p className="px-3 py-3 text-sm text-gray-500">No products found</p>
      ) : null}

      {!loading && products.length > 0 ? (
        <ul>
          {products.map((item) => {
            const price = formatPrice(item.basePrice);
            const meta = [item.deviceModel?.name || item.series?.name, price]
              .filter(Boolean)
              .join(' · ');

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => goTo(`/product-details/${item.id}`)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50"
                >
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-md object-cover bg-gray-100"
                    />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-md bg-gray-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                    {meta ? (
                      <p className="truncate text-xs text-gray-500">{meta}</p>
                    ) : null}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="border-t border-gray-100 px-3 py-2">
        <button
          type="submit"
          className="w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-[#47B5C9] hover:bg-[#47B5C9]/5"
        >
          View all results for &ldquo;{query.trim()}&rdquo;
        </button>
      </div>
    </div>
  ) : null;

  const searchForm = (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-center">
        <FiSearch
          size={16}
          className="pointer-events-none absolute left-3 text-gray-400"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search by name, color, storage..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#47B5C9] focus:ring-2 focus:ring-[#47B5C9]/20"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setProducts([]);
              inputRef.current?.focus();
            }}
            className="absolute right-2 rounded p-1 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <FiX size={16} />
          </button>
        ) : null}
      </div>
      {dropdown}
    </form>
  );

  if (mobile) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/40 p-4" onClick={closeSearch}>
        <div
          ref={containerRef}
          className="mx-auto mt-4 w-full max-w-lg rounded-xl bg-white p-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Search</h2>
            <button type="button" onClick={closeSearch} aria-label="Close search">
              <FiX size={20} />
            </button>
          </div>
          {searchForm}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {searchForm}
    </div>
  );
};

export default GlobalSearch;
