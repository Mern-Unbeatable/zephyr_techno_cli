import React from "react";
import { Link } from "react-router-dom";
import Stars from "../../../../products/components/Stars";

const Card = ({ id, title, tag, badgeColor, variant, price, oldPrice, currency, rating, reviews, images }) => {
  return (
    <Link
      to={`/product-details/${id}`}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden
      transition-all duration-300 group cursor-pointer"
    >
      {/* Image */}
      <div className="relative bg-[#F7F9FB] flex items-center justify-center py-6 sm:px-4 h-52">
        <span
          className={`absolute top-0 left-3 text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-bl-lg rounded-br-lg ${badgeColor}`}
        >
          {tag}
        </span>
        {/* Favorite icon disabled for now */}

        <figure className="">
          {images && images.map((img, index) => (
            <img
              key={index}
              src={img}
              className="h-52 object-contain transition-transform duration-500"
            />
          ))}
        </figure>
      </div>

      {/* Info */}
      <div className="px-4 pt-3 pb-4 info-hover">
        <div className="flex items-center gap-1.5 mb-1">
          <Stars rating={rating} />
          <span className="text-xs md:text-sm text-gray-400">({reviews})</span>
        </div>
        <h3 className="text-sm md:text-base font-semibold text-gray-900 leading-tight">
          {title}
        </h3>
        <p className="text-xs lg:text-sm text-[#767E97] mt-0.5 line-clamp-1">
          {variant}
        </p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg md:text-xl font-bold text-[#1C2337]">
            £{price}
          </span>
          {oldPrice && (
            <span className="text-xs md:text-sm text-gray-400 line-through">
              £{oldPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Card;
