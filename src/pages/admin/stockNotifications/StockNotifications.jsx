import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.zephyrtechnology.co.uk';

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-700',
  NOTIFIED: 'bg-green-100 text-green-700',
};

const StockNotifications = () => {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRows = useCallback(async (currentPage, status) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: '20',
      });
      if (status) params.set('status', status);

      const res = await fetch(`${API_BASE_URL}/api/admin/stock-notifications?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      let payload = {};
      try {
        payload = await res.json();
      } catch {
        payload = {};
      }

      if (!res.ok || payload.success === false) {
        throw new Error(payload.message || 'Failed to load stock notifications');
      }

      setRows(payload.data || []);
      setMeta(payload.meta || meta);
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to load stock notifications.',
        confirmButtonColor: '#0891b2',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows(page, statusFilter);
  }, [page, statusFilter, fetchRows]);

  return (
    <div>
      <h1 className="text-[#050609] text-3xl lg:text-[35px] font-semibold">
        Stock Notifications
      </h1>

      <p className="mt-1 text-sm md:text-base text-[#464646]">
        Customers waiting to be notified when a variant is back in stock.
      </p>

      <div className="mb-4 mt-4 flex justify-end">
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="NOTIFIED">Notified</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product / Model</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Color</th>
              <th className="px-4 py-3 font-medium">Storage</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Requested</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No stock notification requests yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{row.product?.title || '—'}</p>
                    {row.product?.model ? (
                      <p className="text-xs text-gray-500">{row.product.model}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{row.email}</td>
                  <td className="px-4 py-3 text-gray-700">{row.color?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{row.storage?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLES[row.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>
          Page {meta.page} of {meta.totalPages} ({meta.total} total)
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!meta.hasPrev || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!meta.hasNext || loading}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockNotifications;
