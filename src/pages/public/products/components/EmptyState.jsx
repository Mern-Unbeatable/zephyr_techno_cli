export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
      <svg
        className="w-12 h-12 mb-3 text-gray-200"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-sm">No products match your filters.</p>
    </div>
  );
}