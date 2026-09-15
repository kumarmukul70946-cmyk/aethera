import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import ProductModel from "./ProductModel.jsx";
import ProductLighting from "./ProductLighting.jsx";
import ProductControls from "./ProductControls.jsx";
import ModelLoader from "./ModelLoader.jsx";
import CanvasErrorBoundary from "../utils/CanvasErrorBoundary.jsx";

/**
 * ModelErrorBoundary — In-component fallback when a specific GLB fails to load.
 */
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("[Product3DViewer] Model loading failed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/95 z-20 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-base font-bold text-white mb-1">3D Preview Unavailable</h3>
          <p className="text-xs text-slate-400 max-w-xs mb-4 leading-relaxed">
            The 3D model for this product could not be loaded or is temporarily offline.
          </p>
          {this.props.onBackToImages && (
            <button
              type="button"
              onClick={this.props.onBackToImages}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition shadow-lg shadow-indigo-600/30"
            >
              View Image Gallery
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Product3DViewer — Production-grade interactive 3D product showcase.
 *
 * Capabilities:
 * - Dynamic GLB loading via modelUrl
 * - Bounding box auto-centering & scale normalization
 * - Interactive OrbitControls (rotate, zoom, pan)
 * - Auto-rotation turntable toggle
 * - Fullscreen toggle using browser Fullscreen API
 * - Camera reset without model reloads
 * - Zero-crash graceful fallback for invalid or corrupted GLBs
 */
export default function Product3DViewer({
  modelUrl,
  productName = "Product",
  onBackToImages = null,
  customizationState = null,
  customizationConfig = null,
  className = ""
}) {
  const [autoRotate, setAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const controlsRef = useRef(null);

  // Sync fullscreen state with browser events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed:", err);
    }
  };

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  if (!modelUrl) {
    return (
      <div className="w-full aspect-square rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
        <span className="text-4xl mb-2">🧊</span>
        <h3 className="text-sm font-bold text-white mb-1">No 3D Model Available</h3>
        <p className="text-xs text-slate-400 max-w-xs mb-4">
          This product does not currently have a 3D asset attached.
        </p>
        {onBackToImages && (
          <button
            type="button"
            onClick={onBackToImages}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Return to Photos
          </button>
        )}
      </div>
    );
  }

  return (
    <CanvasErrorBoundary>
      <div
        ref={containerRef}
        className={`relative w-full aspect-square min-h-[380px] sm:min-h-[460px] rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border border-slate-800/80 shadow-2xl overflow-hidden select-none group ${className}`}
      >
        <ModelErrorBoundary onBackToImages={onBackToImages}>
          {/* Top Floating Badge Bar */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800/90 backdrop-blur-md text-[11px] font-bold text-indigo-400 flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                3D Interactive View
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Reset View Button */}
              <button
                type="button"
                onClick={handleResetView}
                title="Reset Camera Angle"
                aria-label="Reset camera angle"
                className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md transition shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>

              {/* Auto-Rotate Toggle Button */}
              <button
                type="button"
                onClick={() => setAutoRotate(!autoRotate)}
                title={autoRotate ? "Pause Turntable" : "Start Auto-Rotate"}
                aria-label={autoRotate ? "Pause turntable rotation" : "Start auto-rotate turntable"}
                className={`p-2 rounded-xl border backdrop-blur-md transition shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  autoRotate
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border-slate-800"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={handleToggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md transition shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {isFullscreen ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Three.js R3F Canvas */}
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{
              fov: 45,
              near: 0.1,
              far: 1000,
              position: [0, 1.2, 3.8]
            }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance"
            }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            <Suspense fallback={<ModelLoader />}>
              {/* 1. Studio Lighting System */}
              <ProductLighting />

              {/* 2. Lightweight Local Environment Reflection Probes */}
              <Environment resolution={256}>
                <group rotation={[-Math.PI / 4, -0.6, 0]}>
                  <Lightformer
                    form="rect"
                    intensity={2.0}
                    position={[0, 4, -6]}
                    scale={[8, 4, 1]}
                    target={[0, 0, 0]}
                  />
                  <Lightformer
                    form="circle"
                    intensity={1.8}
                    position={[6, 2, 0]}
                    scale={3}
                    target={[0, 0, 0]}
                  />
                  <Lightformer
                    form="ring"
                    color="#818cf8"
                    intensity={1.2}
                    position={[-6, 3, 2]}
                    scale={5}
                    target={[0, 0, 0]}
                  />
                </group>
              </Environment>

              {/* 3. Drop Shadow Floor Plane */}
              <mesh
                receiveShadow
                position={[0, -1.25, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[20, 20]} />
                <shadowMaterial opacity={0.35} />
              </mesh>

              {/* 4. Loaded Real GLB Product Model */}
              <ProductModel
                modelUrl={modelUrl}
                customizationState={customizationState}
                customizationConfig={customizationConfig}
              />

              {/* 5. Navigation Orbit Controls */}
              <ProductControls
                ref={controlsRef}
                autoRotate={autoRotate}
                autoRotateSpeed={1.2}
              />
            </Suspense>
          </Canvas>

          {/* Bottom Gesture Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800/90 shadow-xl backdrop-blur-md flex items-center gap-3 text-[10px] text-slate-300">
              <span>
                <strong>Left Drag</strong> Rotate
              </span>
              <span className="text-slate-600">•</span>
              <span>
                <strong>Scroll</strong> Zoom
              </span>
              <span className="text-slate-600">•</span>
              <span>
                <strong>Right Drag</strong> Pan
              </span>
            </div>
          </div>
        </ModelErrorBoundary>
      </div>
    </CanvasErrorBoundary>
  );
}
