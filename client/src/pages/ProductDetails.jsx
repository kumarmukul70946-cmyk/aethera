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
  TruckIcon,
  RotateCcwIcon,
  CheckIcon,
  CubeIcon
} from "../components/common/Icons.jsx";
import { formatCurrency, calculateSavings } from "../utils/formatters.js";
import CustomizationPanel from "../components/customization/CustomizationPanel.jsx";
import { createDefaultCustomizationState } from "../three/customization/customizationTypes.js";

// Lazy load 3D viewer
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

  useEffect(() => {
    if (product && product._id) {
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
      <div className="max-w-4xl mx-auto px-4 py-16 text-neutral-900">
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
            className="text-xs font-semibold text-neutral-900 hover:text-neutral-600 underline"
          >
            ← Back to Product Catalog
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discount && product.discount > 0;
  const originalPrice = product.price;
  const finalPrice =
    product.finalPrice ||
    (hasDiscount ? Math.round(originalPrice * (1 - product.discount / 100)) : originalPrice);
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
          }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen text-neutral-900">
      {/* Toast Notifications */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-950 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckIcon className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs font-semibold">Added to shopping cart!</div>
            <Link to="/cart" className="text-[11px] underline opacity-90 hover:opacity-100 text-neutral-300">
              View Cart & Checkout →
            </Link>
          </div>
        </div>
      )}
      {errorToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-xs font-semibold">{errorToast}</div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-neutral-400 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-neutral-900 transition">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-neutral-900 transition">
          Products
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              to={`/products?category=${product.category.slug || product.category}`}
              className="hover:text-neutral-900 transition capitalize"
            >
              {product.category.name || product.category}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-neutral-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Left Column: Media Stage */}
        <div className="flex flex-col space-y-4">
          {/* Media Switcher Tabs */}
          {has3DModel && (
            <div className="flex items-center gap-2 p-1 rounded-full bg-neutral-100 border border-neutral-200 w-fit shadow-xs">
              <button
                type="button"
                onClick={() => setActiveMediaTab("images")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                  activeMediaTab === "images"
                    ? "bg-white text-neutral-900 shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <span>Product Photos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMediaTab("3d")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                  activeMediaTab === "3d"
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <CubeIcon className="w-3.5 h-3.5" />
                <span>3D Interactive</span>
              </button>
            </div>
          )}

          {activeMediaTab === "3d" && has3DModel ? (
            <div className="flex flex-col space-y-4">
              <Suspense
                fallback={
                  <div className="w-full aspect-square rounded-3xl bg-neutral-100 border border-neutral-200 flex flex-col items-center justify-center p-8 text-center shadow-xs">
                    <div className="w-8 h-8 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin mb-3" />
                    <span className="text-xs font-medium text-neutral-500">Loading 3D Canvas...</span>
                  </div>
                }
              >
                <div className="w-full aspect-square rounded-3xl bg-gradient-to-b from-[#F7F5F0] via-[#F0ECE4] to-[#E7E2D8] border border-neutral-200 shadow-sm overflow-hidden relative">
                  <Product3DViewer
                    modelUrl={modelUrl}
                    productName={product.name}
                    customizationState={customizationState}
                    customizationConfig={product.customization}
                    onBackToImages={() => setActiveMediaTab("images")}
                  />
                </div>
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

        {/* Right Column: Information & Actions */}
        <div className="flex flex-col space-y-6">
          {/* Brand & Title */}
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                {product.brand || "Aethera Collection"}
              </span>

              {/* Stock Status */}
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                  isOutOfStock
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : `In Stock (${product.stock} available)`}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Rating Summary */}
            <a
              href="#reviews-section"
              className="flex items-center gap-2 mt-2.5 group cursor-pointer"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className="w-3.5 h-3.5"
                    filled={i < Math.round(product.rating || 0)}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-neutral-900">
                {product.rating ? product.rating.toFixed(1) : "4.8"}
              </span>
              <span className="text-xs text-neutral-400 group-hover:text-neutral-700 transition">
                ({product.reviewCount || 0} reviews)
              </span>
            </a>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                {formatCurrency(finalPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-neutral-400 line-through">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>

            {hasDiscount && (
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold">
                  Save {formatCurrency(savings)} ({product.discount}% OFF)
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Overview
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Color Options */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-neutral-700 mb-2.5">
                Color: <span className="font-bold text-neutral-900 capitalize">{selectedColor}</span>
              </h3>
              <div className="flex items-center gap-2">
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition shadow-xs ${
                        isSelected
                          ? "bg-neutral-900 text-white"
                          : "bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-400"
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
              <h3 className="text-xs font-semibold text-neutral-700 mb-2.5">
                Size / Variant: <span className="font-bold text-neutral-900">{selectedSize}</span>
              </h3>
              <div className="flex items-center gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-10 px-4 py-1.5 rounded-full text-xs font-semibold uppercase transition shadow-xs ${
                        isSelected
                          ? "bg-neutral-900 text-white"
                          : "bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-400"
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
          <div className="pt-4 border-t border-neutral-100 space-y-4">
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center rounded-full bg-neutral-100 border border-neutral-200 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-8 h-8 rounded-full bg-white text-neutral-700 hover:bg-neutral-200 disabled:opacity-30 transition flex items-center justify-center text-xs font-bold shadow-xs"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-9 text-center text-xs font-bold text-neutral-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="w-8 h-8 rounded-full bg-white text-neutral-700 hover:bg-neutral-200 disabled:opacity-30 transition flex items-center justify-center text-xs font-bold shadow-xs"
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
                className="flex-1 py-3 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:cursor-not-allowed text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2"
              >
                {isAddingToCart ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <CartIcon className="w-4 h-4" />
                )}
                <span>
                  {isOutOfStock ? "Out of Stock" : isAddingToCart ? "Adding..." : "Add to Cart"}
                </span>
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition shadow-xs ${
                  isWishlisted
                    ? "bg-rose-50 text-rose-500 border-rose-200"
                    : "bg-white border-neutral-200 text-neutral-500 hover:text-rose-500 hover:border-rose-200"
                }`}
                aria-label="Toggle wishlist"
              >
                <HeartIcon className={`w-4 h-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
              </button>
            </div>
          </div>

          {/* Guarantees Strip */}
          <div className="pt-2 grid grid-cols-2 gap-3 text-xs text-neutral-600">
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
              <TruckIcon className="w-4 h-4 text-neutral-800" />
              <span>Complimentary Shipping</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
              <RotateCcwIcon className="w-4 h-4 text-neutral-800" />
              <span>30-Day Easy Returns</span>
            </div>
          </div>

          {/* Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="pt-4 border-t border-neutral-100">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
                Technical Specifications
              </h3>
              <div className="rounded-2xl bg-white border border-neutral-200/80 divide-y divide-neutral-100 overflow-hidden text-xs shadow-xs">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="flex py-2.5 px-4 justify-between">
                    <span className="text-neutral-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    <span className="font-semibold text-neutral-900">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Part 17: AI-Powered Review Intelligence Summary */}
      <div className="mt-16">
        <AIReviewSummary productId={product._id} />
      </div>

      {/* Customer Review & Rating Section */}
      <div id="reviews-section" className="mt-12">
        <ReviewSection productId={product._id} />
      </div>

      {/* Part 14: AI Semantic Similar Products */}
      <div className="mt-16 pt-10 border-t border-neutral-200">
        <SimilarProducts
          productId={product._id}
          title="Similar Products You May Like"
          subtitle="Semantically matched through high-dimensional feature embeddings"
          limit={4}
        />
      </div>

      {/* Contextual & Personalized Behavioral Recommendations (Part 13) */}
      <div className="mt-12">
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
