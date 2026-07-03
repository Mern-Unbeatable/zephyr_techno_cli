import React from 'react';

const ViewDetailsModal = ({
    isOpen,
    selectedPromo,
    onClose,
    handleStatusChange,
    statusOptions,
    selectedCodeIndex,
}) => {
    if (!isOpen || !selectedPromo) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Promo Code Details</h2>
                        <p className="mt-0.5 text-sm text-gray-500">Promo Code Name</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-lg text-gray-500 hover:bg-gray-200"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* Promo Code Name */}
                <div className="mb-6 rounded-lg bg-gray-50 p-4">
                    <p className="text-lg font-bold text-gray-900">{selectedPromo.code}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 mb-6">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Discount Type</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{selectedPromo.discountType}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Discount Value</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{selectedPromo.discountValue}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Minimum Order</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{selectedPromo.minOrder}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Expiry Date</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{selectedPromo.expiryDate}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Usage Limited</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{selectedPromo.usageLimit}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Used Count</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{selectedPromo.usedCount}</p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Applicable User</p>
                        <p className="mt-1 text-sm text-gray-700">New User</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Applicable Category</p>
                        <p className="mt-1 text-sm text-gray-700">iPhone</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Applicable Product</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {['iPhone 16 plus', 'iPhone 16 plus', 'iPhone 16 plus'].map((product, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                    {product}
                                    <button className="hover:text-gray-900">×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Update Status */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Update Order Status</h3>
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => handleStatusChange(selectedCodeIndex, status)}
                                className={`rounded-md border px-4 py-1.5 text-sm font-medium transition ${
                                    selectedPromo.status === status
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

export default ViewDetailsModal;
