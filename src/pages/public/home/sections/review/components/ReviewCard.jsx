const ReviewCard = ({ review, isActive }) => (
    <div
        className={[
            'p-6 rounded-xl border transition-all duration-500 select-none',
            isActive
                ? 'bg-white shadow-lg border-gray-200 scale-110 z-10'
                : 'bg-white border-gray-100 shadow-sm scale-95 opacity-70',
        ].join(' ')}
    >
        <StarRating count={review.stars} />

        <p className={['text-gray-600 text-sm leading-relaxed mb-4', isActive ? '' : 'line-clamp-4'].join(' ')}>
            {review.text}
        </p>

        <p className="font-bold text-gray-800 text-sm">— {review.author}</p>
    </div>
);
export default ReviewCard;