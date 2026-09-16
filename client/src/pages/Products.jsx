import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, fetchCategories } from "../features/products/productSlice.js";
import {
  selectProducts,
  selectPagination,
  selectCategories,
  selectAvailableBrands,
  selectPriceRange,
  selectProductsLoading,
  selectProductsError
} from "../features/products/productSelectors.js";
import ProductGrid from "../components/product/ProductGrid.jsx";
import ProductFilters from "../components/product/ProductFilters.jsx";
import ProductSort from "../components/product/ProductSort.jsx";
import Pagination from "../components/common/Pagination.jsx";
import {
  FilterIcon,
  CloseIcon,
  SparklesIcon,
  CubeIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  TruckIcon
} from "../components/common/Icons.jsx";

// Curated Visual Department Thumbnails
const VISUAL_DEPARTMENTS = [
  {
    slug: "",
    name: "All Pieces",
    image: "/images/hero_headphones.jpg",
    tagline: "Complete Catalog"
  },
  {
    slug: "audio",
    name: "Audio",
    image: "/images/hero_headphones.jpg",
    tagline: "Acoustic Systems"
  },
  {
    slug: "electronics",
    name: "Computing",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80",
    tagline: "Displays & Hardware"
  },
  {
    slug: "mobile",
    name: "Mobile",
    image: "/images/promo_iphone.jpg",
    tagline: "Smart Devices"
  },
  {
    slug: "gaming",
    name: "Gaming",
    image: "/images/prod_controller.jpg",
    tagline: "Battlestations"
  },
  {
    slug: "fashion",
    name: "Apparel",
    image: "/images/promo_streetwear.jpg",
    tagline: "Minimalist Techwear"
  },
  {
    slug: "shoes",
    name: "Footwear",
    image: "/images/showcase_sneaker.jpg",
    tagline: "Engineered Runners"
  },
  {
    slug: "accessories",
    name: "Watches & Gear",
    image: "/images/prod_galaxy_watch.jpg",
    tagline: "Titanium EDC"
  },
  {
    slug: "home",
    name: "Living Spaces",
    image: "/images/promo_home.jpg",
    tagline: "Atmospheric Decor"
  }
];

export default function Products() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Redux Selectors
  const products = useSelector(selectProducts);
  const pagination = useSelector(selectPagination);
  const categories = useSelector(selectCategories);
  const brands = useSelector(selectAvailableBrands);
  const priceRange = useSelector(selectPriceRange);
  const loading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);

  // Extract filter state from URL query parameters
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const rating = searchParams.get("rating") || "";
  const discount = searchParams.get("discount") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const searchQuery = searchParams.get("search") || "";

  // Dispatch API call whenever URL search params change
  useEffect(() => {
    const params = {
      page,
      limit: 12,
      sort
    };

    if (category) params.category = category;
    if (brand) params.brand = brand;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (rating) params.rating = rating;
    if (discount) params.discount = discount;
    if (searchQuery) params.search = searchQuery;

    dispatch(fetchProducts(params));
  }, [dispatch, category, brand, minPrice, maxPrice, rating, discount, sort, page, searchQuery]);

  // Ensure categories are loaded
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  // Handler to update a specific query parameter
  const handleFilterChange = (key, value) => {
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

  // Handler for pagination change
  const handlePageChange = (newPage) => {
    handleFilterChange("page", newPage.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset all applied filters
  const handleResetFilters = () => {
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set("search", searchQuery);
    setSearchParams(newParams);
  };

  // Active category object if filtered
  const activeCategoryObj = categories.find(
    (c) => c.slug === category || c._id === category
  );

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    category || brand || minPrice || maxPrice || rating || discount || (sort && sort !== "newest")
  );

  // Dynamic header text based on active filters
  const headerTag = category
    ? "Department Catalog"
    : discount
    ? "Limited-Time Offers"
    : "Curated Catalog";

  const headerTitle = category
    ? `${activeCategoryObj ? activeCategoryObj.name : category.charAt(0).toUpperCase() + category.slice(1)} Collection`
    : discount
    ? "Special Offers & Reductions"
    : "Product Collection";

  const headerSubtitle = searchQuery ? (
    <span>
      Search results for{" "}
      <span className="text-neutral-900 font-semibold">"{searchQuery}"</span>
    </span>
  ) : category ? (
    `Discover handcrafted ${activeCategoryObj ? activeCategoryObj.name.toLowerCase() : category} essentials, spatial hardware, and premium designs.`
  ) : discount ? (
    "Explore our complete line of discounted products across audio, apparel, and electronics."
  ) : (
    "Explore premium electronics, fashion, lifestyle gear, and 3D digital twins."
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen text-neutral-900">
      {/* ── 1. Visual Department Image Strip ─────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Departments & Specialties
          </span>
          <Link
            to="/categories"
            className="text-xs font-semibold text-neutral-800 hover:text-neutral-500 transition flex items-center gap-1"
          >
            <span>All Categories</span>
            <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {VISUAL_DEPARTMENTS.map((dept) => {
            const isSelected = category === dept.slug;
            return (
              <button
                key={dept.name}
                type="button"
                onClick={() => handleFilterChange("category", dept.slug)}
                className={`group shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition text-left cursor-pointer ${
                  isSelected
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                    : "bg-white text-neutral-800 border-neutral-200/80 hover:border-neutral-400 hover:bg-neutral-50"
                }`}
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/60">
                  <img
                    src={dept.image}
                    alt={dept.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                </div>
                <div className="pr-1">
                  <p className={`text-xs font-bold leading-none mb-0.5 ${isSelected ? "text-white" : "text-neutral-900"}`}>
                    {dept.name}
                  </p>
                  <p className={`text-[10px] ${isSelected ? "text-neutral-300" : "text-neutral-400"}`}>
                    {dept.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Editorial Featured Showcase Banner (Rich Visual Content) ─────── */}
      {!searchQuery && !category && (
        <div className="mb-10 rounded-3xl overflow-hidden bg-stone-900 text-white shadow-md relative flex flex-col md:flex-row items-center border border-neutral-800">
          <div className="p-8 sm:p-10 flex-1 z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-[11px] font-semibold uppercase tracking-wider mb-4 border border-white/10">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Curator's Seasonal Pick</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-medium tracking-tight mb-3 text-white">
              Aether Sonar ANC Acoustic System
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed mb-6">
              Precision 40mm titanium drivers, spatial acoustic chambers, and dual-chamber ANC calibrated for pristine audiophile fidelity.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/product/aether-sonar-anc-headphones"
                className="px-5 py-2.5 rounded-full bg-white text-neutral-900 text-xs font-semibold hover:bg-neutral-100 transition shadow-sm"
              >
                Discover Edition • ₹14,999
              </Link>
            </div>
          </div>

          <div className="w-full md:w-5/12 h-64 md:h-80 relative overflow-hidden shrink-0">
            <img
              src="/images/hero_headphones.jpg"
              alt="Aether Sonar ANC Headphones"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-stone-900 via-transparent to-transparent" />
          </div>
        </div>
      )}

      {/* ── 3. Page Header & Action Controls ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200/80">
              {headerTag}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-neutral-900 tracking-tight">
            {headerTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-light mt-1">
            {headerSubtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Mobile Filter Trigger Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 shadow-xs hover:border-neutral-900 transition"
          >
            <FilterIcon className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
            )}
          </button>

          {/* Sort Dropdown */}
          <ProductSort
            value={sort}
            onChange={(newSort) => handleFilterChange("sort", newSort)}
          />
        </div>
      </div>

      {/* ── 4. Active Filter Badges ─────────────────────────────────────────── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-4 pb-2">
          <span className="text-xs text-neutral-500 font-medium">Active:</span>

          {category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs text-neutral-800 shadow-xs">
              Category: <strong className="text-neutral-900">{activeCategoryObj ? activeCategoryObj.name : category}</strong>
              <button
                type="button"
                onClick={() => handleFilterChange("category", "")}
                className="hover:text-rose-600 ml-0.5 cursor-pointer"
                aria-label="Remove category filter"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {discount && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-xs text-amber-900 shadow-xs">
              Offers: <strong className="text-amber-950">Deals Only</strong>
              <button
                type="button"
                onClick={() => handleFilterChange("discount", "")}
                className="hover:text-rose-600 ml-0.5 cursor-pointer"
                aria-label="Remove deals filter"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {brand && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs text-neutral-800 shadow-xs">
              Brand: <strong className="text-neutral-900">{brand}</strong>
              <button
                type="button"
                onClick={() => handleFilterChange("brand", "")}
                className="hover:text-rose-600 ml-0.5 cursor-pointer"
                aria-label="Remove brand filter"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs text-neutral-800 shadow-xs">
              Price: <strong className="text-neutral-900">₹{minPrice || 0} - ₹{maxPrice || "Max"}</strong>
              <button
                type="button"
                onClick={() => {
                  handleFilterChange("minPrice", "");
                  handleFilterChange("maxPrice", "");
                }}
                className="hover:text-rose-600 ml-0.5 cursor-pointer"
                aria-label="Remove price filter"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {rating && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs text-neutral-800 shadow-xs">
              Rating: <strong className="text-neutral-900">{rating}★+</strong>
              <button
                type="button"
                onClick={() => handleFilterChange("rating", "")}
                className="hover:text-rose-600 ml-0.5 cursor-pointer"
                aria-label="Remove rating filter"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-neutral-900 hover:text-neutral-600 font-semibold ml-2 underline underline-offset-2 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── 5. Main Layout: Sidebar + Product Grid ──────────────────────────── */}
      <div className="flex gap-8 mt-6 items-start">
        {/* Filter Sidebar & Drawer */}
        <ProductFilters
          categories={categories}
          brands={brands}
          priceRange={priceRange}
          selectedCategory={category}
          selectedBrand={brand}
          minPrice={minPrice}
          maxPrice={maxPrice}
          selectedRating={rating}
          selectedDiscount={discount}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          isOpenMobile={mobileFilterOpen}
          onCloseMobile={() => setMobileFilterOpen(false)}
        />

        {/* Product Grid Area */}
        <div className="flex-1 min-w-0">
          <ProductGrid
            products={products}
            loading={loading}
            error={error}
            skeletonCount={8}
            emptyTitle="No products match your criteria"
            emptyMessage="Try adjusting your category, price range, or rating filters to find what you're looking for."
            onResetFilters={handleResetFilters}
            onRetry={() =>
              dispatch(
                fetchProducts({
                  page,
                  limit: 12,
                  sort,
                  category,
                  brand,
                  minPrice,
                  maxPrice,
                  rating,
                  search: searchQuery
                })
              )
            }
          />

          {/* Pagination */}
          {!loading && products.length > 0 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>


      {/* ── 7. Craftsmanship & Assurance Value Pillars ───────────────────────── */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-10 border-t border-neutral-200">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 shrink-0">
            <ShieldCheckIcon className="w-5 h-5 text-neutral-800" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 mb-0.5">3-Year Warranty</h4>
            <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
              Comprehensive hardware replacement and repair coverage included.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 shrink-0">
            <TruckIcon className="w-5 h-5 text-neutral-800" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 mb-0.5">Carbon-Neutral Freight</h4>
            <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
              Dispatched within 24 hours in 100% recyclable Japandi packaging.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 shrink-0">
            <SparklesIcon className="w-5 h-5 text-neutral-800" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 mb-0.5">30-Day Studio Trial</h4>
            <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
              Audition in your studio or living space with complimentary returns.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 shrink-0">
            <CubeIcon className="w-5 h-5 text-neutral-800" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 mb-0.5">Digital Twin Ready</h4>
            <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
              Explore 3D geometry and exploded views for every compatible piece.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

