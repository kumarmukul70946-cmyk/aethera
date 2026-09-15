import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import searchService from "../services/searchService.js";
import productService from "../services/productService.js";
import trackingService from "../services/trackingService.js";
import ProductGrid from "../components/product/ProductGrid.jsx";
import ProductSearch from "../components/product/ProductSearch.jsx";
import Pagination from "../components/common/Pagination.jsx";
import useDebounce from "../hooks/useDebounce.js";
import { SparklesIcon, FilterIcon, StarIcon } from "../components/common/Icons.jsx";

const SUGGESTIONS = [
  "comfortable shoes for marathon training",
  "lightweight running footwear",
  "minimalist desk setup",
  "wireless headphones for travel",
  "gaming laptop for heavy performance"
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get("q") || "";
  const modeParam = searchParams.get("mode") || "semantic";
  const categoryParam = searchParams.get("category") || "";
  const brandParam = searchParams.get("brand") || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const ratingParam = searchParams.get("rating") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Local state
  const [inputQuery, setInputQuery] = useState(queryParam);
  const [searchMode, setSearchMode] = useState(modeParam);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);

  // Filter form state
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrand, setSelectedBrand] = useState(brandParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [minRating, setMinRating] = useState(ratingParam);

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [effectiveSearchMode, setEffectiveSearchMode] = useState(modeParam);

  const debouncedQuery = useDebounce(inputQuery, 450);

  // Load categories for filter dropdown
  useEffect(() => {
    productService
      .getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.warn("[Search] Could not load categories:", err.message));
  }, []);

  // Update URL params
  const updateUrlParams = useCallback(
    (updates = {}) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          newParams.set(key, String(value).trim());
        } else {
          newParams.delete(key);
        }
      });

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Synchronize debounced text input with URL
  useEffect(() => {
    if (debouncedQuery.trim() !== queryParam) {
      updateUrlParams({ q: debouncedQuery.trim(), page: 1 });
    }
  }, [debouncedQuery, queryParam, updateUrlParams]);

  // Execute search when URL search params change
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const mode = searchParams.get("mode") || "semantic";
    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const minP = searchParams.get("minPrice") || undefined;
    const maxP = searchParams.get("maxPrice") || undefined;
    const rating = searchParams.get("rating") || undefined;

    async function executeSearch() {
      if (!q.trim()) {
        setProducts([]);
        setPagination({ page: 1, limit: 12, total: 0, totalPages: 1 });
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const params = {
        q: q.trim(),
        page: currentPage,
        limit: 12,
        category: category || undefined,
        brand: brand || undefined,
        minPrice: minP,
        maxPrice: maxP,
        rating
      };

      try {
        let result;
        if (mode === "semantic") {
          result = await searchService.semanticSearch(params);
          setEffectiveSearchMode(result.searchMode || "semantic");
        } else {
          result = await searchService.keywordSearch(params);
          setEffectiveSearchMode("keyword");
        }

        setProducts(result.products || []);
        setPagination(
          result.pagination || { page: currentPage, limit: 12, total: result.products?.length || 0, totalPages: 1 }
        );

        // Track search interaction analytics
        trackingService.trackSearch(q.trim(), {
          source: "search_page",
          mode,
          totalResults: result.pagination?.total || (result.products ? result.products.length : 0),
          page: currentPage
        });
      } catch (err) {
        setError(err.message || "An unexpected error occurred during search.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    executeSearch();
  }, [searchParams, currentPage]);

  const handleModeToggle = (newMode) => {
    setSearchMode(newMode);
    updateUrlParams({ mode: newMode, page: 1 });
  };

  const handleSuggestionClick = (phrase) => {
    setInputQuery(phrase);
    setSearchMode("semantic");
    updateUrlParams({ q: phrase, mode: "semantic", page: 1 });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    updateUrlParams({
      category: selectedCategory,
      brand: selectedBrand,
      minPrice: minPrice,
      maxPrice: maxPrice,
      rating: minRating,
      page: 1
    });
    setShowFilters(false);
  };

  const handleResetAll = () => {
    setInputQuery("");
    setSelectedCategory("");
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    updateUrlParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters = Boolean(
    categoryParam || brandParam || minPriceParam || maxPriceParam || ratingParam
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Search Bar */}
      <div className="max-w-3xl mx-auto text-center mb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <SparklesIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Part 15 — AI Semantic Search</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Find Products by Meaning
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Describe what you need in natural language or switch to exact keyword search.
        </p>

        {/* Mode Selector Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => handleModeToggle("semantic")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              searchMode === "semantic"
                ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>AI Semantic Search</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeToggle("keyword")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              searchMode === "keyword"
                ? "bg-slate-800 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Exact Keyword</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="pt-2">
          <ProductSearch
            value={inputQuery}
            onChange={setInputQuery}
            onClear={() => {
              setInputQuery("");
              updateUrlParams({ q: "", page: 1 });
            }}
            placeholder={
              searchMode === "semantic"
                ? "Describe what you need (e.g., 'lightweight shoes for marathon training')..."
                : "Type product title, brand, or SKU..."
            }
          />
        </div>

        {/* Suggestion Chips */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Try:</span>
          {SUGGESTIONS.map((phrase) => (
            <button
              key={phrase}
              type="button"
              onClick={() => handleSuggestionClick(phrase)}
              className="text-xs px-3 py-1 rounded-full bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-slate-800 gap-4 text-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              hasActiveFilters || showFilters
                ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/40"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            <FilterIcon className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </button>

          {queryParam && (
            <p className="text-slate-400 text-xs sm:text-sm">
              Showing results for{" "}
              <span className="text-indigo-400 font-semibold">"{queryParam}"</span>
              {effectiveSearchMode === "keyword_fallback" && (
                <span className="ml-2 text-amber-400 font-normal text-xs">
                  (Keyword fallback mode)
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetAll}
              className="text-xs text-rose-400 hover:text-rose-300 transition font-medium"
            >
              Clear Filters
            </button>
          )}
          {queryParam && (
            <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              {pagination.total} {pagination.total === 1 ? "result" : "results"}
            </span>
          )}
        </div>
      </div>

      {/* Collapsible Structured Filters Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleApplyFilters}
            className="mb-8 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs overflow-hidden"
          >
            {/* Category */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Brand</label>
              <input
                type="text"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                placeholder="e.g. Aether, Lumina"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Min Price (₹)</label>
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Max Price (₹)</label>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="No limit"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Rating & Submit */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Min Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition text-center"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedBrand("");
                    setMinPrice("");
                    setMaxPrice("");
                    setMinRating("");
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Search Results Grid */}
      <ProductGrid
        products={products}
        loading={loading}
        error={error}
        skeletonCount={8}
        emptyTitle={queryParam ? `No products found for "${queryParam}"` : "Ready to Search"}
        emptyMessage={
          queryParam
            ? "Try using broader natural language terms, removing filter constraints, or exploring our suggested queries above."
            : "Enter a search query or choose an AI suggested query above to browse the catalog."
        }
        onResetFilters={handleResetAll}
        onRetry={() => {
          updateUrlParams({ page: currentPage });
        }}
      />

      {/* Pagination */}
      {!loading && products.length > 0 && pagination.totalPages > 1 && (
        <div className="pt-8">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
