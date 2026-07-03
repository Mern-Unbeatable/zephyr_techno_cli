import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import AdminDashboardTitle from '../../../components/dashboards/AdminDashboardTitle';
import Stats from './components/Stats';
import OrderTabs from './components/OrderTabs';
import ViewModal from './components/ViewModal';
import Pagination from '../listings/components/Pagination';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

const Order = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [openActionMenu, setOpenActionMenu] = useState(null);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statsData, setStatsData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchStats();
        fetchOrders(currentPage, activeTab);
    }, [activeTab, currentPage]);

    useEffect(() => {
        const handleOutsideClick = () => {
            if (openActionMenu) setOpenActionMenu(null);
        };
        if (openActionMenu) {
            document.addEventListener('click', handleOutsideClick);
        }
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [openActionMenu]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/orders/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const payload = await res.json();

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to fetch stats');
            }

            setStatsData([
                { label: 'Pending', value: payload.data.PENDING },
                { label: 'Processing', value: payload.data.PROCESSING },
                { label: 'Shipped', value: payload.data.SHIPPED },
                { label: 'Delivered', value: payload.data.DELIVERED },
                { label: 'Cancelled', value: payload.data.CANCELLED },
            ]);
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
                confirmButtonColor: '#0891b2'
            });
        }
    };

    const fetchOrders = async (page = 1, tab = 'All') => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const statusParam = tab !== 'All' ? `&status=${tab.toUpperCase()}` : '';
            const res = await fetch(`${API_BASE_URL}/api/admin/orders?page=${page}&limit=6${statusParam}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const payload = await res.json();

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to fetch orders');
            }

            const items = Array.isArray(payload.data) ? payload.data : (payload.data?.items ?? []);
            const meta = payload.meta || payload.data?.meta;

            const mapped = items.map(order => ({
                id: order.orderId,
                dbId: order.id,
                customer: order.user?.email ?? 'Guest',
                product: order.items[0]?.product?.title || 'N/A',
                price: order.totalPrice,
                date: new Date(order.createdAt).toLocaleDateString(),
                status: order.status.charAt(0) + order.status.slice(1).toLowerCase(),
            }));

            setOrdersData(mapped);
            setTotalPages(meta?.totalPages ?? 1);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
                confirmButtonColor: '#0891b2'
            });
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const statusOptions = ['Processing', 'Shipped', 'Delivered',  'Cancelled'];

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Processing': 'bg-blue-100 text-blue-800',
            'Shipped': 'bg-purple-100 text-purple-800',
            'Delivered': 'bg-green-100 text-green-800',
            'Cancelled': 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusDotColor = (status) => {
        const colors = {
            'Pending': 'bg-yellow-500',
            'Processing': 'bg-blue-500',
            'Shipped': 'bg-purple-500',
            'Delivered': 'bg-green-500',
            'Cancelled': 'bg-red-500',
        };
        return colors[status] || 'bg-gray-500';
    };

    const formatOrderPrice = (price) => {
        return `$${price.toLocaleString()}`;
    };

    const handleToggleMenu = (e, dbId) => {
        e.stopPropagation();
        if (openActionMenu === dbId) {
            setOpenActionMenu(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPos({
                top: rect.bottom + window.scrollY,
                right: window.innerWidth - rect.right + window.scrollX
            });
            setOpenActionMenu(dbId);
        }
    };

    const handleStatusChange = async (order, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const dbId = order?.dbId ?? order?.id ?? order?._id;
            if (!dbId) throw new Error('Order id is missing');
            const res = await fetch(`${API_BASE_URL}/api/admin/orders/${dbId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus.toUpperCase() })
            });
            const payload = await res.json();

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to update status');
            }

            // Close details modal immediately so the SweetAlert appears without overlap
            setIsDetailsModalOpen(false);
            setSelectedOrder(null);

            await Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Order status updated successfully.',
                timer: 2000,
                showConfirmButton: false
            });

            fetchOrders(currentPage, activeTab);
            fetchStats();
            setOpenActionMenu(null);

        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
                confirmButtonColor: '#0891b2'
            });
        }
    };

    const handleViewDetails = async (order) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/orders/${order.dbId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const payload = await res.json();

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to fetch order details');
            }

            setSelectedOrder(payload.data);
            setIsDetailsModalOpen(true);
            setOpenActionMenu(null);

        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
                confirmButtonColor: '#0891b2'
            });
        }
    };

    const handleDelete = async (order) => {
        const result = await Swal.fire({
            title: 'Delete Order?',
            text: `Are you sure you want to delete order ${order.id}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/orders/${order.dbId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const payload = await res.json();

            if (!res.ok || payload.success === false) {
                throw new Error(payload.message || 'Failed to delete order');
            }

            await Swal.fire({
                icon: 'success',
                title: 'Deleted',
                text: 'Order deleted successfully.',
                timer: 2000,
                showConfirmButton: false
            });

            fetchOrders(currentPage, activeTab);
            fetchStats();
            setOpenActionMenu(null);

        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
                confirmButtonColor: '#0891b2'
            });
        }
    };

    const closeDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedOrder(null);
    };

    return (
        <div>
            <AdminDashboardTitle 
                title="Order Management"
                subtitle="Track and manage all customer orders in one place."
            />

            <Stats stats={statsData} />

            <OrderTabs activeTab={activeTab} setActiveTab={handleTabChange} />

            {/* Table */}
            {loading ? (
                <div className="bg-white rounded-lg border border-gray-200 p-20 text-center text-sm text-gray-400">
                    Loading orders...
                </div>
            ) : ordersData.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-20 text-center text-sm text-gray-400">
                    No orders found.
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-3 font-semibold text-gray-700">Order ID</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-700">Customer</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-700">Product</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-700">Price</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-700">Date</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-700">Status</th>
                                <th className="text-center px-6 py-3 font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordersData.map((order) => (
                                <tr key={order.dbId} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-gray-900 font-medium">{order.id}</td>
                                    <td className="px-6 py-4 text-gray-700">{order.customer}</td>
                                    <td className="px-6 py-4 text-gray-700">{order.product}</td>
                                    <td className="px-6 py-4 text-gray-700">{formatOrderPrice(order.price)}</td>
                                    <td className="px-6 py-4 text-gray-700">{order.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center relative">
                                        <button
                                            type="button"
                                            onClick={(e) => handleToggleMenu(e, order.dbId)}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <circle cx="12" cy="5" r="2" />
                                                <circle cx="12" cy="12" r="2" />
                                                <circle cx="12" cy="19" r="2" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Fixed Position Action Menu */}
            {openActionMenu && (
                <div 
                    style={{ 
                        position: 'fixed', 
                        top: `${menuPos.top}px`, 
                        right: `${menuPos.right}px`, 
                        zIndex: 50 
                    }}
                    className="w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
                >
                    {(() => {
                        const order = ordersData.find(o => o.dbId === openActionMenu);
                        if (!order) return null;
                        return (
                            <>
                                <button
                                    type="button"
                                    onClick={() => handleViewDetails(order)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    View Details
                                </button>
                                <div className="my-1 border-t border-gray-200" />
                                <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    Change Status
                                </p>
                                {statusOptions.map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => handleStatusChange(order, status)}
                                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition cursor-pointer ${
                                            order.status === status
                                                ? 'bg-cyan-50 text-cyan-700'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className={`h-2 w-2 rounded-full ${getStatusDotColor(status)}`} />
                                        <span>{status}</span>
                                    </button>
                                ))}
                                <div className="my-1 border-t border-gray-200" />
                                <button
                                    type="button"
                                    onClick={() => handleDelete(order)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                    Delete Order
                                </button>
                            </>
                        );
                    })()}
                </div>
            )}

            <ViewModal
                isOpen={isDetailsModalOpen}
                selectedOrder={selectedOrder}
                onClose={closeDetailsModal}
                handleStatusChange={handleStatusChange}
                statusOptions={statusOptions}
                formatOrderPrice={formatOrderPrice}
            />

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default Order;