import React, { useEffect, useState } from 'react';

const Modal = ({ isOpen = false, onClose = () => {}, onSend = () => {} }) => {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleSend = () => {
        if (!reason.trim()) return;
        onSend(reason.trim());
        setReason('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative z-10 w-full max-w-xl rounded-lg bg-white shadow-lg">
                <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
                    <h3 className="text-lg font-semibold">Cancel Order</h3>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className="ml-4 inline-flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="px-6 py-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Reason</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Write why you cancel this order"
                        className="h-36 w-full resize-none rounded-lg border border-gray-300 bg-white p-4 text-sm placeholder-gray-400 focus:border-custom focus:ring-1 focus:ring-custom"
                    />

                    <div className="mt-6">
                        <button
                            onClick={handleSend}
                            disabled={!reason.trim()}
                            className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-medium text-white ${reason.trim() ? 'bg-custom hover:opacity-90' : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                            Send Email
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;