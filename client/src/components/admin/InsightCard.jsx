import React from "react";

const TYPE_CONFIG = {
  REVENUE: {
    label: "Revenue",
    color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  ORDERS: {
    label: "Orders",
    color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )
  },
  PRODUCT: {
    label: "Product",
    color: "text-purple-400 border-purple-500/20 bg-purple-500/10",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  },
  CUSTOMER: {
    label: "Customer",
    color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  INVENTORY: {
    label: "Inventory",
    color: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    )
  },
  SEARCH: {
    label: "Search Demand",
    color: "text-pink-400 border-pink-500/20 bg-pink-500/10",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  REVIEW: {
    label: "Reviews",
    color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/10",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )
  },
  CONVERSION: {
    label: "Conversion",
    color: "text-teal-400 border-teal-500/20 bg-teal-500/10",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  },
  ANOMALY: {
    label: "Anomaly",
    color: "text-rose-400 border-rose-500/20 bg-rose-500/10",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  }
};

const SEVERITY_CONFIG = {
  INFO: {
    label: "INFO",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  },
  WARNING: {
    label: "WARNING",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20"
  },
  CRITICAL: {
    label: "CRITICAL",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse"
  }
};

/**
 * InsightCard component rendering an individual structured business insight item.
 */
export default function InsightCard({ insight }) {
  if (!insight) return null;

  const typeConfig = TYPE_CONFIG[insight.type] || {
    label: insight.type || "General",
    color: "text-neutral-400 border-neutral-700 bg-neutral-800",
    icon: null
  };

  const severityConfig = SEVERITY_CONFIG[insight.severity] || SEVERITY_CONFIG.INFO;

  return (
    <div className="group relative flex flex-col justify-between p-5 rounded-2xl bg-neutral-900/60 border border-white/5 hover:border-indigo-500/30 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${typeConfig.color}`}
          >
            {typeConfig.icon}
            {typeConfig.label}
          </span>

          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wider uppercase border ${severityConfig.badgeClass}`}
          >
            {severityConfig.label}
          </span>
        </div>

        {/* Insight Title */}
        <h4 className="text-base font-semibold text-neutral-100 group-hover:text-white transition-colors mb-2 leading-snug">
          {insight.title}
        </h4>

        {/* Insight Description */}
        <p className="text-sm text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">
          {insight.description}
        </p>
      </div>

      {/* Subtle bottom accent line */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-neutral-500">
        <span>Grounded in metrics</span>
        <span className="text-neutral-400 font-mono">Type: {insight.type}</span>
      </div>
    </div>
  );
}
