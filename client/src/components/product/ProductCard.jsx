import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth.js";
import {
  addToWishlist,
  removeFromWishlist,
  selectWishlistItems
} from "../../features/wishlist/wishlistSlice.js";
import { addItemToCart } from "../../features/cart/cartSlice.js";
import { StarIcon, HeartIcon, EyeIcon, CubeIcon } from "../common/Icons.jsx";
import { formatCurrency, calculateSavings } from "../../utils/formatters.js";
import { getProductImages, COLOR_SWATCH_MAP } from "../../utils/productImages.js";

/**
 * Reusable Product Card Component — Warm-light Japandi luxury aesthetic.
 * Features dual-image hover preview, color swatches, stock counter, and verified photography.
 */
export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [imageError, setImageError] = useState(false);
  const [added, setAdded] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const wishlistItems = useSelector(selectWishlistItems);

  const handleMouseMove = (e) => {
    // Disable on mobile/touch devices or reduced motion
    if (
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // rotateX max 3deg, rotateY max 5deg
    const rotateX = ((centerY - y) / centerY) * 3;
    const rotateY = ((x - centerX) / centerX) * 5;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  if (!product) return null;

  const isWishlisted = Boolean(
    wishlistItems.some(
      (item) => (item.product?._id || item.product || item._id) === product._id
    )
  );

  // Determine target route
  const productUrl = product.slug ? `/product/${product.slug}` : `/products/${product._id}`;

  // Image source resolution with guaranteed fallback
  const { primary: resolvedPrimary, secondary: resolvedSecondary } = getProductImages(product);

  const primaryImage =
    !imageError && product.images && product.images.length > 0 && !product.images[0].startsWith("/images/products/")
      ? product.images[0].url || product.images[0]
      : resolvedPrimary;

  const secondaryImage =
    product.images && product.images.length > 1 && !product.images[1].startsWith("/images/products/")
      ? product.images[1].url || product.images[1]
      : resolvedSecondary || primaryImage;

  const hasDiscount = product.discount && product.discount > 0;
  const originalPrice = product.price;
  const finalPrice =
    product.finalPrice ||
    (hasDiscount ? Math.round(originalPrice * (1 - product.discount / 100)) : originalPrice);
  const savings = calculateSavings(originalPrice, product.discount);

  const categoryName =
    product.category?.name ||
    product.categoryName ||
    (typeof product.category === "string" ? product.category : "");

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addItemToCart({ productId: product._id, quantity: 1 }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          y: isHovered ? -4 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.6
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="group relative h-full bg-white hover:bg-white/85 hover:backdrop-blur-md border border-neutral-200/80 hover:border-neutral-300 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between shadow-xs hover:shadow-lg transition-colors duration-300"
      >
        {/* Image Container with depth movement */}
        <div
          style={{
            transform: `translate3d(${tilt.y * 1.2}px, ${-tilt.x * 1.2}px, 12px)`,
            transition: "transform 150ms ease-out"
          }}
          className="relative w-full aspect-square bg-neutral-50 rounded-xl overflow-hidden mb-3.5 flex items-center justify-center border border-neutral-100"
        >
        <Link to={productUrl} className="w-full h-full relative flex items-center justify-center">
          {/* Primary Product Photo */}
          <img
            src={primaryImage}
            alt={product.name}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover p-0 transition-all duration-500 ease-out ${
              isHovered && secondaryImage !== primaryImage
                ? "opacity-0 scale-105"
                : "opacity-100 scale-100 group-hover:scale-105"
            }`}
            loading="lazy"
          />

          {/* Secondary Lifestyle / Angle Photo on Hover */}
          {secondaryImage && secondaryImage !== primaryImage && (
            <img
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              className={`w-full h-full object-cover p-0 absolute inset-0 transition-all duration-500 ease-out ${
                isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
              }`}
              loading="lazy"
            />
          )}

          {/* Quick View Button on Hover */}
          <div
            className={`absolute bottom-3 inset-x-3 hidden sm:flex items-center justify-center transition-all duration-300 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            }`}
          >
            <span className="w-full py-2 rounded-xl bg-white/95 backdrop-blur-md text-neutral-900 border border-neutral-200 text-xs font-semibold text-center shadow-md hover:bg-neutral-900 hover:text-white transition">
              Quick View
            </span>
          </div>
        </Link>

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-600 text-[10px] font-bold tracking-wide shadow-xs">
            {product.discount}% OFF
          </div>
        )}

        {/* 3D Digital Twin Ready Indicator */}
        {(product.model3D || product.model3D?.url) && (
          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-neutral-900/85 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs">
            <CubeIcon className="w-3 h-3 text-amber-300" />
            <span>3D Ready</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full backdrop-blur-sm transition flex items-center justify-center shadow-xs cursor-pointer ${
            isWishlisted
              ? "bg-rose-50 text-rose-500 border border-rose-200"
              : "bg-white/90 text-neutral-400 hover:text-rose-500 hover:border-rose-200 border border-neutral-200"
          }`}
        >
          <HeartIcon className={`w-3.5 h-3.5 ${isWishlisted ? "fill-rose-500" : ""}`} />
        </button>
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-1">
        {/* Department Tag & Rating Row */}
        <div className="flex items-center justify-between gap-2 text-xs text-neutral-400 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate max-w-[120px]">
            {categoryName || product.brand || "Aethera"}
          </span>

          {/* Rating */}
          <div className="flex items-center gap-1 text-neutral-700 font-bold text-xs shrink-0">
            <StarIcon className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating ? product.rating.toFixed(1) : "4.8"}</span>
            <span className="text-neutral-400 text-[10px] font-normal">
              ({product.reviewCount || 12})
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif font-medium text-neutral-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-neutral-600 transition mb-2">
          <Link to={productUrl}>{product.name}</Link>
        </h3>

        {/* Color Swatch Dots */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2.5">
            {product.colors.slice(0, 4).map((col, idx) => {
              const hex = COLOR_SWATCH_MAP[col] || COLOR_SWATCH_MAP["Default"];
              return (
                <span
                  key={idx}
                  title={col}
                  className="w-2.5 h-2.5 rounded-full border border-neutral-300 shadow-xs"
                  style={{ backgroundColor: hex }}
                />
              );
            })}
            {product.colors.length > 4 && (
              <span className="text-[9px] font-medium text-neutral-400">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Stock / Shipping Badge */}
        <div className="text-[10px] text-neutral-400 mb-3 flex items-center gap-1.5">
          {typeof product.stock === "number" && product.stock <= 8 ? (
            <span className="text-amber-700 font-medium">
              • Only {product.stock} left in stock
            </span>
          ) : (
            <span className="text-emerald-700 font-medium">
              • In Stock • Ships in 24h
            </span>
          )}
        </div>

        {/* Price & Action Footer */}
        <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-neutral-900">
                {formatCurrency(finalPrice)}
              </span>
              {hasDiscount && (
                <span className="text-[11px] text-neutral-400 line-through">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>
            {hasDiscount && savings > 0 && (
              <span className="text-[9px] font-semibold text-emerald-700">
                Save {formatCurrency(savings)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition shadow-xs cursor-pointer ${
              added
                ? "bg-emerald-600 text-white border-emerald-600"
                : "border-neutral-200 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white text-neutral-800 bg-white"
            }`}
          >
            <span>{added ? "✓ Added" : "+ Cart"}</span>
          </button>
        </div>
      </div>
    </motion.div>
    </div>
  );
}

