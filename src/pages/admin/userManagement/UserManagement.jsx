import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import AdminDashboardTitle from '../../../components/dashboards/AdminDashboardTitle';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

const STATUS_STYLES = {
    ACTIVE: 'bg-green-100 text-green-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    DELETED: 'bg-gray-100 text-gray-600',
};

const STATUS_LABEL = {
    ACTIVE: 'Active',
    SUSPENDED: 'Suspended',
    DELETED: 'Deleted',
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 8, totalPages: 1, hasNext: false, hasPrev: false });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [openActionMenu, setOpenActionMenu] = useState(null);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = useCallback(async (currentPage) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/users?page=${currentPage}&limit=8`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to load users');
            }

            setUsers(payload.data || []);
            setMeta(payload.meta || { total: 0, page: 1, limit: 8, totalPages: 1, hasNext: false, hasPrev: false });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to load users.',
                confirmButtonColor: '#0891b2',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(page);
    }, [page, fetchUsers]);

    useEffect(() => {
        if (!openActionMenu) return;
        const close = () => setOpenActionMenu(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [openActionMenu]);

    const handleToggleMenu = (e, userId) => {
        e.stopPropagation();
        if (openActionMenu === userId) {
            setOpenActionMenu(null);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        setOpenActionMenu(userId);
    };

    const handleViewDetails = async (user) => {
        setOpenActionMenu(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to load user details');
            }

            setSelectedUser(payload.data);
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to load details.',
                confirmButtonColor: '#0891b2',
            });
        }
    };

    const handleStatusChange = async (user, status) => {
        setOpenActionMenu(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}`, {
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
                throw new Error(payload.message || 'Failed to update user status');
            }

            setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, status: payload.data?.status || status } : u))
            );

            await Swal.fire({
                icon: 'success',
                title: 'Updated',
                text: payload.message || 'User status updated successfully.',
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

    const handleDelete = async (user) => {
        setOpenActionMenu(null);

        const { isConfirmed } = await Swal.fire({
            title: 'Delete this user?',
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
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ status: 'DELETED' }),
            });

            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to delete user');
            }

            setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, status: 'DELETED' } : u))
            );

            await Swal.fire({
                icon: 'success',
                title: 'Deleted',
                text: 'User deleted successfully.',
                confirmButtonColor: '#0891b2',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to delete user.',
                confirmButtonColor: '#0891b2',
            });
        }
    };

    return (
        <div>
            <AdminDashboardTitle title="User Management" />

            <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-sm text-gray-400">Loading...</div>
                ) : users.length === 0 ? (
                    <div className="flex items-center justify-center py-20 text-sm text-gray-400">No users found.</div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone Number</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Joined Date</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {user.firstName} {user.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[user.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {STATUS_LABEL[user.status] || user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={(e) => handleToggleMenu(e, user.id)}
                                            className="inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100 cursor-pointer"
                                            aria-label="Open actions"
                                        >
                                            <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                                <circle cx="12" cy="5" r="2" />
                                                <circle cx="12" cy="12" r="2" />
                                                <circle cx="12" cy="19" r="2" />
                                            </svg>
                                        </button>

                                        {openActionMenu === user.id && (
                                            <div
                                                style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 50 }}
                                                className="w-48 rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewDetails(user)}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                >
                                                    View Details
                                                </button>
                                                <div className="my-1 border-t border-gray-200" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(user, 'ACTIVE')}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                >
                                                    Mark Active
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(user, 'SUSPENDED')}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                >
                                                    Suspend User
                                                </button>
                                                <div className="my-1 border-t border-gray-200" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(user)}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                                                >
                                                    Delete User
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
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
            {selectedUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
                    onClick={() => setSelectedUser(null)}
                >
                    <div
                        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-2xl leading-none text-gray-400 hover:text-gray-600 transition cursor-pointer"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-4 text-sm text-gray-700">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Full Name</p>
                                    <p className="mt-0.5">{selectedUser.firstName} {selectedUser.lastName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Email</p>
                                    <p className="mt-0.5">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Phone</p>
                                    <p className="mt-0.5">{selectedUser.phone}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Role</p>
                                    <p className="mt-0.5">{selectedUser.role}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
                                    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[selectedUser.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {STATUS_LABEL[selectedUser.status] || selectedUser.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Email Verified</p>
                                    <p className="mt-0.5">{selectedUser.isEmailVerified ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs font-semibold uppercase text-gray-400">Joined Date</p>
                                    <p className="mt-0.5">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;