import React, { useState, useEffect } from "react";
import InsightCard from "./InsightCard.jsx";
import { getInsights, generateInsights } from "../../services/aiInsightService.js";

const PERIOD_OPTIONS = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" }
];

/**
 * AIInsightsPanel component for the Admin Dashboard.
 * Fetches, caches, displays, and regenerates grounded AI Business Insights.
 */
export default function AIInsightsPanel({ defaultPeriod = "30d", onPeriodChange }) {
  const [period, setPeriod] = useState(defaultPeriod);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);

  // Load insights whenever period changes
  useEffect(() => {
    let isMounted = true;

    async function fetchInsightsData() {
      setLoading(true);
      setError(null);
      try {
        const res = await getInsights({ period });
        if (isMounted && res.success) {
          setData(res.data);
          if (onPeriodChange) onPeriodChange(period);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load AI business insights.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchInsightsData();

    return () => {
      isMounted = false;
    };
  }, [period]);

  const handlePeriodSelect = (selectedPeriod) => {
    if (selectedPeriod === period || loading || regenerating) return;
    setPeriod(selectedPeriod);
  };

  const handleRegenerate = async () => {
    if (regenerating) return;
    setRegenerating(true);
    setError(null);

    try {
      const res = await generateInsights({ period });
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to regenerate insights. Please try again.");
    } finally {
      setRegenerating(false);
    }
  };

  const formattedTimestamp = data?.generatedAt
    ? new Date(data.generatedAt).toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : null;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-neutral-950/80 border border-white/10 p-6 lg:p-8 backdrop-blur-2xl shadow-2xl shadow-black/40">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Top Header & Controls */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
                🤖
              </span>
              AI Business Insights
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Grounded AI
            </span>
          </div>
          <p className="text-xs lg:text-sm text-neutral-400 mt-1">
            Authoritative metrics calculated by MongoDB, explained and interpreted by AI.
          </p>
        </div>

        {/* Period Selector Tabs & Regenerate Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-neutral-900 border border-white/5 shadow-inner">
            {PERIOD_OPTIONS.map((opt) => {
              const isActive = period === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handlePeriodSelect(opt.id)}
                  disabled={loading || regenerating}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                  } disabled:opacity-50`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleRegenerate}
            disabled={loading || regenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-white/10 transition-all disabled:opacity-50 shadow-sm"
            title="Force fresh AI generation bypassing cache"
          >
            <svg
              className={`w-3.5 h-3.5 ${regenerating ? "animate-spin text-indigo-400" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {regenerating ? "Regenerating..." : "Regenerate Insights"}
          </button>
        </div>
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="relative z-10 mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200 underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="relative z-10 mt-6 space-y-6 animate-pulse">
          <div className="h-24 rounded-2xl bg-neutral-900/60 border border-white/5" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-44 rounded-2xl bg-neutral-900/60 border border-white/5" />
            <div className="h-44 rounded-2xl bg-neutral-900/60 border border-white/5" />
            <div className="h-44 rounded-2xl bg-neutral-900/60 border border-white/5" />
          </div>
        </div>
      ) : data ? (
        <div className="relative z-10 mt-6 space-y-6">
          {/* Executive Summary Card */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-neutral-900/50 to-purple-950/40 border border-indigo-500/20 shadow-lg">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
                Executive Overview
              </span>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                {data.fromCache ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Cached
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Fresh
                  </span>
                )}
                <span>Based on: {period.toUpperCase()}</span>
              </div>
            </div>
            <p className="text-sm md:text-base text-neutral-200 leading-relaxed font-normal">
              {data.summary}
            </p>
          </div>

          {/* Structured Insights Grid */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-3">
              Detailed Trends & Observations ({data.insights?.length || 0})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.insights?.map((item, idx) => (
                <InsightCard key={`${item.type}-${idx}`} insight={item} />
              ))}
            </div>
          </div>

          {/* Limitations & Footnotes Footer */}
          <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-neutral-500">
            <div className="space-y-1">
              <span className="font-semibold text-neutral-400 block">Analytical Limitations:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-neutral-400">
                {data.limitations?.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>

            {formattedTimestamp && (
              <div className="shrink-0 text-right font-mono text-[11px] text-neutral-500">
                Generated: {formattedTimestamp}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative z-10 mt-6 p-8 text-center text-neutral-400 text-sm">
          No insights available for this period. Click "Regenerate Insights" to run analysis.
        </div>
      )}
    </section>
  );
}
