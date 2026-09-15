import React from "react";
import ColorPicker from "./ColorPicker.jsx";
import { SparklesIcon, RotateCcwIcon } from "../common/Icons.jsx";
import { formatCustomizationSummary } from "../../three/customization/customizationTypes.js";

/**
 * CustomizationPanel — Live 3D Product Customizer Controller.
 *
 * Concepts illustrated:
 * - Configuration-Driven UI: Renders customizable areas based on product.customization metadata.
 * - Reactive State Binding: Dispatches updates to the 3D model engine without reloading the GLB.
 * - Non-Destructive Reset: Restores original materials with a single click.
 */
export default function CustomizationPanel({
  configuration = null,
  customizationState = {},
  onChange = null,
  onReset = null,
  className = ""
}) {
  if (!configuration || !configuration.enabled || !Array.isArray(configuration.areas)) {
    return null;
  }

  const summary = formatCustomizationSummary(customizationState, configuration);

  return (
    <div
      className={`p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-md flex flex-col space-y-5 ${className}`}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <SparklesIcon className="w-3.5 h-3.5 text-indigo-400" />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              3D Customizer
            </h2>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              Live Real-Time Material Tuning
            </span>
          </div>
        </div>

        {/* Reset Customization Button */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            title="Reset to original design"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-800 border border-slate-800 transition"
          >
            <RotateCcwIcon className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Configurable Areas */}
      <div className="space-y-4">
        {configuration.areas.map((area) => (
          <ColorPicker
            key={area.id}
            areaName={area.name}
            options={area.options || []}
            selectedOptionId={customizationState[area.id]?.id}
            onSelect={(selectedOption) => onChange && onChange(area.id, selectedOption)}
          />
        ))}
      </div>

      {/* Active Customization Summary Badge */}
      {summary.length > 0 && (
        <div className="pt-3 border-t border-slate-800/80">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
            Configured Specifications:
          </span>
          <div className="flex flex-wrap gap-2">
            {summary.map((item) => (
              <span
                key={item.areaId}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300"
              >
                <span
                  style={{ backgroundColor: item.color }}
                  className="w-2.5 h-2.5 rounded-full border border-black/30 shrink-0"
                />
                <span className="text-slate-400 font-medium">{item.areaName}:</span>
                <strong className="text-white">{item.optionName}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
