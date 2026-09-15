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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading your wishlist...</p>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center p-12 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <HeartIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Your wishlist is empty</h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Save items you love here and easily move them to your cart when ready to purchase.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition shadow-lg shadow-indigo-600/25"
            >
              Discover Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title */}
      <div className="pb-6 border-b border-slate-800 mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Saved Wishlist
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {items.length} {items.length === 1 ? "item" : "items"} saved for later
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
              className="group bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between transition shadow-sm hover:shadow-xl"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-square bg-slate-950 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
                  {primaryImage ? (
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <span className="text-3xl">✨</span>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(product._id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 text-slate-400 hover:text-rose-400 backdrop-blur-md transition"
                    aria-label="Remove from wishlist"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-indigo-400 uppercase text-[10px]">
                      {product.brand || "Aethera"}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400">
                      <StarIcon className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{product.rating ? product.rating.toFixed(1) : "4.5"}</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-100 line-clamp-1 hover:text-indigo-300">
                    <Link to={productUrl}>{product.name}</Link>
                  </h3>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="font-bold text-base text-white">
                      {formatCurrency(finalPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-slate-500 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleMoveToCart(product._id)}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <CartIcon className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>

                <Link
                  to={productUrl}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
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
