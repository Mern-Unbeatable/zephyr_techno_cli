import React from 'react';

const getSelectedOptionLines = (options) => {
    if (!options) return [];

    return [
        { label: 'color', value: options.color?.name ?? options.color },
        { label: 'storage', value: options.storage?.name ?? options.storage },
        { label: 'ram', value: options.ram?.name ?? options.ram },
    ].filter((entry) => entry.value);
};

const ViewModal = ({
    isOpen,
    selectedOrder,
    onClose,
    handleStatusChange,
    statusOptions,
    formatOrderPrice,
}) => {
    if (!isOpen || !selectedOrder) return null;

    const orderStatus = selectedOrder.status.charAt(0) + selectedOrder.status.slice(1).toLowerCase();
    const shippingAddr = selectedOrder.shippingAddress;
    const fullAddress = `${shippingAddr.street}, ${shippingAddr.city}, ${shippingAddr.state} ${shippingAddr.zipCode}, ${shippingAddr.country}`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                        <p className="mt-0.5 text-sm text-gray-500">Order ID : {selectedOrder.orderId}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-lg text-gray-500 hover:bg-gray-200 cursor-pointer"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Customer Info */}
                    <div>
                        <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" />
                            </svg>
                            Customer Information
                        </div>
                        <p className="text-base font-bold text-gray-900">{shippingAddr.fullName}</p>
                        <p className="mt-1 text-sm text-gray-600">{shippingAddr.phone}</p>
                        <p className="mt-0.5 text-sm text-gray-600">{selectedOrder.user?.email ?? 'Guest'}</p>
                        <p className="mt-0.5 text-sm leading-snug text-gray-600">{fullAddress}</p>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Order Summary
                        </div>

                        <div className="space-y-2">
                            {selectedOrder.items.map((item, i) => {
                                const optionLines = getSelectedOptionLines(item.selectedOptions);

                                return (
                                <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-100 px-3 py-2">
                                    <img
                                        src={item.product.thumbnail}
                                        alt={item.product.title}
                                        className="h-14 w-14 rounded-lg bg-white object-contain p-0.5"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-800">{item.product.title}</p>
                                        {optionLines.length > 0 ? (
                                            <div className="mt-0.5 space-y-0.5">
                                                {optionLines.map(({ label, value }) => (
                                                    <p key={label} className="text-sm text-gray-800">
                                                        {label} : {value}
                                                    </p>
                                                ))}
                                            </div>
                                        ) : null}
                                        <p className="text-sm text-gray-800">Quantity: {item.quantity}</p>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                        <div className="mt-3 space-y-1.5 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-semibold text-cyan-600">{formatOrderPrice(selectedOrder.totalPrice + selectedOrder.discountTotal - selectedOrder.shippingCost)}</span>
                            </div>
                            {selectedOrder.discountTotal > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Discount</span>
                                    <span className="font-semibold text-green-600">-{formatOrderPrice(selectedOrder.discountTotal)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping ({selectedOrder.shippingMethod})</span>
                                <span className="font-semibold text-cyan-600">{formatOrderPrice(selectedOrder.shippingCost)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-1.5" />
                            <div className="flex justify-between font-medium text-gray-800">
                                <span>Total</span>
                                <span className="font-bold text-cyan-500">{formatOrderPrice(selectedOrder.totalPrice)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedOrder.cancellationReason && (
                    <div className="mt-4 rounded-lg bg-red-50 p-4 border border-red-100">
                        <h3 className="text-sm font-bold text-red-800">Cancellation Reason</h3>
                        <p className="mt-1 text-sm text-red-700">{selectedOrder.cancellationReason}</p>
                    </div>
                )}

                {/* Update Status */}
                <div className="mt-6">
                    <h3 className="text-base font-bold text-gray-900">Update Order Status</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => handleStatusChange(selectedOrder, status)}
                                className={`rounded-md border px-4 py-1.5 text-sm font-medium transition cursor-pointer ${
                                    orderStatus === status
                                        ? 'border-cyan-500 bg-cyan-500 text-white'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewModal;