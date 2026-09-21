import React, { useState } from "react";
import { SparklesIcon, RotateCcwIcon, ArrowRightIcon } from "../common/Icons.jsx";
import aiCustomizationService from "../../services/aiCustomizationService.js";

/**
 * AI3DCustomizer — Natural Language 3D Customization Interface.
 *
 * Concepts illustrated:
 * - Natural Language -> Structured Deterministic Action: Translates user styling speech into validated 3D commands.
 * - Single Source of Truth: Modifies the exact same customizationState shared with manual swatches.
 * - Undo Support: Restores previous customization snapshots seamlessly.
 * - Progressive Enhancement: Manual controls and the 3D canvas remain completely operational even if AI fails or rate limits.
 */
export default function AI3DCustomizer({
  productId,
  configuration = null,
  currentCustomization = {},
  onApplyChanges = null,
  onReset = null,
  onUndo = null,
  canUndo = false,
  className = ""
}) {
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'clarification'|'error', text: '', question?: '' }

  if (!configuration || !configuration.enabled || !Array.isArray(configuration.areas)) {
    return null;
  }

  // Generate dynamic prompt suggestion pills based on product's actual configured options
  const suggestions = React.useMemo(() => {
    const list = [];
    const areas = configuration.areas || [];

    if (areas.length > 0 && areas[0].options?.length > 1) {
      const a = areas[0];
      const opt = a.options[1] || a.options[0];
      list.push(`Make ${a.name.toLowerCase()} ${opt.name.toLowerCase()}`);
    }

    if (areas.length > 1 && areas[1].options?.length > 0) {
      const a = areas[1];
      const opt = a.options[a.options.length - 1] || a.options[0];
      list.push(`Change ${a.name.toLowerCase()} to ${opt.name.toLowerCase()}`);
    }

    if (areas.length >= 2) {
      const a1 = areas[0];
      const a2 = areas[1];
      const o1 = a1.options[0];
      const o2 = a2.options[a2.options.length - 1];
      list.push(`${o1.name} ${a1.name.toLowerCase()} with ${o2.name} ${a2.name.toLowerCase()}`);
    }

    list.push("Reset design to default");
    return list.slice(0, 4);
  }, [configuration]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const query = promptText.trim();
    if (!query || loading) return;

    setLoading(true);
    setFeedback(null);

    try {
      const result = await aiCustomizationService.interpretCustomization({
        productId,
        message: query,
        currentCustomization
      });

      if (result.intent === "reset_customization") {
        if (onReset) onReset();
        setFeedback({
          type: "success",
          text: result.message || "Reset to original design specifications."
        });
      } else if (result.intent === "customize_product") {
        if (onApplyChanges && Array.isArray(result.changes)) {
          onApplyChanges(result.changes);
        }
        setFeedback({
          type: "success",
          text: result.message || "Customization applied to 3D model."
        });
      } else if (result.intent === "clarification_needed") {
        setFeedback({
          type: "clarification",
          text: result.message || "Clarification needed.",
          question: result.question || "Could you specify which area you would like to change?"
        });
      }
    } catch (err) {
      console.error("[AI3DCustomizer] Interpretation error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Could not interpret styling command. Please try manual controls or rephrase.";
      setFeedback({
        type: "error",
        text: errMsg
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setPromptText(suggestion);
    // Submit directly on pill click
    setTimeout(() => {
      aiCustomizationService
        .interpretCustomization({
          productId,
          message: suggestion,
          currentCustomization
        })
        .then((result) => {
          if (result.intent === "reset_customization") {
            if (onReset) onReset();
            setFeedback({
              type: "success",
              text: result.message || "Reset to original design specifications."
            });
          } else if (result.intent === "customize_product") {
            if (onApplyChanges && Array.isArray(result.changes)) {
              onApplyChanges(result.changes);
            }
            setFeedback({
              type: "success",
              text: result.message || "Customization applied to 3D model."
            });
          } else if (result.intent === "clarification_needed") {
            setFeedback({
              type: "clarification",
              text: result.message || "Clarification needed.",
              question: result.question || "Could you specify which area you would like to change?"
            });
          }
        })
        .catch((err) => {
          const errMsg = err.response?.data?.message || "Failed to apply styling suggestion.";
          setFeedback({ type: "error", text: errMsg });
        });
    }, 50);
  };

  return (
    <section
      aria-label="AI 3D Product Customizer"
      className={`p-5 rounded-3xl bg-slate-900/80 border border-indigo-500/20 shadow-2xl backdrop-blur-md flex flex-col space-y-4 relative overflow-hidden ${className}`}
    >
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <SparklesIcon className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>AI 3D Customizer</span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Natural Language
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Type what you want to change, and Aethera will update the 3D model.
            </p>
          </div>
        </div>

        {/* Undo Action */}
        {canUndo && (
          <button
            type="button"
            onClick={onUndo}
            title="Undo previous customization"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/60 transition shadow-sm"
          >
            <RotateCcwIcon className="w-3 h-3" />
            <span>Undo</span>
          </button>
        )}
      </div>

      {/* Natural Language Prompt Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            disabled={loading}
            placeholder='e.g. "Make the body black and trim solar gold"'
            className="w-full pl-3.5 pr-28 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading || !promptText.trim()}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Applying...</span>
              </>
            ) : (
              <>
                <span>Apply</span>
                <ArrowRightIcon className="w-3 h-3" />
              </>
            )}
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap gap-1.5 items-center pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
            Try:
          </span>
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={loading}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-200 border border-slate-700/70 hover:border-indigo-500/40 transition disabled:opacity-50"
            >
              ✨ {suggestion}
            </button>
          ))}
        </div>
      </form>

      {/* Live AI Status and Feedback Region */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`p-3 rounded-xl border text-xs transition animate-fadeIn flex flex-col gap-1 ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : feedback.type === "clarification"
              ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
              : "bg-rose-950/40 border-rose-500/40 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold">
              {feedback.type === "success"
                ? "✓ AI Update:"
                : feedback.type === "clarification"
                ? "⚡ Clarification:"
                : "✕ Notice:"}
            </span>
            <span>{feedback.text}</span>
          </div>

          {feedback.question && (
            <p className="mt-1 pl-4 border-l-2 border-amber-400 text-amber-100 font-medium">
              {feedback.question}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
