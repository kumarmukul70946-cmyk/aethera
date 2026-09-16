import React from "react";

/**
 * Animated typing indicator indicating catalog retrieval and LLM generation.
 */
export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 my-3">
      <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center text-white shadow-sm flex-shrink-0 text-[10px] font-semibold">
        AI
      </div>
      <div className="bg-white border border-neutral-200/80 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-[85%]">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce"></span>
        </div>
        <p className="text-xs text-neutral-400 font-medium">
          Consulting catalog & verifying inventory...
        </p>
      </div>
    </div>
  );
}
