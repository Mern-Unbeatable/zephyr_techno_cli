import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import AdminDashboardTitle from '../../../components/dashboards/AdminDashboardTitle';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.zephyrtechnology.co.uk';

const STATUS_STYLES = {
    NEW: 'bg-amber-100 text-amber-700',
    CONTACTED: 'bg-green-100 text-green-700',
    CLOSED: 'bg-gray-100 text-gray-600',
};

const STATUS_LABEL = {
    NEW: 'New',
    CONTACTED: 'Contacted',
    CLOSED: 'Closed',
};

const BusinessQuery = () => {
    const [queries, setQueries] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 8, totalPages: 1, hasNext: false, hasPrev: false });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [openActionMenu, setOpenActionMenu] = useState(null);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
    const [selectedQuery, setSelectedQuery] = useState(null);

    const fetchQueries = useCallback(async (currentPage) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/business-forms?page=${currentPage}&limit=8`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to load business queries');
            }

            setQueries(payload.data || []);
            setMeta(payload.meta || { total: 0, page: 1, limit: 8, totalPages: 1, hasNext: false, hasPrev: false });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to load business queries.',
                confirmButtonColor: '#0891b2',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQueries(page);
    }, [page, fetchQueries]);

    useEffect(() => {
        if (!openActionMenu) return;
        const close = () => setOpenActionMenu(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [openActionMenu]);

    const handleToggleMenu = (e, queryId) => {
        e.stopPropagation();
        if (openActionMenu === queryId) {
            setOpenActionMenu(null);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        setOpenActionMenu(queryId);
    };

    const handleViewDetails = async (query) => {
        setOpenActionMenu(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/business-forms/${query.id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to load query details');
            }

            setSelectedQuery(payload.data);
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to load details.',
                confirmButtonColor: '#0891b2',
            });
        }
    };

    const handleStatusChange = async (query, status) => {
        setOpenActionMenu(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/business-forms/${query.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ status }),
            });

            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to update status');
            }

            setQueries((prev) =>
                prev.map((q) => (q.id === query.id ? { ...q, status: payload.data?.status || status } : q))
            );

            await Swal.fire({
                icon: 'success',
                title: 'Updated',
                text: payload.message || 'Status updated successfully.',
                confirmButtonColor: '#0891b2',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to update status.',
                confirmButtonColor: '#0891b2',
            });
        }
    };

    const handleDelete = async (query) => {
        setOpenActionMenu(null);

        const { isConfirmed } = await Swal.fire({
            title: 'Delete this query?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete',
        });
        if (!isConfirmed) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/business-forms/${query.id}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to delete query');
            }

            setQueries((prev) => prev.filter((q) => q.id !== query.id));

            await Swal.fire({
                icon: 'success',
                title: 'Deleted',
                text: 'Business query deleted successfully.',
                confirmButtonColor: '#0891b2',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to delete query.',
                confirmButtonColor: '#0891b2',
            });
        }
    };

    return (
        <div>
            <AdminDashboardTitle
                title="Business Queries"
                subtitle="Manage and respond to business inquiries"
            />

            <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-sm text-gray-400">Loading...</div>
                ) : queries.length === 0 ? (
                    <div className="flex items-center justify-center py-20 text-sm text-gray-400">No business queries found.</div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Business</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Contact Person</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {queries.map((query) => {

                                return (
                                    <tr key={query.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-800">{query.companyName}</div>
                                            <div className="mt-1 max-w-xs truncate text-xs text-gray-500">{query.requirements}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{query.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{query.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {new Date(query.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[query.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {STATUS_LABEL[query.status] || query.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={(e) => handleToggleMenu(e, query.id)}
                                                className="inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100 cursor-pointer"
                                                aria-label="Open actions"
                                            >
                                                <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="5" r="2" />
                                                    <circle cx="12" cy="12" r="2" />
                                                    <circle cx="12" cy="19" r="2" />
                                                </svg>
                                            </button>

                                            {openActionMenu === query.id && (
                                                <div
                                                    style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 50 }}
                                                    className="w-48 rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewDetails(query)}
                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        View Details
                                                    </button>
                                                    <div className="my-1 border-t border-gray-200" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(query, 'CONTACTED')}
                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        Mark Contacted
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(query, 'CLOSED')}
                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        Mark Closed
                                                    </button>
                                                    <div className="my-1 border-t border-gray-200" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(query)}
                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {!loading && meta.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 text-sm text-gray-600">
                        <span>
                            Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} results
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={!meta.hasPrev}
                                onClick={() => setPage((p) => p - 1)}
                                className="rounded-md border border-gray-200 px-3 py-1 disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                disabled={!meta.hasNext}
                                onClick={() => setPage((p) => p + 1)}
                                className="rounded-md border border-gray-200 px-3 py-1 disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {selectedQuery && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
                    onClick={() => setSelectedQuery(null)}
                >
                    <div
                        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Query Details</h2>
                            <button
                                onClick={() => setSelectedQuery(null)}
                                className="text-2xl leading-none text-gray-400 hover:text-gray-600 transition cursor-pointer"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-4 text-sm text-gray-700">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Company</p>
                                    <p className="mt-0.5">{selectedQuery.companyName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Contact Person</p>
                                    <p className="mt-0.5">{selectedQuery.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Email</p>
                                    <p className="mt-0.5">{selectedQuery.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Phone</p>
                                    <p className="mt-0.5">{selectedQuery.phone}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
                                    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[selectedQuery.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {STATUS_LABEL[selectedQuery.status] || selectedQuery.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Date</p>
                                    <p className="mt-0.5">{new Date(selectedQuery.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-gray-400">Requirements</p>
                                <p className="mt-1 rounded-lg bg-gray-50 p-3 leading-relaxed text-gray-700">{selectedQuery.requirements}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessQuery;