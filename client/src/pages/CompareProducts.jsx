import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectComparisonProductIds,
  selectComparisonProducts,
  selectComparisonResult,
  selectComparisonStatus,
  selectComparisonError
} from "../features/comparison/comparisonSelectors.js";
import {
  fetchProductComparison,
  removeFromCompare,
  clearCompare,
  setCompareItemsFromProducts
} from "../features/comparison/comparisonSlice.js";
import ProductComparisonTable from "../components/comparison/ProductComparisonTable.jsx";
import ComparisonSummary from "../components/comparison/ComparisonSummary.jsx";
import ComparisonTradeoffs from "../components/comparison/ComparisonTradeoffs.jsx";
import ComparisonReviewInsights from "../components/comparison/ComparisonReviewInsights.jsx";
import {
  CompareIcon,
  SparklesIcon,
  SearchIcon,
  RefreshIcon,
  CheckIcon
} from "../components/common/Icons.jsx";
import api from "../services/api.js";

/**
 * CompareProducts Page
 * Grounded multi-product comparison page supporting 2 to 4 products.
 * Handles shareable URL state (/compare?products=id1,id2), custom question answering,
 * and deterministic catalog specification tables.
 */
export default function CompareProducts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedProductIds = useSelector(selectComparisonProductIds);
  const selectedProducts = useSelector(selectComparisonProducts);
  const comparisonResult = useSelector(selectComparisonResult);
  const status = useSelector(selectComparisonStatus);
  const error = useSelector(selectComparisonError);

  const [questionInput, setQuestionInput] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [urlLoaded, setUrlLoaded] = useState(false);

  // 1. Sync state with URL parameter (?products=id1,id2)
  const urlProductParam = searchParams.get("products");

  useEffect(() => {
    const loadFromUrl = async () => {
      if (urlProductParam) {
        const ids = urlProductParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 4);

        if (ids.length >= 2) {
          // If Redux doesn't have these IDs already, fetch their summaries from API
          const idsMatch =
            ids.length === selectedProductIds.length &&
            ids.every((id, idx) => id === selectedProductIds[idx]);

          if (!idsMatch) {
            try {
              // Fetch product previews
              const previews = await Promise.all(
                ids.map(async (id) => {
                  try {
                    const res = await api.get(`/products/${id}`);
                    return res.data.data.product || res.data.data;
                  } catch (e) {
                    return null;
                  }
                })
              );

              const validPreviews = previews.filter(Boolean);
              if (validPreviews.length >= 2) {
                dispatch(setCompareItemsFromProducts(validPreviews));
                dispatch(fetchProductComparison({ productIds: ids }));
              }
            } catch (err) {
              console.warn("[CompareProducts] Failed to load preview for URL IDs:", err);
            }
          }
        }
      }
      setUrlLoaded(true);
    };

    loadFromUrl();
  }, [urlProductParam, dispatch]);

  // 2. Fetch comparison when selectedProductIds change if no result yet or count changed
  useEffect(() => {
    if (!urlLoaded) return;

    if (selectedProductIds.length >= 2) {
      // Update URL query parameter
      const queryIds = selectedProductIds.join(",");
      if (searchParams.get("products") !== queryIds) {
        setSearchParams({ products: queryIds }, { replace: true });
      }

      // Check if current comparisonResult matches selected IDs
      const resultMatches =
        comparisonResult &&
        Array.isArray(comparisonResult.products) &&
        comparisonResult.products.length === selectedProductIds.length &&
        comparisonResult.products.every((p) => selectedProductIds.includes(p._id || p.id));

      if (!resultMatches && status !== "loading") {
        dispatch(fetchProductComparison({ productIds: selectedProductIds }));
      }
    } else {
      if (searchParams.has("products")) {
        searchParams.delete("products");
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [selectedProductIds, urlLoaded, dispatch, comparisonResult, status, searchParams, setSearchParams]);

  // Handle asking custom scenario question
  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (!questionInput.trim() || selectedProductIds.length < 2) return;

    dispatch(
      fetchProductComparison({
        productIds: selectedProductIds,
        question: questionInput.trim()
      })
    );
  };

  // Copy shareable link to clipboard
  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/compare?products=${selectedProductIds.join(",")}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const handleRemoveProduct = (productId) => {
    dispatch(removeFromCompare(productId));
  };

  const handleClearAll = () => {
    dispatch(clearCompare());
    setSearchParams({}, { replace: true });
  };

  const displayProducts = comparisonResult?.products || selectedProducts;
  const displayTable = comparisonResult?.comparisonTable || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <CompareIcon className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              Aethera Intelligence
            </span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-neutral-900 tracking-tight">
            AI Product Comparison
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Grounded in authoritative MongoDB catalog specifications and verified customer feedback.
          </p>
        </div>

        {/* Action Controls */}
        {selectedProductIds.length >= 2 && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50 text-xs font-medium transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <CompareIcon className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Share Comparison</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-500 hover:text-rose-600 hover:border-rose-200 text-xs font-medium transition shadow-xs cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {selectedProductIds.length < 2 ? (
        /* Empty State */
        <div className="bg-white border border-neutral-200/90 rounded-3xl p-8 sm:p-16 text-center shadow-xs max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center mb-4">
            <CompareIcon className="w-8 h-8" />
          </div>
          <h2 className="font-serif font-bold text-neutral-900 text-xl sm:text-2xl mb-2">
            Select Products to Compare
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-md mx-auto mb-6 font-light">
            You need at least 2 products (up to 4) to generate a grounded comparison.
            Browse our catalog and click "Compare" on any product card.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition"
          >
            <SearchIcon className="w-4 h-4" />
            <span>Explore Catalog</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Question Input Pill */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
            <form onSubmit={handleQuestionSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-neutral-400">
                  <SparklesIcon className="w-4 h-4 text-amber-500" />
                </div>
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="Ask a question about these products (e.g., Which is better for marathon training?)"
                  className="w-full bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200/90 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading" || !questionInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                {status === "loading" ? (
                  <>
                    <RefreshIcon className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ask AI</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Loading Indicator */}
          {status === "loading" && !comparisonResult && (
            <div className="bg-white border border-neutral-200/90 rounded-3xl p-12 text-center shadow-xs">
              <div className="w-10 h-10 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin mx-auto mb-4" />
              <h3 className="font-serif font-bold text-neutral-900 text-base mb-1">
                Synthesizing Authoritative Comparison...
              </h3>
              <p className="text-xs text-neutral-500">
                Fetching catalog specifications and customer reviews from MongoDB.
              </p>
            </div>
          )}

          {/* Error Message */}
          {status === "failed" && error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
              <p className="text-xs sm:text-sm text-rose-700 font-medium">
                {error}
              </p>
              <button
                type="button"
                onClick={() => dispatch(fetchProductComparison({ productIds: selectedProductIds }))}
                className="mt-2 text-xs font-semibold text-rose-800 underline hover:text-rose-900"
              >
                Retry Comparison
              </button>
            </div>
          )}

          {/* Tabular Attribute Comparison Table */}
          {displayProducts.length >= 2 && (
            <ProductComparisonTable
              products={displayProducts}
              comparisonTable={displayTable}
              onRemoveProduct={handleRemoveProduct}
            />
          )}

          {/* AI Narrative Summary Card */}
          {comparisonResult && (
            <ComparisonSummary
              summary={comparisonResult.summary}
              questionAnswer={comparisonResult.questionAnswer}
              activeQuestion={questionInput}
              disclaimer={comparisonResult.disclaimer}
            />
          )}

          {/* Balanced Trade-offs Grid */}
          {comparisonResult && Array.isArray(comparisonResult.tradeoffs) && (
            <ComparisonTradeoffs
              products={displayProducts}
              tradeoffs={comparisonResult.tradeoffs}
            />
          )}

          {/* Customer Review Insights Grid */}
          {comparisonResult && Array.isArray(comparisonResult.reviewInsights) && (
            <ComparisonReviewInsights
              products={displayProducts}
              reviewInsights={comparisonResult.reviewInsights}
            />
          )}

          {/* Source Transparency Footer */}
          {comparisonResult && Array.isArray(comparisonResult.sources) && (
            <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 text-xs text-neutral-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-700">Verified Sources:</span>
                <span>
                  {comparisonResult.sources.map((s) => s.name).join(", ")}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400">
                Generated: {new Date(comparisonResult.generatedAt).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
