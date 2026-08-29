import React from "react";
import { Link } from "react-router-dom";
import PriceDisplay from "../../../../../../components/shared/PriceDisplay";

const Card = ({ id, title, tag, badgeColor, variant, price, oldPrice, images }) => {
  const imageSrc = images?.find(Boolean) || null;

  return (
    <Link
      to={`/product-details/${id}`}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300"
    >
      {/* Image — fills card width/height, no gray pad */}
      <div className="relative h-52 w-full shrink-0 overflow-hidden bg-transparent">
        <span
          className={`absolute top-0 left-3 z-10 rounded-bl-lg rounded-br-lg px-2 py-0.5 text-[10px] font-bold tracking-wider text-white ${badgeColor}`}
        >
          {tag}
        </span>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="info-hover flex flex-1 flex-col px-4 pt-3 pb-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-gray-900 md:text-base">
          {title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-[#767E97] lg:text-sm">
          {variant}
        </p>
        <div className="mt-2">
          <PriceDisplay price={price} compareAtPrice={oldPrice} size="md" />
        </div>
      </div>
    </Link>
  );
};

export default Card;
