import React from "react";
import { AlertCircleIcon, RefreshIcon } from "./Icons.jsx";

/**
 * Reusable error state component — Warm-light Japandi style.
 */
export default function ErrorState({
  title = "Unable to load content",
  message = "An error occurred while fetching data from the server. Please check your connection and try again.",
  onRetry
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 bg-white border border-rose-200/80 rounded-3xl my-8 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mb-4">
        <AlertCircleIcon className="w-6 h-6" />
      </div>

      <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-500 max-w-md text-xs sm:text-sm mb-6 leading-relaxed font-light">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs transition shadow-sm"
        >
          <RefreshIcon className="w-3.5 h-3.5" />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
}
