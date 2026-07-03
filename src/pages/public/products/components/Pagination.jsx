function getPageItems(currentPage, totalPages) {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items = [];
  // always include first page
  items.push(1);

  // determine window
  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  if (left > 2) items.push('...');

  for (let i = left; i <= right; i++) items.push(i);

  if (right < totalPages - 1) items.push('...');

  items.push(totalPages);

  return items;
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pageItems = getPageItems(currentPage, totalPages);

  const handlePrev = () => onPageChange(Math.max(1, currentPage - 1));
  const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-custom hover:text-custom transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pageItems.map((item, idx) =>
        item === '...' ? (
          <span key={`ellipsis-${idx}`} className="text-gray-400 text-sm px-1">...</span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`w-8 h-8 rounded-lg text-sm font-medium border transition-all
              ${
                currentPage === item
                  ? 'bg-custom border-custom text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-custom'
              }`}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-custom hover:text-custom transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}