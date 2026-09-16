import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../features/products/productSlice.js";
import { selectCategories } from "../features/products/productSelectors.js";
import { productService } from "../services/productService.js";
import ProductCard from "../components/product/ProductCard.jsx";
import Pagination from "../components/common/Pagination.jsx";
import { SparklesIcon, TagIcon, ArrowRightIcon } from "../components/common/Icons.jsx";

const DISCOUNT_TIERS = [
  { label: "All Offers", value: "" },
  { label: "10%+ Off", value: "10" },
  { label: "15%+ Off", value: "15" },
  { label: "20%+ Off", value: "20" },
  { label: "25%+ Off", value: "25" }
];

const DEAL_SORT_OPTIONS = [
  { value: "discount_desc", label: "Highest Discount" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Customer Rating" },
  { value: "newest", label: "Recently Added" }
];

export default function Deals() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const categories = useSelector(selectCategories);

  // Filter params
  const category = searchParams.get("category") || "";
  const minDiscount = searchParams.get("minDiscount") || "";
  const sort = searchParams.get("sort") || "discount_desc";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Local state for products and pagination
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Load categories if not present
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  // Fetch discounted products
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    const queryParams = {
      discount: true,
      page,
      limit: 12,
      sort
    };

    if (category) queryParams.category = category;
    if (minDiscount) queryParams.minDiscount = minDiscount;

    productService
      .getProducts(queryParams)
      .then((data) => {
        if (!isCancelled) {
          setProducts(data.products || []);
          if (data.pagination) {
            setPagination(data.pagination);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || "Failed to load deals. Please try again.");
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [category, minDiscount, sort, page]);

  const handleFilterUpdate = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== "" && value !== null && value !== undefined) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    if (key !== "page") {
      newParams.set("page", "1");
    }

    setSearchParams(newParams);
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-neutral-900 pb-20">
      {/* Promotional Top Ribbon */}
      <div className="bg-neutral-900 text-neutral-100 text-xs py-2.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold uppercase text-[11px] tracking-wider">
          <SparklesIcon className="w-3.5 h-3.5" /> Limited Time Promotion
        </span>
        <span className="hidden sm:inline text-neutral-400">|</span>
        <span>
          Save up to <strong>25%</strong> on studio monitors, mechanical keyboards, & seasonal apparel.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        {/* Editorial Deals Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-stone-900 via-neutral-900 to-zinc-900 text-white p-8 sm:p-12 shadow-xl mb-12">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-neutral-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-amber-200 font-medium mb-4">
              <TagIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>Aethera Member Privilege</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight font-medium text-white mb-4 leading-tight">
              Exclusive Offers & Seasonal Deals
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed mb-8 max-w-2xl">
              Authentic price reductions across premium sound, spatial accessories, streetwear, and 3D architectural pieces. All items backed by full warranty and verified authenticity.
            </p>

            {/* Voucher Coupon Box */}
            <div className="inline-flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md">
              <div className="px-3">
                <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                  Universal Promo Code
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-base sm:text-lg font-bold tracking-widest text-amber-300">
                    AETHERA10
                  </span>
                  <span className="text-xs text-neutral-300">
                    — Extra 10% off at checkout
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyCoupon("AETHERA10")}
                className="px-5 py-2.5 rounded-xl bg-white text-neutral-900 text-xs font-semibold hover:bg-neutral-100 transition shadow-sm self-start sm:self-auto cursor-pointer"
              >
                {copiedCoupon ? "Copied to Clipboard!" : "Copy Voucher"}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-neutral-200/80 shadow-xs mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Discount Tiers Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mr-1">
                Discount:
              </span>
              {DISCOUNT_TIERS.map((tier) => {
                const isActive = minDiscount === tier.value;
                return (
                  <button
                    key={tier.label}
                    type="button"
                    onClick={() => handleFilterUpdate("minDiscount", tier.value)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? "bg-neutral-900 text-white shadow-xs"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/70 border border-neutral-200/60"
                    }`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>

            {/* Department Filter & Sort Selectors */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-500">Department:</span>
                <select
                  value={category}
                  onChange={(e) => handleFilterUpdate("category", e.target.value)}
                  className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
                >
                  <option value="">All Departments</option>
                  {categories.map((cat) => (
                    <option key={cat._id || cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-500">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => handleFilterUpdate("sort", e.target.value)}
                  className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
                >
                  {DEAL_SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info & Quick Counter */}
        <div className="flex items-center justify-between mb-6 px-1">
          <p className="text-xs text-neutral-500 font-medium">
            Showing <strong className="text-neutral-900 font-semibold">{products.length}</strong> active offers
            {category && (
              <span> in <span className="capitalize text-neutral-900 font-semibold">{category}</span></span>
            )}
            {minDiscount && (
              <span> with <span className="text-neutral-900 font-semibold">{minDiscount}%+ off</span></span>
            )}
          </p>

          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 transition underline underline-offset-4"
          >
            Explore Full Catalog <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>

        {/* Product Deals Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 border border-neutral-200/60 animate-pulse flex flex-col gap-3"
              >
                <div className="w-full aspect-square bg-neutral-100 rounded-xl" />
                <div className="h-4 bg-neutral-100 rounded-md w-3/4" />
                <div className="h-3 bg-neutral-100 rounded-md w-1/2" />
                <div className="h-5 bg-neutral-100 rounded-md w-1/3 mt-2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto my-12">
            <p className="text-sm text-rose-800 font-medium mb-3">{error}</p>
            <button
              type="button"
              onClick={() => handleFilterUpdate("minDiscount", "")}
              className="px-4 py-2 bg-neutral-900 text-white rounded-full text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-12 sm:p-16 text-center max-w-xl mx-auto my-12 shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 mb-4">
              <TagIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-medium text-neutral-900 mb-2">
              No Offers Found in this Selection
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 font-light mb-6">
              No products match {minDiscount}%+ discount in the selected department. Try relaxing your discount threshold or browse our full catalog.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleFilterUpdate("minDiscount", "");
                  handleFilterUpdate("category", "");
                }}
                className="px-5 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition"
              >
                Clear Deal Filters
              </button>
              <Link
                to="/products"
                className="px-5 py-2.5 bg-neutral-100 text-neutral-800 rounded-full text-xs font-semibold hover:bg-neutral-200/80 transition"
              >
                View Full Catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => {
                handleFilterUpdate("page", p.toString());
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
