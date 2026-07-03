import React from 'react';

const badgeColors = {
    'New': 'bg-blue-500 text-white',
    'Old': 'bg-gray-500 text-white',
    'Excellent': 'bg-green-500 text-white',
    'Good': 'bg-cyan-500 text-white',
    'Broken': 'bg-red-500 text-white',
};

const unitsColors = {
    'New': 'text-orange-500',
    'Old': 'text-gray-600',
    'Excellent': 'text-blue-500',
    'Good': 'text-blue-400',
    'Broken': 'text-orange-500',
};

const Card = ({
    image,
    title,
    storage,
    ram,
    originalPrice,
    discountedPrice,
    stock,
    units,
    badge,
    onEdit,
    onDelete,
    onFavorite,
    isFavorite,
}) => {
    const badgeClass = badgeColors[badge] || 'bg-gray-400 text-white';
    const unitsClass = unitsColors[badge] || 'text-gray-500';

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Image container */}
            <div className="relative bg-[#F7F9FB] flex items-center justify-center py-8 px-4 h-56">
                <img
                    src={image}
                    alt={title}
                    className="h-56 object-contain transition-transform duration-300"
                />
                {/* Badge top-left */}
                <span className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded ${badgeClass}`}>
                    {badge}
                </span>
                {/* Favorite button top-right */}
                <button
                    onClick={onFavorite}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:scale-105 transition-transform cursor-pointer"
                >
                    <svg
                        className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400 stroke-yellow-400' : 'fill-none stroke-gray-400'}`}
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                    >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                </button>
            </div>

            {/* Card body */}
            <div className="p-4">
                {/* Title */}
                <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>

                {/* Specs - Storage & RAM */}
                <div className="flex gap-8 text-sm text-gray-500 mb-3">
                    {storage && <span>{storage}</span>}
                    {ram && <span>{ram}</span>}
                </div>

                {/* Price + Stock row */}
                <div className="flex items-end justify-between mb-3">
                    <div>
                        {/* <p className="text-sm text-gray-400 line-through">
                            ${originalPrice.toLocaleString()}
                        </p> */}
                        <p className="text-lg font-semibold text-gray-900">
                            ${discountedPrice.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right text-sm">
                        <p className="text-gray-500">{stock}</p>
                        <p className={`font-medium ${unitsClass}`}>{units}</p>
                    </div>
                </div>

                {/* Edit / Delete buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onEdit}
                        className="flex-1 btn-custom text-white text-sm font-medium py-2 rounded transition-colors cursor-pointer"
                    >
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 rounded transition-colors cursor-pointer"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Card;