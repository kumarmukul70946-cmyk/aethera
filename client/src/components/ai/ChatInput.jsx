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
    <div className="p-3.5 border-t border-neutral-100 bg-white">
      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
        {SUGGESTIONS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading || disabled}
            onClick={() => handleChipClick(chip)}
            className="text-[11px] px-3 py-1 rounded-full bg-[#FAF9F6] hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200 whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-40"
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
                ? "Please sign in to ask Aethera Concierge"
                : "Ask about materials, dimensions, verified reviews..."
            }
            className="w-full resize-none rounded-2xl bg-[#FAF9F6] border border-neutral-200 focus:border-neutral-900 focus:bg-white text-xs text-neutral-900 placeholder-neutral-400 py-3 pl-4 pr-12 outline-none transition-all duration-200 max-h-32 disabled:bg-neutral-100 disabled:opacity-60"
          />
          <div className="absolute right-3.5 bottom-2.5 text-[10px] text-neutral-400 pointer-events-none">
            {text.length > 800 && `${1000 - text.length}`}
          </div>
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isLoading || disabled}
          aria-label="Send query"
          className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center shadow-sm disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed transition-all flex-shrink-0"
        >
          <svg
            className="w-4 h-4 translate-x-0.5"
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
