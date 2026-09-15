import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
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
import { FilterIcon, CloseIcon, RotateCcwIcon } from "../components/common/Icons.jsx";

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
    if (searchQuery) params.search = searchQuery;

    dispatch(fetchProducts(params));
  }, [dispatch, category, brand, minPrice, maxPrice, rating, sort, page, searchQuery]);

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

    // Reset to page 1 whenever filters or sort change
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

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    category || brand || minPrice || maxPrice || rating || (sort && sort !== "newest")
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Product Catalog
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {searchQuery ? (
              <span>
                Search results for{" "}
                <span className="text-indigo-400 font-semibold">"{searchQuery}"</span>
              </span>
            ) : (
              "Explore premium electronics, gadgets, and next-generation lifestyle gear."
            )}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Mobile Filter Trigger Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium text-slate-200 hover:text-white"
          >
            <FilterIcon className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </button>

          {/* Sort Dropdown */}
          <ProductSort
            value={sort}
            onChange={(newSort) => handleFilterChange("sort", newSort)}
          />
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-4 pb-2">
          <span className="text-xs text-slate-400 font-medium">Active Filters:</span>

          {category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200">
              Category: <strong className="text-indigo-400">{category}</strong>
              <button
                type="button"
                onClick={() => handleFilterChange("category", "")}
                className="hover:text-rose-400 ml-0.5"
                aria-label="Remove category filter"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {brand && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200">
              Brand: <strong className="text-indigo-400">{brand}</strong>
              <button
                type="button"
                onClick={() => handleFilterChange("brand", "")}
                className="hover:text-rose-400 ml-0.5"
                aria-label="Remove brand filter"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200">
              Price: <strong className="text-indigo-400">₹{minPrice || 0} - ₹{maxPrice || "Max"}</strong>
              <button
                type="button"
                onClick={() => {
                  handleFilterChange("minPrice", "");
                  handleFilterChange("maxPrice", "");
                }}
                className="hover:text-rose-400 ml-0.5"
                aria-label="Remove price filter"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {rating && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200">
              Rating: <strong className="text-indigo-400">{rating}★+</strong>
              <button
                type="button"
                onClick={() => handleFilterChange("rating", "")}
                className="hover:text-rose-400 ml-0.5"
                aria-label="Remove rating filter"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold ml-2 underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Layout: Sidebar + Product Grid */}
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
            onRetry={() => dispatch(fetchProducts({ page, limit: 12, sort, category, brand, minPrice, maxPrice, rating, search: searchQuery }))}
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
    </div>
  );
}
