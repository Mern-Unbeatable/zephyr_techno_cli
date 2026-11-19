import { Navigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import NotFound from '../../404/NotFound';

const BASE_URL = import.meta.env.VITE_BASE_URL || '';
const STORAGE_KEY = 'sellFlow';

/**
 * SEO alias /sell-your-phone/:slug → existing sell-worth UI.
 */
export default function SellModelPage() {
  const { slug } = useParams();
  const [target, setTarget] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!slug) return undefined;
    let cancelled = false;

    fetch(`${BASE_URL}/api/public/seo/sell/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.success === false) throw new Error('not found');
        return json.data;
      })
      .then((data) => {
        if (cancelled) return;
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              seriesId: data.seriesId,
              seriesName: data.seriesName,
              deviceModelId: data.deviceModelId,
              deviceName: data.model,
              fromSeoPage: true,
            }),
          );
        } catch {
          /* ignore */
        }
        setTarget(
          `/sell-worth?seriesId=${encodeURIComponent(data.seriesId)}&deviceModelId=${encodeURIComponent(data.deviceModelId)}`,
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
