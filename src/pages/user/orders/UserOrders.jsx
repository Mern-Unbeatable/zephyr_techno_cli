import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Modal from './component/Modal';
import Pagination from '../../public/products/components/Pagination';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

const UserOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(4);

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage]);

    const fetchOrders = async (page = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/orders?page=${page}&limit=${limit}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const payload = await res.json();
            if (!res.ok || payload.success === false) throw new Error(payload.message || 'Failed to fetch orders');
            const items = Array.isArray(payload.data) ? payload.data : (payload.data?.items ?? []);
            setOrders(items);
            const meta = payload.meta || payload.data?.meta || {};
            setTotalPages(meta?.totalPages ?? 1);
        } catch (err) {
            console.error('Failed to load orders', err);
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to load orders', confirmButtonColor: '#0891b2' });
        } finally {
            setLoading(false);
        }
    };

    const openCancelModal = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleSend = async (reason) => {
        if (!selectedOrder) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/orders/${selectedOrder.id}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ reason })
            });

            const payload = await res.json();
            if (!res.ok || payload.success === false) throw new Error(payload.message || 'Failed to cancel order');

            // update orders list with returned data
            const updated = payload.data;
            setOrders((prev) => prev.map(o => (o.id === updated.id ? updated : o)));

            await Swal.fire({ icon: 'success', title: 'Cancelled', text: payload.message || 'Order cancelled', confirmButtonColor: '#0891b2' });
        } catch (err) {
            console.error('Cancel order failed', err);
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to cancel order', confirmButtonColor: '#0891b2' });
        } finally {
            handleClose();
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            PROCESSING: { label: 'Processing', bg: 'bg-blue-50', text: 'text-blue-700' },
            SHIPPED: { label: 'Shipped', bg: 'bg-purple-50', text: 'text-purple-700' },
            DELIVERED: { label: 'Delivered', bg: 'bg-green-50', text: 'text-green-700' },
            CANCELLED: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700' },
            PENDING: { label: 'Pending', bg: 'bg-yellow-50', text: 'text-yellow-700' },
        };
        return map[status] || { label: status.charAt(0) + status.slice(1).toLowerCase(), bg: 'bg-gray-100', text: 'text-gray-700' };
    };

    if (loading) return <div className="text-center py-10 text-gray-400">Loading orders...</div>;

    return (
        <div className="w-full space-y-4 sm:space-y-5">
            {orders.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-400">No orders found.</div>
            ) : (
                orders.map((order) => {
                    const prod = order.items?.[0]?.product;
                    const status = getStatusBadge(order.status);
                    const date = order.createdAt ? new Date(order.createdAt).toLocaleString() : '';
                    return (
                        <div
                            key={order.id}
                                className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:flex-row sm:gap-5 sm:py-4 sm:px-4 md:items-center"
                        >
                                <img
                                    src={prod?.thumbnail}
                                    alt={prod?.title}
                                    className="h-28 w-full rounded-md object-cover sm:h-36 sm:w-40 shrink-0"
                                />
                            <div className="flex-1 pl-0 sm:pl-4">
                                    <p className="text-xs text-gray-400">Order ID: {order.orderId}</p>
                                    <h2 className="text-base font-semibold text-gray-900 mt-1 line-clamp-1">{prod?.title}</h2>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{prod?.title}</p>
                                    <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">${Number(order.totalPrice).toLocaleString()}</p>
                                            <p className="text-xs text-gray-400 mt-1">{date}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`${status.bg} ${status.text} inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold`}>{status.label}</span>
                                            {order.status === 'PROCESSING' ? (
                                                <button
                                                    onClick={() => openCancelModal(order)}
                                                    className="ml-0 sm:ml-2 rounded-md border border-red-600 text-red-600 px-3 py-1 text-sm font-semibold hover:bg-red-50 transition"
                                                >
                                                    Cancel
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                            </div>
                        </div>
                    )
                })
            )}

            <Modal isOpen={isModalOpen} onClose={handleClose} onSend={handleSend} />
            <Modal isOpen={isModalOpen} onClose={handleClose} onSend={handleSend} />

            {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
        </div>
    );
};

export default UserOrders;
