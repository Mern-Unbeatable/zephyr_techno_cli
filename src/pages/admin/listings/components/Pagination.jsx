import React from 'react';

const getPageItems = (currentPage, totalPages) => {
    if (totalPages <= 6) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const items = [];

    // Always show pages 1, 2, 3
    items.push(1, 2, 3);

    // Show ellipsis if currentPage is far from page 3
    if (currentPage > 5) {
        items.push('...');
    }

    // Show currentPage if it's beyond the first block
    if (currentPage > 3 && currentPage < totalPages) {
        if (!items.includes(currentPage - 1) && currentPage - 1 > 3) items.push(currentPage - 1);
        if (!items.includes(currentPage)) items.push(currentPage);
        if (!items.includes(currentPage + 1) && currentPage + 1 < totalPages) items.push(currentPage + 1);
    }

    // Show ellipsis before last page
    const lastItem = items[items.length - 1];
    if (lastItem !== '...' && lastItem < totalPages - 1) {
        items.push('...');
    }

    // Always show last page
    if (!items.includes(totalPages)) {
        items.push(totalPages);
    }

    return items;
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageItems = getPageItems(currentPage, totalPages);

    return (
        <div className="flex items-center justify-center gap-1 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {pageItems.map((item, i) =>
                item === '...' ? (
                    <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
                        ...
                    </span>
                ) : (
                    <button
                        key={item}
                        onClick={() => onPageChange(item)}
                        className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                            currentPage === item
                                ? 'bg-custom text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {item}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};

export default Pagination;