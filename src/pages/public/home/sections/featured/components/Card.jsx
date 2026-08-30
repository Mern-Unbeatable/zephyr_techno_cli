import React from "react";
import { Link } from "react-router-dom";
import PriceDisplay from "../../../../../../components/shared/PriceDisplay";
import { getColorHex, isLightColor } from "../../../../../../utils/color";
import { formatStorageLabel } from "../../../../../../utils/storageSort";

const Card = ({
  id,
  title,
  tag,
  badgeColor,
  variant,
  price,
  oldPrice,
  images,
  colors = [],
  storageOptions = [],
  colorId,
  storageOptionId,
  inStock,
  stockQuantity,
}) => {
  const imageSrc = images?.find(Boolean) || null;
  const params = new URLSearchParams();
  if (colorId) params.set("colorId", colorId);
  if (storageOptionId) params.set("storageOptionId", storageOptionId);
  const query = params.toString();
  const to = query ? `/product-details/${id}?${query}` : `/product-details/${id}`;

  const showStockBadge = typeof inStock === "boolean" || stockQuantity != null;
  const isInStock =
    typeof inStock === "boolean"
      ? inStock
      : Math.max(0, Number(stockQuantity) || 0) > 0;

  return (
    <Link
      to={to}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300"
    >
      <div className="relative h-52 w-full shrink-0 overflow-hidden bg-transparent">
        <span
          className={`absolute top-0 left-3 z-10 rounded-bl-lg rounded-br-lg px-2 py-0.5 text-[10px] font-bold tracking-wider text-white ${badgeColor}`}
        >
          {tag}
        </span>
        {showStockBadge ? (
          <span
            className={`absolute top-0 right-3 z-10 rounded-bl-lg rounded-br-lg px-2 py-0.5 text-[10px] font-bold tracking-wider text-white ${
              isInStock ? "bg-emerald-500" : "bg-gray-500"
            }`}
          >
            {isInStock ? "In stock" : "Out of stock"}
          </span>
        ) : null}
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
        {variant ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-[#767E97] lg:text-sm">
            {variant}
          </p>
        ) : null}

        {colors.length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {colors.map((color) => {
              const hex = getColorHex(color.name, color.hexCode);
              return (
                <span
                  key={color.id}
                  title={color.name}
                  aria-label={color.name}
                  className={`h-4 w-4 shrink-0 rounded-full border ${
                    isLightColor(hex) ? "border-gray-300" : "border-transparent"
                  }`}
                  style={{ backgroundColor: hex }}
                />
              );
            })}
          </div>
        ) : null}

        {storageOptions.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {storageOptions.map((storage) => (
              <span
                key={storage.id}
                className="rounded border border-gray-200 bg-[#F8FAFC] px-1.5 py-0.5 text-[10px] font-medium text-[#475569]"
              >
                {formatStorageLabel(storage.name)}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-2">
          <PriceDisplay price={price} compareAtPrice={oldPrice} size="md" />
        </div>
      </div>
    </Link>
  );
};

export default Card;
