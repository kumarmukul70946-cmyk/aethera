import React from "react";
import { AlertCircleIcon, RefreshIcon } from "./Icons.jsx";

/**
 * Reusable error state component.
 * @param {Object} props
 * @param {string} [props.title="Unable to load content"]
 * @param {string} [props.message="An error occurred while fetching data from the server."]
 * @param {Function} [props.onRetry]
 */
export default function ErrorState({
  title = "Unable to load content",
  message = "An error occurred while fetching data from the server. Please check your connection and try again.",
  onRetry
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-rose-950/20 border border-rose-900/40 rounded-3xl my-8">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-5">
        <AlertCircleIcon className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-sm transition border border-slate-700/60"
        >
          <RefreshIcon className="w-4 h-4" />
          Retry Request
        </button>
      )}
    </div>
  );
}
