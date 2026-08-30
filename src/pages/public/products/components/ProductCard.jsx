import { useState } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";
import { useCart } from "../../../../context/CartContext";
import PriceDisplay from "../../../../components/shared/PriceDisplay";
import { getColorHex, isLightColor } from "../../../../utils/color";
import { formatStorageLabel } from "../../../../utils/storageSort";

export default function ProductCard({ product }) {
  const [status, setStatus] = useState("idle");
  const { addToCart } = useCart();

  const title = product.title || product.name;
  const badge = product.badge || product.tag;
  const colorId = product.colorId || product.colorIds?.[0] || null;
  const storageOptionId =
    product.storageOptionId || product.storageOptionIds?.[0] || null;
  const colors = product.colors || [];
  const storageOptions = product.storageOptions || [];
  const imageSrc = product.images?.find(Boolean) || null;
  const isInStock =
    typeof product.inStock === "boolean"
      ? product.inStock
      : Math.max(0, Number(product.stockQuantity) || 0) > 0;
  const showStockBadge =
    typeof product.inStock === "boolean" || product.stockQuantity != null;

  const params = new URLSearchParams();
  if (colorId) params.set("colorId", colorId);
  if (storageOptionId) params.set("storageOptionId", storageOptionId);
  const query = params.toString();
  const to = query
    ? `/product-details/${product.id}?${query}`
    : `/product-details/${product.id}`;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInStock || status === "loading") return;
    setStatus("loading");
    try {
      const result = await addToCart({
        productId: product.id,
        quantity: 1,
        ...(colorId && { colorId }),
        ...(storageOptionId && { storageOptionId }),
      });
      if (result?.success) {
        setStatus("added");
      } else {
        setStatus("error");
        await Swal.fire({
          icon: "warning",
          title: "Unable to add to cart",
          text: result?.message || "This item may be out of stock.",
          confirmButtonColor: "#47B5C9",
        });
      }
    } catch {
      setStatus("error");
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#47B5C9",
      });
    } finally {
      setTimeout(() => setStatus("idle"), 2200);
    }
  };

  return (
    <Link
      to={to}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white
      transition-all duration-300 group cursor-pointer"
    >
      <div className="relative h-52 w-full shrink-0 overflow-hidden bg-transparent">
        {badge ? (
          <span
            className={`absolute top-0 left-3 z-10 rounded-bl-lg rounded-br-lg px-2 py-0.5 text-[10px] font-bold tracking-wider text-white ${product.badgeColor}`}
          >
            {badge}
          </span>
        ) : null}
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
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-gray-900 md:min-h-[2.75rem] md:text-base">
          {title}
        </h3>
        {product.variant ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-[#767E97] lg:text-sm">
            {product.variant}
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
          <PriceDisplay
            price={product.price}
            compareAtPrice={product.oldPrice}
            size="md"
          />
        </div>

        <div className="mt-auto pt-3">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!isInStock || status === "loading"}
            className={`w-full cursor-pointer rounded-lg py-2 text-sm font-medium text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${
              !isInStock
                ? "bg-gray-400"
                : status === "added"
                  ? "bg-green-500"
                  : status === "error"
                    ? "bg-red-400"
                    : "bg-custom"
            }`}
          >
            {!isInStock
              ? "Out of Stock"
              : status === "loading"
                ? "..."
                : status === "added"
                  ? "✓ Added!"
                  : status === "error"
                    ? "Try Again"
                    : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}
