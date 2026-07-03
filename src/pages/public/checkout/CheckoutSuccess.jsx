import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { FiCheckCircle, FiPackage, FiAlertCircle } from 'react-icons/fi';
import Container from '../../../layout/Container';
import { confirmPayment } from '../../../utils/cartApi';
import { useCart } from '../../../context/CartContext';

const CheckoutSuccess = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { fetchCart } = useCart();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const confirm = async () => {
            try {
                const data = await confirmPayment();
                if (data.success) {
                    setOrder(data.data);
                    await fetchCart(); // refresh cart count (now empty)
                } else {
                    setError(data.message || 'Could not confirm your payment.');
                }
            } catch (err) {
                setError(err.message || 'Something went wrong confirming your order.');
            } finally {
                setLoading(false);
            }
        };

        confirm();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4 text-gray-500">
                    <span className="loading loading-spinner loading-lg text-custom"></span>
                    <p className="text-sm">Confirming your payment…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <Container>
                    <div className="flex flex-col items-center gap-6 py-24 text-center">
                        <FiAlertCircle className="w-16 h-16 text-red-400" strokeWidth={1.5} />
                        <h1 className="text-2xl font-bold text-gray-900">Payment Confirmation Failed</h1>
                        <p className="text-gray-500 max-w-md">{error}</p>
                        <Link to="/cart" className="bg-custom hover:bg-[#349eab] text-white px-8 py-3 rounded-md text-[15px] font-medium transition-colors">
                            Return to Cart
                        </Link>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Container>
                <div className="max-w-xl mx-auto py-16">
                    {/* Success Header */}
                    <div className="flex flex-col items-center gap-4 text-center mb-12">
                        <FiCheckCircle className="w-20 h-20 text-[#47B5C9]" strokeWidth={1.5} />
                        <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
                        <p className="text-gray-500 text-base">
                            Thank you for your purchase. Your order has been placed successfully.
                        </p>
                        {order?.orderId && (
                            <p className="text-sm font-medium text-gray-700">
                                Order number: <span className="text-custom font-bold">{order.orderId}</span>
                            </p>
                        )}
                    </div>

                    {/* Order Items */}
                    {order?.orderItems?.length > 0 && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                                <FiPackage className="w-5 h-5 text-custom" />
                                <h2 className="text-base font-semibold text-gray-900">Items Ordered</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {order.orderItems.map((item, idx) => (
                                    <div key={idx} className="px-6 py-4 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                            ${(item.priceAtPurchase * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Order Summary */}
                    {order && (
                        <div className="bg-[#F6F7F9] rounded-xl p-6 mb-8 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Shipping Method</span>
                                <span className="text-gray-700">{order.shippingMethod}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Payment Status</span>
                                <span className="text-green-600 font-medium">{order.paymentStatus}</span>
                            </div>
                            {order.shippingAddress && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Ship to</span>
                                    <span className="text-gray-700 text-right">
                                        {order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.country}
                                    </span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                                <span className="font-medium text-gray-900">Total Paid</span>
                                <span className="text-xl font-bold text-gray-900">
                                    ${order.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/products"
                            className="flex-1 text-center bg-custom hover:bg-[#349eab] text-white py-3 rounded-md text-[15px] font-medium transition-colors"
                        >
                            Continue Shopping
                        </Link>
                        {/* <Link
                            to="/dashboard/user"
                            className="flex-1 text-center border border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-md text-[15px] font-medium transition-colors"
                        >
                            View My Orders
                        </Link> */}
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default CheckoutSuccess;
