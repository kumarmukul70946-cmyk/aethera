import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth.js";
import { trackingService } from "../services/trackingService.js";

import { addItemToCart } from "../features/cart/cartSlice.js";
import {
  addToWishlist,
  removeFromWishlist,
  selectWishlistItems
} from "../features/wishlist/wishlistSlice.js";
import {
  fetchProductBySlug,
  fetchProductById,
  clearSelectedProduct
} from "../features/products/productSlice.js";
import {
  selectSelectedProduct,
  selectProductDetailLoading,
  selectProductDetailError
} from "../features/products/productSelectors.js";
import ProductGallery from "../components/product/ProductGallery.jsx";
import ProductDetailsSkeleton from "../components/common/ProductDetailsSkeleton.jsx";
import ReviewSection from "../components/review/ReviewSection.jsx";
import AIReviewSummary from "../components/reviews/AIReviewSummary.jsx";
import RecommendedProducts from "../components/product/RecommendedProducts.jsx";
import SimilarProducts from "../components/product/SimilarProducts.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import {
  StarIcon,
  HeartIcon,
  CartIcon,
  ShieldCheckIcon,
  TruckIcon,
  RotateCcwIcon,
  CheckIcon,
  CubeIcon
} from "../components/common/Icons.jsx";
import { formatCurrency, calculateSavings } from "../utils/formatters.js";
import CustomizationPanel from "../components/customization/CustomizationPanel.jsx";
import { createDefaultCustomizationState } from "../three/customization/customizationTypes.js";

// Lazy load 3D viewer so users browsing standard catalog never download Three.js assets unnecessarily
const Product3DViewer = lazy(() => import("../three/components/Product3DViewer.jsx"));

export default function ProductDetails() {
  const { slug, id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const product = useSelector(selectSelectedProduct);
  const loading = useSelector(selectProductDetailLoading);
  const error = useSelector(selectProductDetailError);
  const wishlistItems = useSelector(selectWishlistItems);

  // Local state for user interactive choices
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [errorToast, setErrorToast] = useState(null);
  const [activeMediaTab, setActiveMediaTab] = useState("images");
  const [customizationState, setCustomizationState] = useState({});
  const lastTrackedProductId = useRef(null);

  const isWishlisted = Boolean(
    product &&
      wishlistItems.some(
        (item) => (item.product?._id || item.product || item._id) === product._id
      )
  );

  useEffect(() => {
    lastTrackedProductId.current = null;
    if (slug) {
      dispatch(fetchProductBySlug(slug));
    } else if (id) {
      dispatch(fetchProductById(id));
    }

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, slug, id]);

  // Set default color, size, 3D customization, and record VIEW event when product loads
  useEffect(() => {
    if (product && product._id) {
      // Meaningful VIEW tracking (deduplicated against component re-renders)
      if (lastTrackedProductId.current !== product._id) {
        lastTrackedProductId.current = product._id;
        trackingService.trackView(product._id, {
          source: "product_details_page",
          category: product.categorySlug || undefined,
          brand: product.brand || undefined,
          price: product.finalPrice || product.price
        });
      }

      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      setQuantity(1);
      setActiveMediaTab("images");

      // Initialize 3D customization defaults if product supports it
      if (product.customization?.enabled) {
        setCustomizationState(createDefaultCustomizationState(product.customization));
      } else {
        setCustomizationState({});
      }
    }
  }, [product]);

  const handleCustomizationChange = (areaId, option) => {
    setCustomizationState((prev) => ({
      ...prev,
      [areaId]: option
    }));
  };

  const handleResetCustomization = () => {
    if (product?.customization?.enabled) {
      setCustomizationState(createDefaultCustomizationState(product.customization));
    }
  };

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState
          title="Product Not Found"
          message={error || "The requested product does not exist or has been discontinued."}
          onRetry={() => {
            if (slug) dispatch(fetchProductBySlug(slug));
            else if (id) dispatch(fetchProductById(id));
          }}
        />
        <div className="text-center mt-6">
          <Link
            to="/products"
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 underline"
          >
            ← Back to Product Catalog
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discount && product.discount > 0;
  const originalPrice = product.price;
  const finalPrice = product.finalPrice || (hasDiscount ? Math.round(originalPrice * (1 - product.discount / 100)) : originalPrice);
  const savings = calculateSavings(originalPrice, product.discount);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }
    try {
      setIsAddingToCart(true);
      setErrorToast(null);
      const resultAction = await dispatch(
        addItemToCart({
          productId: product._id,
          quantity,
          customization: {
            color: selectedColor || undefined,
            size: selectedSize || undefined,
            custom3D:
              product.customization?.enabled && Object.keys(customizationState || {}).length > 0
                ? customizationState
                : undefined
          },
        })
      );
      if (addItemToCart.fulfilled.match(resultAction)) {
        setAddedToast(true);
        setTimeout(() => {
          setAddedToast(false);
        }, 3000);
      } else {
        setErrorToast(resultAction.payload?.message || "Could not add item to cart");
        setTimeout(() => setErrorToast(null), 4000);
      }
    } catch (err) {
      setErrorToast("An unexpected error occurred");
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
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

  const modelUrl = typeof product.model3D === "string" ? product.model3D : product.model3D?.url;
  const has3DModel = Boolean(modelUrl);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Toast Notifications */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckIcon className="w-5 h-5 text-white" />
          <div>
            <div className="text-xs font-semibold">Added to shopping cart!</div>
            <Link to="/cart" className="text-[11px] underline opacity-90 hover:opacity-100">
              View Cart & Checkout →
            </Link>
          </div>
        </div>
      )}
      {errorToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-xs font-semibold">{errorToast}</div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-400 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-slate-200 transition">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-slate-200 transition">
          Products
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              to={`/products?category=${product.category.slug || product.category}`}
              className="hover:text-slate-200 transition capitalize"
            >
              {product.category.name || product.category}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-200 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left Column: Media Stage (Image Gallery or 3D Viewer) */}
        <div className="flex flex-col space-y-4">
          {/* Media Switcher Tabs (Rendered only if product has a 3D model) */}
          {has3DModel && (
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 w-fit backdrop-blur-md shadow-lg">
              <button
                type="button"
                onClick={() => setActiveMediaTab("images")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeMediaTab === "images"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>Product Photos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMediaTab("3d")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeMediaTab === "3d"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <CubeIcon className="w-4 h-4 text-indigo-300" />
                <span>3D Interactive View</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/20 text-white">
                  3D
                </span>
              </button>
            </div>
          )}

          {activeMediaTab === "3d" && has3DModel ? (
            <div className="flex flex-col space-y-4">
              <Suspense
                fallback={
                  <div className="w-full aspect-square rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center p-8 text-center shadow-xl">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-3" />
                    <span className="text-xs font-medium text-slate-400">Loading 3D Canvas...</span>
                  </div>
                }
              >
                <Product3DViewer
                  modelUrl={modelUrl}
                  productName={product.name}
                  customizationState={customizationState}
                  customizationConfig={product.customization}
                  onBackToImages={() => setActiveMediaTab("images")}
                />
              </Suspense>

              {/* Live 3D Customizer Panel */}
              {product.customization?.enabled && (
                <CustomizationPanel
                  configuration={product.customization}
                  customizationState={customizationState}
                  onChange={handleCustomizationChange}
                  onReset={handleResetCustomization}
                />
              )}
            </div>
          ) : (
            <ProductGallery
              images={product.images || []}
              productName={product.name}
              has3DModel={has3DModel}
              onOpen3D={() => setActiveMediaTab("3d")}
            />
          )}
        </div>

        {/* Right Column: Product Information & Purchase Controls */}
        <div className="flex flex-col space-y-6">
          {/* Brand & Title */}
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                {product.brand || "Aethera Collection"}
              </span>

              {/* Stock Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isOutOfStock
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : `In Stock (${product.stock} left)`}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Rating Summary */}
            <a
              href="#reviews-section"
              className="flex items-center gap-3 mt-3 group cursor-pointer"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className="w-4 h-4"
                    filled={i < Math.round(product.rating || 0)}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-300">
                {product.rating ? product.rating.toFixed(1) : "0.0"}
              </span>
              <span className="text-xs text-slate-500 group-hover:text-indigo-400 transition">
                ({product.reviewCount || 0} customer reviews)
              </span>
            </a>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {formatCurrency(finalPrice)}
              </span>
              {hasDiscount && (
                <span className="text-base text-slate-500 line-through">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>

            {hasDiscount && (
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold">
                  Save {formatCurrency(savings)} ({product.discount}% off)
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Overview
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Color Options */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Color: <span className="text-indigo-400 capitalize">{selectedColor}</span>
              </h3>
              <div className="flex items-center gap-2.5">
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/50"
                          : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Options */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Size / Variant: <span className="text-indigo-400">{selectedSize}</span>
              </h3>
              <div className="flex items-center gap-2.5">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-10 px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase transition ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/50"
                          : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 transition"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-semibold text-slate-200">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 transition"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
                className="flex-1 py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-semibold text-sm transition shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2"
              >
                {isAddingToCart ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <CartIcon className="w-4 h-4" />
                )}
                <span>
                  {isOutOfStock ? "Out of Stock" : isAddingToCart ? "Adding..." : "Add to Shopping Cart"}
                </span>
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`p-3 rounded-2xl border transition ${
                  isWishlisted
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
                aria-label="Toggle wishlist"
              >
                <HeartIcon className="w-5 h-5" filled={isWishlisted} />
              </button>
            </div>
          </div>

          {/* Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Technical Specifications
              </h3>
              <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden text-xs">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="flex py-2.5 px-4 justify-between">
                    <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    <span className="font-semibold text-slate-200">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guarantees Box */}
          <div className="pt-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <TruckIcon className="w-4 h-4 text-indigo-400" />
              <span>Complimentary Express Shipping</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <RotateCcwIcon className="w-4 h-4 text-cyan-400" />
              <span>30-Day Hassle-Free Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Part 17: AI-Powered Review Intelligence Summary */}
      <AIReviewSummary productId={product._id} />

      {/* Customer Review & Rating Section */}
      <ReviewSection productId={product._id} />

      {/* Part 14: AI Semantic Similar Products */}
      <div className="pt-10 border-t border-slate-800/80">
        <SimilarProducts
          productId={product._id}
          title="Similar Products You May Like"
          subtitle="Semantically matched through high-dimensional feature embeddings"
          limit={4}
        />
      </div>

      {/* Contextual & Personalized Behavioral Recommendations (Part 13) */}
      <div className="pt-6">
        <RecommendedProducts
          contextProductId={product._id}
          title="Recommended For You"
          subtitle="Selected based on this product and your shopping preferences"
          limit={4}
        />
      </div>
    </div>
  );
}
