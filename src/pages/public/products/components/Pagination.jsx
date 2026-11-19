import { Link } from 'react-router';

function getPageItems(currentPage, totalPages) {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items = [];
  items.push(1);

  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  if (left > 2) items.push('...');

  for (let i = left; i <= right; i++) items.push(i);

  if (right < totalPages - 1) items.push('...');

  items.push(totalPages);

  return items;
}

/**
 * Crawlable pagination: real <a href> links for bots, SPA navigation for users.
 * buildHref(pageNumber) should return a path like /phones/new?page=2
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  buildHref,
}) {
  const pageItems = getPageItems(currentPage, totalPages);

  const hrefFor = (page) =>
    typeof buildHref === 'function' ? buildHref(page) : `?page=${page}`;

  const handleNav = (event, page) => {
    if (!onPageChange) return;
    event.preventDefault();
    onPageChange(page);
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      {currentPage > 1 ? (
        <Link
          to={hrefFor(currentPage - 1)}
          onClick={(e) => handleNav(e, currentPage - 1)}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-custom hover:text-custom transition-colors"
          aria-label="Previous page"
          rel="prev"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      ) : (
        <span className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-300 opacity-50 cursor-not-allowed">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </span>
      )}

      {pageItems.map((item, idx) =>
        item === '...' ? (
          <span key={`ellipsis-${idx}`} className="text-gray-400 text-sm px-1">
            ...
          </span>
        ) : currentPage === item ? (
          <span
            key={item}
            aria-current="page"
            className="w-8 h-8 rounded-lg text-sm font-medium border bg-custom border-custom text-white flex items-center justify-center"
          >
            {item}
          </span>
        ) : (
          <Link
            key={item}
            to={hrefFor(item)}
            onClick={(e) => handleNav(e, item)}
            className="w-8 h-8 rounded-lg text-sm font-medium border bg-white border-gray-200 text-gray-600 hover:border-custom flex items-center justify-center transition-all"
          >
            {item}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          to={hrefFor(currentPage + 1)}
          onClick={(e) => handleNav(e, currentPage + 1)}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-custom hover:text-custom transition-colors"
          aria-label="Next page"
          rel="next"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-300 opacity-50 cursor-not-allowed">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </div>
  );
}
