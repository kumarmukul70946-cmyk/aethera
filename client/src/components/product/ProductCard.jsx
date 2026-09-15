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
import { StarIcon, HeartIcon, EyeIcon } from "../common/Icons.jsx";
import { formatCurrency } from "../../utils/formatters.js";

/**
 * Reusable Product Card Component.
 * @param {Object} props
 * @param {Object} props.product - The product entity from backend API
 */
export default function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const wishlistItems = useSelector(selectWishlistItems);

  if (!product) return null;

  const isWishlisted = Boolean(
    wishlistItems.some(
      (item) => (item.product?._id || item.product || item._id) === product._id
    )
  );

  // Determine target route (slug preferred for SEO and readability)
  const productUrl = product.slug ? `/product/${product.slug}` : `/products/${product._id}`;

  // Image source resolution
  const primaryImage =
    !imageError && product.images && product.images.length > 0
      ? product.images[0].url || product.images[0]
      : null;

  const hasDiscount = product.discount && product.discount > 0;
  const originalPrice = product.price;
  const finalPrice = product.finalPrice || (hasDiscount ? Math.round(originalPrice * (1 - product.discount / 100)) : originalPrice);

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

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 flex flex-col transition shadow-sm hover:shadow-xl hover:shadow-indigo-500/5"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-slate-950 rounded-xl overflow-hidden mb-4 flex items-center justify-center border border-slate-800/50">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-600 p-4 text-center">
            <span className="text-3xl mb-1">✨</span>
            <span className="text-xs font-medium text-slate-500">{product.brand || "Aethera"}</span>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-rose-500/90 text-white text-[11px] font-bold tracking-wide shadow-md">
            -{product.discount}%
          </div>
        )}

        {/* 3D Ready Indicator */}
        {product.model3D?.url && (
          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-indigo-600/80 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1">
            <span>3D</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition ${
            isWishlisted
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              : "bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-800/90 border border-slate-700/40"
          }`}
        >
          <HeartIcon className="w-4 h-4" filled={isWishlisted} />
        </button>
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-1">
        {/* Brand & Category */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-1.5">
          <span className="font-semibold text-indigo-400 uppercase tracking-wider text-[11px]">
            {product.brand || "Premium"}
          </span>

          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-400 font-medium text-xs">
            <StarIcon className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating ? product.rating.toFixed(1) : "4.5"}</span>
            <span className="text-slate-500 text-[10px]">
              ({product.reviewCount || 0})
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-100 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-indigo-300 transition mb-3">
          <Link to={productUrl} className="focus:outline-none">
            {product.name}
          </Link>
        </h3>

        {/* Price & Action Footer */}
        <div className="mt-auto pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-white tracking-tight">
              {formatCurrency(finalPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-500 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>

          <Link
            to={productUrl}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-medium transition shadow-sm"
          >
            <EyeIcon className="w-3.5 h-3.5" />
            <span>View</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
