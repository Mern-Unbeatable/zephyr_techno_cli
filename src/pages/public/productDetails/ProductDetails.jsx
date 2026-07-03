import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Container from "../../../layout/Container";
import {
  FiMinus,
  FiPlus,
  FiChevronDown,
  FiCheckCircle,
  FiTruck,
  FiPackage,
  FiLock,
  FiHeadphones,
  FiCreditCard,
} from "react-icons/fi";
import RelatedProducts from "./sections/relatedProduct/RelatedProducts";
import { useCart } from "../../../context/CartContext";
import Swal from 'sweetalert2';
import { getColorHex, isLightColor } from '../../../utils/color';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FAQ_TRANSITION = { duration: 0.25, ease: [0.4, 0, 0.2, 1] };

const TRUST_BADGES = [
  { label: 'Genuine Devices', icon: FiCheckCircle },
  { label: 'Factory Sealed', icon: FiPackage },
  { label: 'Fast UK Delivery', icon: FiTruck },
  { label: 'Secure Checkout', icon: FiLock },
  { label: 'Secure Payment', icon: FiCreditCard },
];

const WHY_CHOOSE_ITEMS = [
  {
    title: 'Genuine Devices',
    description:
      'Every device is 100% genuine and sourced from trusted suppliers.',
    icon: FiCheckCircle,
  },
  {
    title: 'Brand New & Factory Sealed',
    description:
      'New devices arrive factory sealed unless stated otherwise.',
    icon: FiPackage,
  },
  {
    title: 'Fast UK Delivery',
    description: 'Tracked UK delivery with secure packaging.',
    icon: FiTruck,
  },
  {
    title: 'Dedicated Customer Support',
    description: 'Our Team Is Here To Assist You Before. During And After Your Purchase.',
    icon: FiHeadphones,
  },
];

function sortImages(images = []) {
  return [...images].sort((a, b) => a.displayOrder - b.displayOrder);
}

function getImageIndexForColor(images, colorId) {
  const sorted = sortImages(images);
  if (!sorted.length) return 0;
  if (!colorId) return 0;

  const colorIdx = sorted.findIndex((img) => img.colorId === colorId);
  if (colorIdx >= 0) return colorIdx;

  const sharedIdx = sorted.findIndex((img) => !img.colorId);
  return sharedIdx >= 0 ? sharedIdx : 0;
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [selectedRam, setSelectedRam] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeFaq, setActiveFaq] = useState(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`${BASE_URL}/api/public/product/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load product");
        return res.json();
      })
      .then((json) => {
        const data = json.data;
        const firstColorId = data.availableColors?.[0]?.id ?? null;
        setProduct(data);
        setSelectedColor(firstColorId);
        setSelectedStorage(data.availableStorageOptions?.[0]?.id ?? null);
        setSelectedRam(data.availableRamOptions?.[0]?.id ?? null);
        setSelectedImage(getImageIndexForColor(data.images, firstColorId));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const allImages = useMemo(() => sortImages(product?.images), [product]);

  const selectColor = (colorId) => {
    setSelectedColor(colorId);
    setSelectedImage(getImageIndexForColor(product?.images, colorId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-custom" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "Product not found."}
      </div>
    );
  }

  const handleAddToCart = async (redirectAfter = false) => {
    setAddingToCart(true);
    setCartMessage('');
    try {
      const result = await addToCart({
        productId: product.id,
        colorId: selectedColor || undefined,
        storageOptionId: selectedStorage || undefined,
        ramOptionId: selectedRam || undefined,
        quantity,
      });
      if (result.success) {
        if (redirectAfter) {
          navigate('/checkout');
        } else {
          setCartMessage('Added to cart!');
          setTimeout(() => setCartMessage(''), 2500);
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: result.message || 'Failed to add to cart.',
          confirmButtonColor: '#47B5C9'
        });
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong.',
        confirmButtonColor: '#47B5C9'
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const highlights = product
    ? [...product.highlights].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];
  const specifications = product
    ? [...product.specifications].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];
  const includedItems = product
    ? [...(product.includedItems || [])].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      )
    : [];

  return (
    <div className="min-h-screen bg-white pb-20">
      <Container>
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 pt-8 md:pt-12 mb-20">
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 shrink-0">
            <div className="rounded-xl overflow-hidden mb-3 aspect-4/3 flex items-center justify-center bg-gray-50">
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImage]?.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-400 text-sm">No image</span>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {allImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => {
                      if (img.colorId) {
                        selectColor(img.colorId);
                      } else {
                        setSelectedImage(idx);
                      }
                    }}
                    className={`aspect-4/3 rounded-lg border-2 overflow-hidden transition-all p-0.5 ${
                      selectedImage === idx
                        ? "border-custom"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={`${product.title} view ${idx + 1}`}
                      className="w-full h-full object-contain rounded-md bg-gray-50"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col justify-start">
            <div className="mb-6">
              <p className="text-sm font-bold tracking-widest text-[#94A3B8] uppercase mb-1">
                {product.series?.name}
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-[42px] xl:text-[48px] font-semibold text-[#151A2A] mb-2 tracking-tight">
                {product.title}
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-[#151A2A]">
                £{Number(product.basePrice).toLocaleString()}
              </p>
              {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                <p className="text-sm text-orange-500 mt-1">
                  Only {product.stockQuantity} left in stock
                </p>
              )}
              {product.stockQuantity === 0 && (
                <p className="text-sm text-red-500 mt-1">Out of stock</p>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {TRUST_BADGES.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-[#F8FAFC] px-2 py-2"
                  >
                    <Icon className="shrink-0 text-custom" size={14} />
                    <span className="text-[10px] sm:text-[11px] font-medium text-[#151617] leading-none whitespace-nowrap">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div className="mb-6">
              <p className="text-sm font-bold tracking-widest text-[#151A2A] uppercase mb-2">
                Condition
              </p>
              <span className="px-4 py-2 rounded-sm text-[13px] border border-[#151A2A] text-[#151A2A] inline-block">
                {product.condition?.name || product.category?.name || 'New'}
              </span>
            </div>

            {/* Color */}
            {product.availableColors?.length > 0 && (
              <div className="mb-6 pb-4 border-b border-gray-200">
                <p className="text-[11px] font-bold tracking-widest text-[#151A2A] uppercase mb-3">
                  COLOR
                </p>
                <div className="flex flex-wrap gap-3 items-center">
                  {product.availableColors.map((c) => {
                    const hex = getColorHex(c.name, c.hexCode);
                    const isSelected = selectedColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        title={c.name}
                        aria-label={c.name}
                        aria-pressed={isSelected}
                      onClick={() => selectColor(c.id)}
                        className={`w-8 h-8 rounded-full transition-all shrink-0 ${
                          isSelected
                            ? 'ring-2 ring-[#151A2A] ring-offset-2 scale-105'
                            : 'hover:scale-105'
                        } ${isLightColor(hex) ? 'border border-gray-300' : ''}`}
                        style={{
                          backgroundColor: hex,
                          boxShadow: isLightColor(hex)
                            ? 'inset 0 0 0 1px #e5e7eb'
                            : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Storage */}
            {product.availableStorageOptions?.length > 0 && (
              <div className="mb-4">
                <p className="text-[11px] font-bold tracking-widest text-[#151A2A] uppercase mb-2">
                  Storage
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.availableStorageOptions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStorage(s.id)}
                      className={`px-4 py-2 rounded-sm text-[13px] border transition-colors ${
                        selectedStorage === s.id
                          ? "bg-custom border-custom text-white"
                          : "border-gray-300 text-gray-500 hover:border-gray-400 bg-white"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RAM */}
            {/* {product.availableRamOptions?.length > 0 && (
              <div className="mb-8">
                <p className="text-[11px] font-bold tracking-widest text-[#151A2A] uppercase mb-2">
                  RAM
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.availableRamOptions.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRam(r.id)}
                      className={`px-4 py-2 rounded-sm text-[13px] border transition-colors ${
                        selectedRam === r.id
                          ? "bg-custom border-custom text-white"
                          : "border-gray-300 text-gray-500 hover:border-gray-400 bg-white"
                      }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            )} */}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-3 mt-auto">
              <div className="flex items-center border border-gray-300 rounded-sm px-3 py-2 w-full sm:w-24 justify-between shrink-0 h-11">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-gray-500 hover:text-[#151A2A]"
                >
                  <FiMinus size={14} />
                </button>
                <span className="text-sm font-semibold text-[#151A2A]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-gray-500 hover:text-[#151A2A]"
                  disabled={product.stockQuantity !== null && quantity >= product.stockQuantity}
                >
                  <FiPlus size={14} />
                </button>
              </div>
              <button
                onClick={() => handleAddToCart(false)}
                disabled={addingToCart || product.stockQuantity === 0}
                className="sm:flex-1 bg-[#47B5C9] hover:bg-[#349eab] text-white rounded-sm font-medium text-sm transition-colors h-11 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {addingToCart ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : cartMessage ? (
                  <span className="text-white text-sm">{cartMessage}</span>
                ) : (
                  'Add to Cart'
                )}
              </button>
            </div>
            <button
              onClick={() => handleAddToCart(true)}
              disabled={addingToCart || product.stockQuantity === 0}
              className="w-full border border-gray-800 text-[#151A2A] hover:bg-gray-50 rounded-sm font-medium text-sm transition-colors h-11 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>
        </div>

        {/* ── INTRODUCTION ── */}
        {product.introduction && (
          <section className="mb-16 lg:mb-20 max-w-3xl mx-auto text-center px-2">
            <h2 className="title-custom text-[#151A2A] mb-4">
              About the {product.title}
            </h2>
            <p className="subtitle-custom whitespace-pre-line text-[#64748B] leading-relaxed">
              {product.introduction}
            </p>
          </section>
        )}

        {/* ── HIGHLIGHTS ── */}
        {highlights.length > 0 && (
          <section className="mb-16 lg:mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
              {highlights.map((h) => (
                <div key={h.id} className="bg-[#F0F4F6] rounded-2xl p-6 lg:p-8 h-full">
                  {h.iconUrl ? (
                    <img src={h.iconUrl} alt={h.title} className="w-6 h-6 mb-4" />
                  ) : (
                    <div className="w-6 h-6 mb-4 rounded-full bg-custom/20" />
                  )}
                  <h3 className="text-base font-bold text-[#595E71] mb-2">
                    {h.title}
                  </h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    {h.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── TECHNICAL SPECS ── */}
        {specifications.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-bold text-[#151A2A] mb-8">
              Technical Specifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {specifications.map((spec) => (
                <div
                  key={spec.id}
                  className="bg-[#F0F4F6] px-5 py-3.5 rounded flex justify-between items-center"
                >
                  <span className="text-base text-[#64748B]">{spec.name}</span>
                  <span className="text-base font-medium text-[#171C1E]">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {includedItems.length > 0 && (
          <section className="mb-16 lg:mb-20">
            <h2 className="text-xl lg:text-2xl font-bold text-[#151A2A] mb-6 lg:mb-8">
              What&apos;s Included
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
              {includedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#F8FAFC] border border-gray-100 rounded-xl px-5 py-4 flex items-center gap-3"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-custom" />
                  <span className="text-base font-medium text-[#151A2A]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── WHY CHOOSE & FAQ ── */}
        <section className="pt-10 lg:pt-12 border-t border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-start">
            {/* Left: Why Choose */}
            <div>
              <h2 className="text-xl font-semibold text-[#151A2A] mb-6">
                Why Choose Zephyr Technology?
              </h2>
              <div className="space-y-6">
                {WHY_CHOOSE_ITEMS.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#e8f6f8] flex items-center justify-center shrink-0 text-custom">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#151A2A] mb-1.5">
                        {title}
                      </h3>
                      <p className="text-base text-[#64748B]">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Contact CTA + FAQ */}
            {product.faqs?.length > 0 && (
              <div className="lg:sticky lg:top-8">
                <div className="rounded-xl border border-gray-200 bg-linear-to-br from-[#F8FAFC] to-white p-6 lg:p-8 mb-8">
                  <h2 className="text-xl font-semibold text-[#151A2A] mb-2">
                    Need More Information?
                  </h2>
                  <p className="text-sm lg:text-base text-[#64748B] leading-relaxed mb-5">
                    Can&apos;t find the answer you&apos;re looking for? Contact our team
                    and we&apos;ll be happy to help.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center rounded-lg bg-linear-to-b from-[#00B8DB] to-custom px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110"
                  >
                    Contact Us
                  </Link>
                </div>

                <h2 className="text-xl lg:text-2xl font-semibold text-[#151A2A] mb-5 lg:mb-6">
                  Frequently Asked Questions
                </h2>
              <div className="space-y-3">
                {product.faqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  const faqMotion = prefersReducedMotion
                    ? { duration: 0 }
                    : FAQ_TRANSITION;

                  return (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-base font-medium text-[#151A2A] pr-4">
                        {faq.question}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={faqMotion}
                        className="text-gray-400 shrink-0 inline-flex"
                      >
                        <FiChevronDown size={18} />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={faqMotion}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 text-base text-[#64748B] leading-relaxed border-t border-gray-100 whitespace-pre-line">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  );
                })}
              </div>
              </div>
            )}
          </div>
        </section>

        {/* ── RELATED PRODUCTS ── */}
        {product.relatedProducts?.length > 0 && (
          <RelatedProducts products={product.relatedProducts} />
        )}
      </Container>
    </div>
  );
};

export default ProductDetails;
