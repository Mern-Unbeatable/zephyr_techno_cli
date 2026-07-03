const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
            onClick={onClose}
        >
            <div
                className={`w-full ${maxWidth} rounded-lg bg-white p-6 shadow-lg`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-2xl leading-none text-gray-400 hover:text-gray-600 transition cursor-pointer"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
