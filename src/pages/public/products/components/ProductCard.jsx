import { useState } from "react";
import { Link } from "react-router";
import Stars from "./Stars";
import { useCart } from "../../../../context/CartContext";

export default function ProductCard({ product }) {
  const [status, setStatus] = useState('idle'); // idle | loading | added | error
  const { addToCart } = useCart();

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === 'loading') return;
    setStatus('loading');
    try {
      const result = await addToCart({
        productId: product.id,
        quantity: 1,
        ...(product.colorIds?.length && { colorId: product.colorIds[0] }),
        ...(product.storageOptionIds?.length && { storageOptionId: product.storageOptionIds[0] }),
        ...(product.ramOptionIds?.length && { ramOptionId: product.ramOptionIds[0] }),
      });
      if (result?.success) {
        setStatus('added');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 2200);
    }
  };

  return (
    <Link
      to={`/product-details/${product.id}`}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden
      transition-all duration-300 group cursor-pointer"
    >
      {/* Image */}
      <div className="relative bg-[#F7F9FB] flex items-center justify-center py-6 px-4 h-52">
        <span
          className={`absolute top-0 left-3 text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-bl-lg rounded-br-lg ${product.badgeColor}`}
        >
          {product.badge}
        </span>
        {/* Favorite icon disabled for now */}

        {/* <img
          src={product.images[0]}
          alt={product.name}
          className="h-52 object-contain transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/200x200/f3f4f6/94a3b8?text=Phone";
          }}
        /> */}
        <figure className="">
          {product.images &&
            product.images.map((img, index) => (
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
          <Stars rating={product.rating} />
          <span className="text-xs md:text-sm text-gray-400">
            ({product.reviews})
          </span>
        </div>
        <h3 className="text-sm md:text-base font-semibold text-gray-900 leading-tight">
          {product.name}
        </h3>
        <p className="text-xs lg:text-sm text-[#767E97] mt-0.5 line-clamp-1">
          {product.storage} · {product.color}
        </p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg md:text-xl font-bold text-[#1C2337]">
            ${product.price}
          </span>
          {product.oldPrice && (
            <span className="text-xs md:text-sm text-gray-400 line-through">
              ${product.oldPrice}
            </span>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={status === 'loading'}
          className={`mt-3 w-full active:scale-95 text-white py-2 rounded-lg text-sm cursor-pointer font-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${
            status === 'added' ? 'bg-green-500' : status === 'error' ? 'bg-red-400' : 'bg-custom'
          }`}
        >
          {status === 'loading' ? '...' : status === 'added' ? '✓ Added!' : status === 'error' ? 'Try Again' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
