import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWishlist,
  removeFromWishlist,
  moveWishlistItemToCart,
  selectWishlistItems,
  selectWishlistLoading,
  selectWishlistError
} from "../features/wishlist/wishlistSlice.js";
import { formatCurrency } from "../utils/formatters.js";
import { HeartIcon, CartIcon, CloseIcon, EyeIcon, StarIcon } from "../components/common/Icons.jsx";
import ErrorState from "../components/common/ErrorState.jsx";

export default function Wishlist() {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);
  const loading = useSelector(selectWishlistLoading);
  const error = useSelector(selectWishlistError);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleMoveToCart = (productId) => {
    dispatch(moveWishlistItemToCart({ productId }));
  };

  if (loading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-neutral-500">Loading your wishlist...</p>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState
          title="Could not load wishlist"
          message={error}
          onRetry={() => dispatch(fetchWishlist())}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center p-12 sm:p-16 bg-white border border-neutral-200/80 rounded-3xl shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto">
            <HeartIcon className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-serif font-normal text-neutral-900">Your wishlist is empty</h2>
          <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
            Curate pieces you adore and revisit them here anytime, or transfer directly into your shopping bag.
          </p>
          <div className="pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm"
            >
              Discover Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Title */}
      <div className="pb-6 border-b border-neutral-200/80 mb-8">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Curated Favorites</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal text-neutral-900 tracking-tight mt-1">
          Saved Wishlist
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {items.length} {items.length === 1 ? "piece" : "pieces"} saved for consideration
        </p>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => {
          const productUrl = product.slug
            ? `/product/${product.slug}`
            : `/products/${product._id}`;

          const primaryImage =
            product.images && product.images.length > 0
              ? typeof product.images[0] === "string"
                ? product.images[0]
                : product.images[0]?.url
              : null;

          const hasDiscount = product.discount && product.discount > 0;
          const finalPrice = product.finalPrice || product.price;

          return (
            <div
              key={product._id}
              className="group bg-white hover:border-neutral-300 border border-neutral-200/80 rounded-3xl p-4 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-square bg-[#FAF9F6] rounded-2xl overflow-hidden mb-3 flex items-center justify-center">
                  {primaryImage ? (
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <span className="text-3xl">✨</span>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(product._id)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-neutral-400 hover:text-rose-600 shadow-sm transition"
                    aria-label="Remove from wishlist"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="space-y-1 mb-4 px-1">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="font-semibold uppercase text-[10px] tracking-wider text-neutral-400">
                      {product.brand || "Aethera"}
                    </span>
                    <div className="flex items-center gap-1 text-neutral-700 font-medium text-xs">
                      <StarIcon className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{product.rating ? product.rating.toFixed(1) : "4.8"}</span>
                    </div>
                  </div>

                  <h3 className="font-medium text-sm text-neutral-900 line-clamp-1 hover:text-neutral-600 transition">
                    <Link to={productUrl}>{product.name}</Link>
                  </h3>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="font-serif font-medium text-base text-neutral-900">
                      {formatCurrency(finalPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-neutral-400 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-neutral-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleMoveToCart(product._id)}
                  className="flex-1 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <CartIcon className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>

                <Link
                  to={productUrl}
                  className="p-2.5 rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-700 transition flex items-center justify-center"
                  aria-label="View product"
                >
                  <EyeIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
