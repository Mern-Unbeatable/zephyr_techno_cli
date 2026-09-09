import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import Maintenance from '../pages/public/maintenance/Maintenance';

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL || 'https://api.zephyrtechnology.co.uk';

/**
 * Paths that stay reachable while maintenance is on.
 * Everything else on the public/customer side shows the maintenance page.
 * Admin login + /dashboard/admin stay outside this gate (separate routes).
 */
const ALLOWED_PATHS = [
  '/login',
  '/checkout/success',
  '/checkout/cancel',
];

export function useMaintenanceStatus() {
  const [status, setStatus] = useState({
    loading: true,
    enabled: false,
    message: '',
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/public/site-settings/maintenance`,
          { cache: 'no-store' },
        );
        const payload = await res.json().catch(() => ({}));
        if (cancelled) return;
        setStatus({
          loading: false,
          enabled: Boolean(payload?.data?.enabled),
          message: payload?.data?.message || '',
        });
      } catch {
        if (!cancelled) {
          setStatus({ loading: false, enabled: false, message: '' });
        }
      }
    };
    load();
    const id = setInterval(load, 15_000);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return status;
}

function isAllowedPath(pathname) {
  return ALLOWED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Blocks the entire customer website during maintenance.
 * No admin browse bypass — only the maintenance screen (plus login / paid-return paths).
 */
export default function MaintenanceGate({ children }) {
  const location = useLocation();
  const status = useMaintenanceStatus();

  if (status.loading) {
    return (
      <div className="min-h-screen bg-[#050d12] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-cyan-400" />
      </div>
    );
  }

  if (status.enabled && !isAllowedPath(location.pathname)) {
    return <Maintenance message={status.message} />;
  }

  return children;
}
