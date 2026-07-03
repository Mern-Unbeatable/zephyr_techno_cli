import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import AdminDashboardTitle from '../../../components/dashboards/AdminDashboardTitle';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

const STATUS_STYLES = {
    PENDING: 'bg-blue-100 text-blue-700',
    CONTRACTED: 'bg-green-100 text-green-700',
};

const STATUS_LABEL = {
    PENDING: 'Pending',
    CONTRACTED: 'Contracted',
};

const ContactManagement = () => {
    const [contacts, setContacts] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [openActionMenu, setOpenActionMenu] = useState(null);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
    const [selectedContact, setSelectedContact] = useState(null);

    const fetchContacts = useCallback(async (currentPage) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/contacts?page=${currentPage}&limit=8`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to load contacts');
            }

            setContacts(payload.data || []);
            setMeta(payload.meta || { total: 0, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to load contacts.',
                confirmButtonColor: '#0891b2',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContacts(page);
    }, [page, fetchContacts]);

    useEffect(() => {
        if (!openActionMenu) return;
        const close = () => setOpenActionMenu(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [openActionMenu]);

    const handleToggleMenu = (e, contactId) => {
        e.stopPropagation();
        if (openActionMenu === contactId) {
            setOpenActionMenu(null);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        setOpenActionMenu(contactId);
    };

    const handleViewDetails = async (contact) => {
        setOpenActionMenu(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/contacts/${contact.id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to load contact details');
            }

            setSelectedContact(payload.data);
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to load details.',
                confirmButtonColor: '#0891b2',
            });
        }
    };

    const handleStatusChange = async (contact, status) => {
        setOpenActionMenu(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/contacts/${contact.id}`, {
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

            setContacts((prev) =>
                prev.map((c) => (c.id === contact.id ? { ...c, status: payload.data?.status || status } : c))
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

    const handleDelete = async (contact) => {
        setOpenActionMenu(null);

        const { isConfirmed } = await Swal.fire({
            title: 'Delete this contact?',
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
            const res = await fetch(`${API_BASE_URL}/api/admin/contacts/${contact.id}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            let payload = {};
            try { payload = await res.json(); } catch { /* empty */ }

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to delete contact');
            }

            setContacts((prev) => prev.filter((c) => c.id !== contact.id));

            await Swal.fire({
                icon: 'success',
                title: 'Deleted',
                text: 'Contact deleted successfully.',
                confirmButtonColor: '#0891b2',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to delete contact.',
                confirmButtonColor: '#0891b2',
            });
        }
    };

    return (
        <div>
            <AdminDashboardTitle
                title="Contact Management"
                subtitle="Manage and respond to contact form submissions"
            />

            <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-sm text-gray-400">Loading...</div>
                ) : contacts.length === 0 ? (
                    <div className="flex items-center justify-center py-20 text-sm text-gray-400">No contacts found.</div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact) => {
                                return (
                                    <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-800">{contact.firstName}</div>
                                            <div className="mt-1 max-w-xs truncate text-xs text-gray-500">{contact.message}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{contact.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{contact.subject}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {new Date(contact.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[contact.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {STATUS_LABEL[contact.status] || contact.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={(e) => handleToggleMenu(e, contact.id)}
                                                className="inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100 cursor-pointer"
                                                aria-label="Open actions"
                                            >
                                                <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="5" r="2" />
                                                    <circle cx="12" cy="12" r="2" />
                                                    <circle cx="12" cy="19" r="2" />
                                                </svg>
                                            </button>

                                            {openActionMenu === contact.id && (
                                                <div
                                                    style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 50 }}
                                                    className="w-48 rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewDetails(contact)}
                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        View Details
                                                    </button>
                                                    {contact.status === 'PENDING' && (
                                                        <>
                                                            <div className="my-1 border-t border-gray-200" />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStatusChange(contact, 'CONTRACTED')}
                                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                            >
                                                                Mark Contracted
                                                            </button>
                                                        </>
                                                    )}
                                                    <div className="my-1 border-t border-gray-200" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(contact)}
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
            {selectedContact && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
                    onClick={() => setSelectedContact(null)}
                >
                    <div
                        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Contact Details</h2>
                            <button
                                onClick={() => setSelectedContact(null)}
                                className="text-2xl leading-none text-gray-400 hover:text-gray-600 transition cursor-pointer"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-4 text-sm text-gray-700">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Name</p>
                                    <p className="mt-0.5">{selectedContact.firstName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Email</p>
                                    <p className="mt-0.5">{selectedContact.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Phone</p>
                                    <p className="mt-0.5">{selectedContact.phone}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Subject</p>
                                    <p className="mt-0.5">{selectedContact.subject}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
                                    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[selectedContact.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {STATUS_LABEL[selectedContact.status] || selectedContact.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">Date</p>
                                    <p className="mt-0.5">{new Date(selectedContact.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-gray-400">Message</p>
                                <p className="mt-1 rounded-lg bg-gray-50 p-3 leading-relaxed text-gray-700">{selectedContact.message}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactManagement;
