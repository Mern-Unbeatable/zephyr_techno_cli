import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import AdminDashboardTitle from '../../../components/dashboards/AdminDashboardTitle';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

const STATUS_STYLES = {
    NEW: 'bg-blue-100 text-blue-800',
    CONTRACTED: 'bg-purple-100 text-purple-800',
};

const STATUS_LABEL = {
    NEW: 'New',
    CONTRACTED: 'Contracted',
};

const CellPhoneMange = () => {
    const [sellRequests, setSellRequests] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, hasNext: false, hasPrevious: false });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [openActionMenu, setOpenActionMenu] = useState(null);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchSellRequests = useCallback(async (currentPage) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/sell-requests?page=${currentPage}&limit=8`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to load sell requests');
            }

            setSellRequests(payload.data || []);
            setMeta(payload.meta || { total: 0, page: 1, limit: 20, hasNext: false, hasPrevious: false });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to load sell requests.',
                confirmButtonColor: '#0891b2',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSellRequests(page);
    }, [page, fetchSellRequests]);

    useEffect(() => {
        if (!openActionMenu) return;
        const close = () => setOpenActionMenu(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [openActionMenu]);

    const handleToggleMenu = (e, requestId) => {
        e.stopPropagation();
        if (openActionMenu === requestId) {
            setOpenActionMenu(null);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        setOpenActionMenu(requestId);
    };

    const handleViewDetails = async (request) => {
        setOpenActionMenu(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/sell-requests/${request.id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to load request details');
            }

            setSelectedRequest(payload.data);
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to load details.',
                confirmButtonColor: '#0891b2',
            });
        }
    };

    const handleStatusChange = async (request, status) => {
        setOpenActionMenu(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/sell-requests/${request.id}`, {
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

            setSellRequests((prev) =>
                prev.map((r) => (r.id === request.id ? { ...r, status: payload.data?.status || status } : r))
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

    const handleDelete = async (request) => {
        setOpenActionMenu(null);

        const { isConfirmed } = await Swal.fire({
            title: 'Delete this sell request?',
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
            const res = await fetch(`${API_BASE_URL}/api/admin/sell-requests/${request.id}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to delete sell request');
            }

            setSellRequests((prev) => prev.filter((r) => r.id !== request.id));

            await Swal.fire({
                icon: 'success',
                title: 'Deleted',
                text: 'Sell request deleted successfully.',
                confirmButtonColor: '#0891b2',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to delete sell request.',
                confirmButtonColor: '#0891b2',
            });
        }
    };

    return (
        <div>
            <AdminDashboardTitle
                title="Sell Phone Manage"
                subtitle="Track and manage all customer sell phone requests"
            />

            <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-sm text-gray-400">Loading...</div>
                ) : sellRequests.length === 0 ? (
                    <div className="flex items-center justify-center py-20 text-sm text-gray-400">No sell requests found.</div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Device</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Condition</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Offer Price</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sellRequests.map((request) => (
                                <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-800">{request.fullName}</div>
                                        <div className="mt-0.5 text-xs text-gray-500">{request.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{request.deviceModelName || 'â€”'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{request.conditionName || 'â€”'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {/* <span className="text-gray-400 line-through text-xs mr-1">${request.baseOfferPrice}</span> */}
                                        <span className="font-medium text-gray-800">${request.userOfferedPrice}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[request.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {STATUS_LABEL[request.status] || request.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={(e) => handleToggleMenu(e, request.id)}
                                            className="inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100 cursor-pointer"
                                            aria-label="Open actions"
                                        >
                                            <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                                <circle cx="12" cy="5" r="2" />
                                                <circle cx="12" cy="12" r="2" />
                                                <circle cx="12" cy="19" r="2" />
                                            </svg>
                                        </button>

                                        {openActionMenu === request.id && (
                                            <div
                                                style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 50 }}
                                                className="w-48 rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewDetails(request)}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                >
                                                    View Details
                                                </button>
                                                <div className="my-1 border-t border-gray-200" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(request, 'CONTRACTED')}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                >
                                                    Mark Contracted
                                                </button>
                                                <div className="my-1 border-t border-gray-200" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(request)}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!loading && (meta.hasNext || meta.hasPrevious) && (
                    <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 text-sm text-gray-600">
                        <span>
                            Showing {(meta.page - 1) * meta.limit + 1}â€“{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} results
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={!meta.hasPrevious}
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
            {selectedRequest && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
                    onClick={() => setSelectedRequest(null)}
                >
                    <div
                        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Sell Request Details</h2>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="text-2xl leading-none text-gray-400 hover:text-gray-600 transition cursor-pointer"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4 text-sm text-gray-700">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Full Name</p>
                                    <p className="mt-0.5">{selectedRequest.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Email</p>
                                    <p className="mt-0.5">{selectedRequest.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Phone</p>
                                    <p className="mt-0.5">{selectedRequest.phone}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Device</p>
                                    <p className="mt-0.5">{selectedRequest.deviceModelName || 'â€”'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Condition</p>
                                    <p className="mt-0.5">{selectedRequest.conditionName || 'â€”'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
                                    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[selectedRequest.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {STATUS_LABEL[selectedRequest.status] || selectedRequest.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Base Offer Price</p>
                                    <p className="mt-0.5">${selectedRequest.baseOfferPrice}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">User Offered Price</p>
                                    <p className="mt-0.5">${selectedRequest.userOfferedPrice}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs font-semibold uppercase text-gray-400">Date</p>
                                    <p className="mt-0.5">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CellPhoneMange;

