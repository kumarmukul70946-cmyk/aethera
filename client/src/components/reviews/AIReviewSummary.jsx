import React, { useEffect, useState, useCallback } from "react";
import { reviewService } from "../../services/reviewService.js";
import { SparklesIcon, AlertCircleIcon, RefreshIcon } from "../common/Icons.jsx";

/**
 * AI Review Summary Component — Warm-light Japandi aesthetic.
 */
export default function AIReviewSummary({ productId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await reviewService.getAIReviewSummary(productId);
      if (res && res.success) {
        setData(res.data);
      } else {
        setData(null);
      }
    } catch (err) {
      console.warn("[AIReviewSummary] Failed to load review summary:", err.message);
      setError(
        err.response?.data?.message ||
          "AI review summary is temporarily unavailable. Original reviews remain accessible."
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="rounded-3xl bg-white border border-neutral-200/80 p-6 sm:p-8 shadow-sm animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-neutral-100" />
            <div className="w-36 h-4 bg-neutral-200 rounded-full" />
          </div>
          <div className="w-24 h-5 bg-neutral-100 rounded-full" />
        </div>
        <div className="space-y-2 pt-1">
          <div className="w-full h-3 bg-neutral-100 rounded" />
          <div className="w-5/6 h-3 bg-neutral-100 rounded" />
          <div className="w-2/3 h-3 bg-neutral-100 rounded" />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="rounded-3xl bg-white border border-neutral-200/80 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 text-neutral-600 text-xs">
          <AlertCircleIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
        <button
          type="button"
          onClick={fetchSummary}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition shadow-xs"
        >
          <RefreshIcon className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // 3. Insufficient / Zero Reviews State
  if (!data || !data.summary || data.reviewCount === 0) {
    return (
      <div className="rounded-3xl bg-white border border-neutral-200/80 p-8 text-center space-y-2 shadow-xs">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 text-neutral-800 mb-1 border border-neutral-200">
          <SparklesIcon className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-neutral-900">AI Review Summary</h4>
        <p className="text-xs text-neutral-500 font-light max-w-md mx-auto">
          {data?.message || "There are not enough approved reviews yet to generate an AI summary."}
        </p>
      </div>
    );
  }

  const { summary, sentiment = "positive", themes = [], reviewCount = 0 } = data;

  const sentimentConfig = {
    positive: {
      label: "Positive Sentiment",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotClass: "bg-emerald-500"
    },
    mixed: {
      label: "Mixed Sentiment",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      dotClass: "bg-amber-500"
    },
    negative: {
      label: "Critical Sentiment",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      dotClass: "bg-rose-500"
    }
  };

  const currentSentiment = sentimentConfig[sentiment] || sentimentConfig.mixed;

  const getThemeSentimentClass = (themeSent) => {
    if (themeSent === "positive") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (themeSent === "negative") {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <div className="rounded-3xl bg-white border border-neutral-200/80 p-6 sm:p-8 shadow-sm space-y-5 text-neutral-900">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#ECE7FE] text-[#6B46C1] shadow-xs">
            <SparklesIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                AI Review Intelligence Summary
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-light">
              Synthesized from {reviewCount} verified customer {reviewCount === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>

        {/* Overall Sentiment Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentSentiment.badgeClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${currentSentiment.dotClass}`} />
          <span>{currentSentiment.label}</span>
        </div>
      </div>

      {/* Qualitative Summary Narrative */}
      <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-light">
        {summary}
      </p>

      {/* Themes Breakdown */}
      {themes.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Key Highlights Identified
          </h4>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme, idx) => (
              <div
                key={idx}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getThemeSentimentClass(
                  theme.sentiment
                )}`}
              >
                <span className="font-semibold">{theme.name}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 capitalize">
                  • {theme.sentiment}
                </span>
                {theme.evidenceCount !== undefined && theme.evidenceCount > 0 && (
                  <span className="text-[10px] opacity-70 font-mono">
                    ({theme.evidenceCount})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
