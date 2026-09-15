import React, { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  "Running shoes under ₹5,000",
  "Smartwatch with heart-rate tracking",
  "Noise cancelling headphones",
  "Comfortable backpacks for travel"
];

/**
 * Chat input component with suggestion chips, character counter, and keyboard shortcuts.
 */
export default function ChatInput({ onSend, isLoading, disabled = false }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  // Auto-focus input on mount
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const clean = text.trim();
    if (!clean || isLoading || disabled) return;

    onSend(clean);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChipClick = (suggestion) => {
    if (isLoading || disabled) return;
    onSend(suggestion);
  };

  const handleInput = (e) => {
    setText(e.target.value);
    // Auto-adjust height up to 120px
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="p-3 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md">
      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
        {SUGGESTIONS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading || disabled}
            onClick={() => handleChipClick(chip)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/60 whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            rows={1}
            maxLength={1000}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isLoading || disabled}
            placeholder={
              disabled
                ? "Please sign in to ask Aethera AI"
                : "Ask about products, prices, stock..."
            }
            className="w-full resize-none rounded-xl bg-slate-800/80 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-100 placeholder-slate-400 py-2.5 pl-3.5 pr-12 outline-none transition-all duration-200 max-h-32 disabled:bg-slate-900 disabled:opacity-60"
          />
          <div className="absolute right-3 bottom-2 text-[10px] text-slate-500 pointer-events-none">
            {text.length > 800 && `${1000 - text.length}`}
          </div>
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isLoading || disabled}
          aria-label="Send query"
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:pointer-events-none transition-all flex-shrink-0"
        >
          <svg
            className="w-5 h-5 translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
