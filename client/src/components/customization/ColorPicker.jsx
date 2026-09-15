import React from "react";

/**
 * ColorPicker — Accessible color and material swatch selector.
 *
 * Accessibility:
 * - Proper ARIA radio group semantics
 * - Keyboard navigation (Tab + Enter/Space)
 * - Explicit text labels alongside visual color swatches
 */
export default function ColorPicker({
  areaName = "Area",
  options = [],
  selectedOptionId = null,
  onSelect = null
}) {
  if (!options || options.length === 0) return null;

  const currentOption =
    options.find((opt) => opt.id === selectedOptionId) || options[0];

  return (
    <div className="space-y-2.5">
      {/* Area Label & Active Value */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-200">{areaName}</span>
        <span className="text-indigo-400 font-medium tracking-wide">
          {currentOption?.name || ""}
        </span>
      </div>

      {/* Swatches Grid */}
      <div
        role="radiogroup"
        aria-label={`${areaName} options`}
        className="flex flex-wrap gap-2.5"
      >
        {options.map((opt) => {
          const isSelected = opt.id === (selectedOptionId || currentOption?.id);
          const colorHex = opt.color || opt.value || "#6366f1";

          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${areaName}: ${opt.name}`}
              onClick={() => onSelect && onSelect(opt)}
              className={`group relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all ${
                isSelected
                  ? "bg-indigo-600/15 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
              }`}
            >
              {/* Color Swatch Circle with Ring Indicator */}
              <span
                style={{ backgroundColor: colorHex }}
                className={`w-4 h-4 rounded-full border border-black/30 shadow-inner shrink-0 transition-transform ${
                  isSelected ? "scale-110 ring-2 ring-white/80 ring-offset-1 ring-offset-slate-950" : "group-hover:scale-105"
                }`}
              />

              {/* Text Label */}
              <span className="text-[11px] font-medium tracking-tight">
                {opt.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
