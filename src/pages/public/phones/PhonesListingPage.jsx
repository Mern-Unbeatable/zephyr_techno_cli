import { Navigate } from 'react-router';

/** SEO alias → same old listing UI URL (no visible route change for normal browsing). */
export default function PhonesListingPage({ filterKey = 'NEW' }) {
  const filter = filterKey === 'USED' ? 'USED' : 'NEW';
  return <Navigate to={`/products?filter=${filter}`} replace />;
}
