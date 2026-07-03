import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import AdminDashboardTitle from '../../../components/dashboards/AdminDashboardTitle';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

const getStatusFromPromo = (promo) => {
    if (new Date(promo.expiryDate) < new Date()) return 'Expired';
    return promo.isActive ? 'Active' : 'Disabled';
};

const STATUS_STYLES = {
    Active: 'bg-green-100 text-green-800',
    Disabled: 'bg-gray-100 text-gray-800',
    Expired: 'bg-red-100 text-red-800',
};

const FILTER_QUERY = {
    'All Status': '',
    'Active': '&status=active',
    'Disabled': '&isActive=false',
    'Expired': '&status=expired',
};

const PromoCode = () => {
    const navigate = useNavigate();
    const [promos, setPromos] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 8, hasNext: false, hasPrev: false });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [openActionMenu, setOpenActionMenu] = useState(null);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
    const [selectedPromo, setSelectedPromo] = useState(null);

    const fetchPromos = useCallback(async (currentPage, filter) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const filterParam = FILTER_QUERY[filter] || '';
            const res = await fetch(
                `${API_BASE_URL}/api/admin/promocodes?page=${currentPage}&limit=8${filterParam}`,
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }
            if (!res.ok || payload.success === false) throw new Error(payload.message || 'Failed to load promo codes');
            setPromos(payload.data || []);
            setMeta(payload.meta || { total: 0, page: 1, limit: 8, hasNext: false, hasPrev: false });
        } catch (err) {
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0891b2' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPromos(page, statusFilter);
    }, [page, statusFilter, fetchPromos]);

    const handleFilterChange = (newFilter) => {
        setStatusFilter(newFilter);
        setPage(1);
    };

    useEffect(() => {
        if (!openActionMenu) return;
        const close = () => setOpenActionMenu(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [openActionMenu]);

    const handleToggleMenu = (e, promoId) => {
        e.stopPropagation();
        if (openActionMenu === promoId) { setOpenActionMenu(null); return; }
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        setOpenActionMenu(promoId);
    };

    const handleViewDetails = async (promo) => {
        setOpenActionMenu(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/promocodes/${promo.id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }
            if (!res.ok || payload.success === false) throw new Error(payload.message || 'Failed to load promo details');
            setSelectedPromo(payload.data);
        } catch (err) {
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0891b2' });
        }
    };

    const handleToggleActive = async (promo, isActive) => {
        setOpenActionMenu(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/promocodes/${promo.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ isActive }),
            });
            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }
            if (!res.ok || payload.success === false) throw new Error(payload.message || 'Failed to update promo');
            setPromos((prev) =>
                prev.map((p) => p.id === promo.id ? { ...p, isActive: payload.data?.isActive ?? isActive } : p)
            );
            await Swal.fire({
                icon: 'success', title: 'Updated', text: payload.message || 'Status updated.',
                confirmButtonColor: '#0891b2', timer: 2000, showConfirmButton: false,
            });
        } catch (err) {
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0891b2' });
        }
    };

    const handleDelete = async (promo) => {
        setOpenActionMenu(null);
        const { isConfirmed } = await Swal.fire({
            title: 'Delete this promo code?',
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
            const res = await fetch(`${API_BASE_URL}/api/admin/promocodes/${promo.id}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }
            if (!res.ok || payload.success === false) throw new Error(payload.message || 'Failed to delete promo');
            setPromos((prev) => prev.filter((p) => p.id !== promo.id));
            await Swal.fire({
                icon: 'success', title: 'Deleted', text: 'Promo code deleted successfully.',
                confirmButtonColor: '#0891b2', timer: 2000, showConfirmButton: false,
            });
        } catch (err) {
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0891b2' });
        }
    };

    return (
        <div>
            <AdminDashboardTitle
                title="Promo Code Management"
                subtitle="Create and manage promotional codes for your e-commerce platform"
            />

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <select
                    value={statusFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-custom cursor-pointer"
                >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Disabled</option>
                    <option>Expired</option>
                </select>
                <button
                    type="button"
                    onClick={() => navigate('/dashboard/admin/create-promo')}
                    className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600 transition cursor-pointer"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Promo Code
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-sm text-gray-400">Loading...</div>
                ) : promos.length === 0 ? (
                    <div className="flex items-center justify-center py-20 text-sm text-gray-400">No promo codes found.</div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Promo Code</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Discount Type</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Discount Value</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Min Order</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Usage Limit</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Used Count</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Expiry Date</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promos.map((promo) => {
                                const status = getStatusFromPromo(promo);
                                return (
                                    <tr key={promo.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{promo.code}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {promo.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">${promo.minOrderValue}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {promo.maxUsageCount ?? 'Unlimited'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {promo.currentUsageCount} / {promo.maxUsageCount ?? 'Unlimited'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {new Date(promo.expiryDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={(e) => handleToggleMenu(e, promo.id)}
                                                className="inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100 cursor-pointer"
                                                aria-label="Open actions"
                                            >
                                                <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="5" r="2" />
                                                    <circle cx="12" cy="12" r="2" />
                                                    <circle cx="12" cy="19" r="2" />
                                                </svg>
                                            </button>

                                            {openActionMenu === promo.id && (
                                                <div
                                                    style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 50 }}
                                                    className="w-48 rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewDetails(promo)}
                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        View Details
                                                    </button>
                                                    <div className="my-1 border-t border-gray-200" />
                                                    {status !== 'Active' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleActive(promo, true)}
                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                        >
                                                            <span className="h-2 w-2 rounded-full bg-green-500" /> Enable
                                                        </button>
                                                    )}
                                                    {status === 'Active' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleActive(promo, false)}
                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                        >
                                                            <span className="h-2 w-2 rounded-full bg-gray-500" /> Disable
                                                        </button>
                                                    )}
                                                    <div className="my-1 border-t border-gray-200" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(promo)}
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

                {!loading && (meta.hasNext || meta.hasPrev) && (
                    <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 text-sm text-gray-600">
                        <span>
                            Showing {(meta.page - 1) * meta.limit + 1}&#8211;{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} results
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

            {selectedPromo && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
                    onClick={() => setSelectedPromo(null)}
                >
                    <div
                        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Promo Code Details</h2>
                            <button
                                onClick={() => setSelectedPromo(null)}
                                className="text-2xl leading-none text-gray-400 hover:text-gray-600 transition cursor-pointer"
                                aria-label="Close"
                            >
                                &#x2715;
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                            <div>
                                <p className="text-xs font-semibold uppercase text-gray-400">Code</p>
                                <p className="mt-0.5 font-mono font-bold text-gray-900">{selectedPromo.code}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-gray-400">Discount Type</p>
                                <p className="mt-0.5">{selectedPromo.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-gray-400">Discount Value</p>
                                <p className="mt-0.5">
                                    {selectedPromo.discountType === 'PERCENTAGE' ? `${selectedPromo.discountValue}%` : `$${selectedPromo.discountValue}`}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-gray-400">Min Order Value</p>
                                <p className="mt-0.5">${selectedPromo.minOrderValue}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-gray-400">Usage</p>
                                <p className="mt-0.5">{selectedPromo.currentUsageCount} / {selectedPromo.maxUsageCount ?? 'Unlimited'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
                                <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[getStatusFromPromo(selectedPromo)]}`}>
                                    {getStatusFromPromo(selectedPromo)}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-gray-400">Start Date</p>
                                <p className="mt-0.5">{new Date(selectedPromo.startDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-gray-400">Expiry Date</p>
                                <p className="mt-0.5">{new Date(selectedPromo.expiryDate).toLocaleDateString()}</p>
                            </div>
                            {selectedPromo.promoCodeModelBridge?.length > 0 && (
                                <div className="col-span-2">
                                    <p className="text-xs font-semibold uppercase text-gray-400">Applicable Models</p>
                                    <p className="mt-0.5">
                                        {selectedPromo.promoCodeModelBridge.map((b) => b.deviceModel?.name).filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromoCode;