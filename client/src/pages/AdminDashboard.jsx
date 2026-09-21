import React, { useState, useEffect } from "react";
import AIInsightsPanel from "../components/admin/AIInsightsPanel.jsx";
import { getAnalytics } from "../services/aiInsightService.js";

/**
 * AdminDashboard Page Component.
 * Displays authoritative MongoDB e-commerce analytics KPIs and integrates
 * the AI Business Insights interpretation panel.
 */
export default function AdminDashboard() {
  const [period, setPeriod] = useState("30d");
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      setLoadingAnalytics(true);
      setAnalyticsError(null);
      try {
        const res = await getAnalytics({ period });
        if (isMounted && res.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setAnalyticsError(err.message || "Failed to load authoritative analytics.");
        }
      } finally {
        if (isMounted) setLoadingAnalytics(false);
      }
    }

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [period]);

  const rev = analytics?.revenue || { current: 0, previous: 0, growthPercent: 0 };
  const ord = analytics?.orders || { current: 0, previous: 0, growthPercent: 0, averageOrderValue: 0 };
  const cust = analytics?.customers || { new: 0, returning: 0, totalActive: 0 };
  const conv = analytics?.conversion || { viewToCartRate: 0, cartToPurchaseRate: 0, overallConversionRate: 0 };
  const prods = analytics?.products || { topByRevenue: [], topByOrders: [], lowStock: [], outOfStock: [] };
  const interactions = analytics?.interactions || { views: 0, cartAdds: 0, wishlistAdds: 0, searches: 0 };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Dashboard Title & Overview Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Administrative Executive Suite
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Store Analytics & AI Insights
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Real-time authoritative commerce metrics with intelligent AI trend interpretation.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 self-start md:self-auto text-xs text-neutral-400 bg-neutral-900/80 px-4 py-2 rounded-xl border border-white/5">
            <span>Database: <strong className="text-emerald-400">Connected</strong></span>
            <span className="text-neutral-600">•</span>
            <span>LLM: <strong className="text-indigo-400">Grounded Mode</strong></span>
          </div>
        </div>

        {/* SECTION 1: Authoritative KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Revenue KPI */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="uppercase tracking-wider font-semibold">Total Revenue</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  rev.growthPercent >= 0
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {rev.growthPercent >= 0 ? `+${rev.growthPercent}%` : `${rev.growthPercent}%`}
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              ₹{rev.current.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-neutral-500">
              vs ₹{rev.previous.toLocaleString()} in prior {period}
            </div>
          </div>

          {/* Orders KPI */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="uppercase tracking-wider font-semibold">Orders Processed</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  ord.growthPercent >= 0
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {ord.growthPercent >= 0 ? `+${ord.growthPercent}%` : `${ord.growthPercent}%`}
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {ord.current.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-neutral-500">
              Avg Order: ₹{ord.averageOrderValue.toLocaleString()}
            </div>
          </div>

          {/* Customers KPI */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="uppercase tracking-wider font-semibold">Active Shoppers</span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {cust.totalActive} Total
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {cust.new + cust.returning}
            </div>
            <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between">
              <span>New: <strong className="text-neutral-300">{cust.new}</strong></span>
              <span>Repeat: <strong className="text-neutral-300">{cust.returning}</strong></span>
            </div>
          </div>

          {/* Conversion Funnel KPI */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="uppercase tracking-wider font-semibold">Conversion Rate</span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Overall: {conv.overallConversionRate}%
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {conv.viewToCartRate}%
            </div>
            <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between">
              <span>Cart Add: <strong className="text-neutral-300">{conv.viewToCartRate}%</strong></span>
              <span>Purchase: <strong className="text-neutral-300">{conv.cartToPurchaseRate}%</strong></span>
            </div>
          </div>
        </div>

        {/* SECTION 2: AI Business Insights Component */}
        <AIInsightsPanel
          defaultPeriod={period}
          onPeriodChange={(newPeriod) => setPeriod(newPeriod)}
        />

        {/* SECTION 3: Deep Dives — Products Performance & Inventory Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products by Revenue */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 backdrop-blur-xl shadow-lg">
            <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
              <span>Top Products by Revenue</span>
              <span className="text-xs font-normal text-neutral-500">Period: {period.toUpperCase()}</span>
            </h3>

            {prods.topByRevenue?.length > 0 ? (
              <div className="divide-y divide-white/5">
                {prods.topByRevenue.map((p, idx) => (
                  <div key={p.id || idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-400 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="text-sm font-medium text-neutral-200 truncate">{p.name}</p>
                        <p className="text-xs text-neutral-500">{p.unitsSold} units sold</p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-emerald-400 shrink-0">
                      ₹{p.revenue.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 py-6 text-center">No orders recorded in this period.</p>
            )}
          </div>

          {/* Inventory Risk Monitor */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 backdrop-blur-xl shadow-lg">
            <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
              <span>Inventory Health & Stock Risks</span>
              <span className="text-xs font-normal text-neutral-500">Threshold: ≤ 10 units</span>
            </h3>

            {prods.outOfStock?.length === 0 && prods.lowStock?.length === 0 ? (
              <div className="p-8 text-center text-xs text-emerald-400 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                ✓ All active products are adequately stocked.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Out of Stock */}
                {prods.outOfStock?.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px] uppercase">
                        Out of Stock
                      </span>
                      <span className="text-neutral-200 font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono text-rose-400 font-bold">0 units</span>
                  </div>
                ))}

                {/* Low Stock */}
                {prods.lowStock?.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black font-bold text-[10px] uppercase">
                        Low Stock
                      </span>
                      <span className="text-neutral-200 font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono text-amber-400 font-bold">{item.stock} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: Engagement & Telemetry Funnel */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 backdrop-blur-xl shadow-lg">
          <h3 className="text-base font-bold text-white mb-4">
            Shopper Engagement & Catalog Interaction Telemetry
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 text-center">
              <span className="text-xs text-neutral-500 block mb-1">Product Views</span>
              <span className="text-xl font-bold text-white">{interactions.views.toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 text-center">
              <span className="text-xs text-neutral-500 block mb-1">Cart Additions</span>
              <span className="text-xl font-bold text-white">{interactions.cartAdds.toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 text-center">
              <span className="text-xs text-neutral-500 block mb-1">Wishlist Adds</span>
              <span className="text-xl font-bold text-white">{interactions.wishlistAdds.toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/5 text-center">
              <span className="text-xs text-neutral-500 block mb-1">Search Queries</span>
              <span className="text-xl font-bold text-white">{interactions.searches.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
