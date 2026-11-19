import { useEffect, useState } from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

export default function useSeoMeta(pathname, { page, enabled = true } = {}) {
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !pathname) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    const params = new URLSearchParams({ path: pathname });
    if (page) params.set('page', String(page));

    setLoading(true);
    fetch(`${BASE_URL}/api/public/seo/meta?${params}`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.success === false) {
          throw new Error(json.message || 'Failed to load SEO meta');
        }
        return json.data;
      })
      .then((data) => {
        if (!cancelled) {
          setMeta(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setMeta(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, page, enabled]);

  return { meta, loading, error };
}
