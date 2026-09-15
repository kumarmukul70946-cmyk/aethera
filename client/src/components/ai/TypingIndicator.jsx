import React from "react";

/**
 * Animated typing indicator indicating catalog retrieval and LLM generation.
 */
export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 my-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md flex-shrink-0 text-xs font-bold">
        AI
      </div>
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-tl-none px-4 py-3 shadow-lg max-w-[85%]">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></span>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          Retrieving live catalog & verifying stock...
        </p>
      </div>
    </div>
  );
}
