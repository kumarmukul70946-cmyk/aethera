import React from "react";
import { Html, useProgress } from "@react-three/drei";

/**
 * ModelLoader — In-canvas loading indicator.
 * Leverages Drei's useProgress hook to display live asset download & parsing progress.
 */
export function ModelLoader() {
  const { progress } = useProgress();

  return (
    <Html center zIndexRange={[100, 0]}>
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/85 border border-slate-800/90 shadow-2xl backdrop-blur-md text-center min-w-[200px]">
        {/* Animated 3D Cube Spinner */}
        <div className="relative w-10 h-10 mb-3">
          <div className="w-full h-full rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 animate-spin">
            <div className="w-full h-full bg-slate-950 rounded-[10px]" />
          </div>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-indigo-400">
            3D
          </span>
        </div>

        <span className="text-xs font-bold text-white tracking-wide mb-1">
          Loading 3D Model
        </span>
        <span className="text-[11px] font-mono text-indigo-400 mb-2.5">
          {progress > 0 ? `${Math.round(progress)}%` : "Initializing..."}
        </span>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>
      </div>
    </Html>
  );
}

export default ModelLoader;
