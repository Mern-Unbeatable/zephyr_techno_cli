import { useState } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";
import { useCart } from "../../../../context/CartContext";
import PriceDisplay from "../../../../components/shared/PriceDisplay";

export default function ProductCard({ product }) {
  const [status, setStatus] = useState("idle"); // idle | loading | added | error
  const { addToCart } = useCart();
  const imageSrc = product.images?.find(Boolean) || null;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const result = await addToCart({
        productId: product.id,
        quantity: 1,
        ...(product.colorIds?.length && { colorId: product.colorIds[0] }),
        ...(product.storageOptionIds?.length && {
          storageOptionId: product.storageOptionIds[0],
        }),
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
      to={`/product-details/${product.id}`}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white
      transition-all duration-300 group cursor-pointer"
    >
      {/* Image — fixed height so cards align even without a thumbnail */}
      <div className="relative flex h-52 shrink-0 items-center justify-center  px-4 py-6">
        <span
          className={`absolute top-0 left-3 z-10 rounded-bl-lg rounded-br-lg px-2 py-0.5 text-[10px] font-bold tracking-wider text-white ${product.badgeColor}`}
        >
          {product.badge}
        </span>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="h-full max-h-40 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Info — grows so Add to Cart stays on one row across cards */}
      <div className="info-hover flex flex-1 flex-col px-4 pt-3 pb-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-gray-900 md:min-h-[2.75rem] md:text-base">
          {product.name}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-[#767E97] lg:text-sm">
          {product.storage} · {product.color}
        </p>
        <div className="mt-2 min-h-[3.75rem]">
          <PriceDisplay
            price={product.price}
            compareAtPrice={product.oldPrice}
            size="md"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={status === "loading"}
          className={`mt-auto w-full cursor-pointer rounded-lg py-2 text-sm font-medium text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${
            status === "added"
              ? "bg-green-500"
              : status === "error"
                ? "bg-red-400"
                : "bg-custom"
          }`}
        >
          {status === "loading"
            ? "..."
            : status === "added"
              ? "✓ Added!"
              : status === "error"
                ? "Try Again"
                : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}
