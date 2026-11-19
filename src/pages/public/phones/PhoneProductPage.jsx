import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router';
import NotFound from '../../404/NotFound';

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

/**
 * SEO alias /phones/:slug → existing /product-details/:id UI.
 * Users keep the original product-details experience.
 */
export default function PhoneProductPage() {
  const { slug } = useParams();
  const [target, setTarget] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!slug) return undefined;
    let cancelled = false;

    fetch(`${BASE_URL}/api/public/seo/product/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.success === false) throw new Error('not found');
        return json.data;
      })
      .then((data) => {
        if (cancelled) return;
        const params = new URLSearchParams();
        if (data.colorId) params.set('colorId', data.colorId);
        if (data.storageOptionId) params.set('storageOptionId', data.storageOptionId);
        if (data.conditionCategoryId) {
          params.set('conditionCategoryId', data.conditionCategoryId);
        }
        const qs = params.toString();
        setTarget(
          qs
            ? `/product-details/${data.productId}?${qs}`
            : `/product-details/${data.productId}`,
        );
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (missing) return <NotFound />;
  if (!target) return null;
  return <Navigate to={target} replace />;
}
