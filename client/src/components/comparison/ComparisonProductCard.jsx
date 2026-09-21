import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeFromCompare } from "../../features/comparison/comparisonSlice.js";
import { addItemToCart } from "../../features/cart/cartSlice.js";
import { StarIcon, CloseIcon, CubeIcon, CartIcon } from "../common/Icons.jsx";
import { formatCurrency } from "../../utils/formatters.js";
import { getProductImages } from "../../utils/productImages.js";

/**
 * Top card in the multi-product comparison table view.
 * Features luxury Japandi styling, price formatting, stock status, remove action, and add-to-cart.
 */
export default function ComparisonProductCard({ product, onRemove, canRemove = true }) {
  const dispatch = useDispatch();

  if (!product) return null;

  const pid = (product._id || product.id).toString();
  const productUrl = product.slug ? `/product/${product.slug}` : `/products/${pid}`;

  const { primary: resolvedPrimary } = getProductImages(product);
  const primaryImage =
    product.images && product.images.length > 0 && typeof product.images[0] === "string" && !product.images[0].startsWith("/images/products/")
      ? product.images[0]
      : product.image || resolvedPrimary;

  const hasDiscount = product.discount && product.discount > 0;
  const originalPrice = product.price;
  const finalPrice = product.finalPrice || originalPrice;

  const handleRemove = () => {
    if (onRemove) {
      onRemove(pid);
    } else {
      dispatch(removeFromCompare(pid));
    }
  };

  const handleAddToCart = () => {
    dispatch(addItemToCart({ productId: pid, quantity: 1 }));
  };

  return (
    <div className="relative bg-white border border-neutral-200/90 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition duration-200">
      {/* Remove Button */}
      {canRemove && (
        <button
          type="button"
          onClick={handleRemove}
          title="Remove from comparison"
          aria-label="Remove from comparison"
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 border border-neutral-200 hover:border-rose-200 transition flex items-center justify-center cursor-pointer shadow-xs"
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Image Thumbnail */}
      <div className="relative w-full aspect-square bg-neutral-50 rounded-xl overflow-hidden mb-3 border border-neutral-100 flex items-center justify-center group">
        <Link to={productUrl} className="w-full h-full flex items-center justify-center">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
        </Link>

        {/* 3D Ready Indicator */}
        {product.model3D && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-neutral-900/85 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs">
            <CubeIcon className="w-3 h-3 text-amber-300" />
            <span>3D Ready</span>
          </div>
        )}

        {hasDiscount && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold">
            {product.discount}% OFF
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
          {product.brand || "Aethera"}
        </span>

        <h4 className="font-serif font-medium text-neutral-900 text-sm leading-snug line-clamp-2 hover:text-neutral-600 transition mb-2">
          <Link to={productUrl}>{product.name}</Link>
        </h4>

        {/* Rating */}
        <div className="flex items-center gap-1 text-neutral-700 font-bold text-xs mb-2">
          <StarIcon className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{product.rating ? Number(product.rating).toFixed(1) : "0.0"}</span>
          <span className="text-neutral-400 text-[10px] font-normal">
            ({product.reviewCount || 0} reviews)
          </span>
        </div>

        {/* Price Row */}
        <div className="mt-auto pt-2 border-t border-neutral-100 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-base font-bold text-neutral-900">
            {formatCurrency(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through">
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>

        {/* Stock status indicator */}
        <div className="mt-1.5 text-[11px]">
          {product.stock > 0 ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              In Stock ({product.stock} left)
            </span>
          ) : (
            <span className="text-rose-600 font-medium">Out of Stock</span>
          )}
        </div>

        {/* Add to cart button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="mt-3 w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer disabled:cursor-not-allowed"
        >
          <CartIcon className="w-3.5 h-3.5" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
