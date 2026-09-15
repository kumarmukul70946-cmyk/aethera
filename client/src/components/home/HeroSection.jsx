import React, { Suspense, lazy, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  SparklesIcon,
  CubeIcon,
  ShieldCheckIcon
} from "../common/Icons.jsx";

// Lazy-load the heavy 3D Scene chunk so initial page paint is instantaneous
const Hero3DScene = lazy(() => import("./Hero3DScene.jsx"));

/**
 * Utility to verify WebGL support on client hardware.
 */
function isWebGLSupported() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Static Hero Visual Fallback
 * Displayed when WebGL is unsupported, when reduced motion is preferred,
 * or when the 3D asset fails to load.
 */
function HeroStaticVisual() {
  return (
    <div className="relative w-full max-w-[500px] mx-auto aspect-square rounded-3xl bg-gradient-to-tr from-slate-900/90 via-slate-900/60 to-indigo-950/40 border border-slate-800/90 p-8 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl group">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Badges */}
      <div className="flex items-center justify-between z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <SparklesIcon className="w-3.5 h-3.5" />
          <span>Flagship Series</span>
        </span>
        <span className="px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400">
          GEN-4 ARCHITECTURE
        </span>
      </div>

      {/* Center Stylized Product Illustration / Graphic */}
      <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-cyan-500/30 flex items-center justify-center p-1 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-500">
          <div className="w-full h-full rounded-full bg-slate-950/90 flex flex-col items-center justify-center p-4">
            <CubeIcon className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-400" />
            <span className="text-[11px] font-bold text-slate-300 mt-2">
              Aether Sonar ANC
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              3D DIGITAL TWIN
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Feature Badges */}
      <div className="relative z-10 grid grid-cols-3 gap-2 text-center pt-4 border-t border-slate-800/80">
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-xs font-bold text-white block">Lossless</span>
          <span className="text-[10px] text-slate-400">Spatial Audio</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-xs font-bold text-white block">40 Hours</span>
          <span className="text-[10px] text-slate-400">Battery Life</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-xs font-bold text-white block">Adaptive</span>
          <span className="text-[10px] text-slate-400">ANC Isolation</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Fallback loader shown while Hero3DScene chunk is downloading.
 */
function Hero3DLoadingPlaceholder() {
  return (
    <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[520px] max-w-[560px] mx-auto rounded-3xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-center p-6 text-center animate-pulse">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
        <CubeIcon className="w-8 h-8 text-indigo-400" />
      </div>
      <span className="text-sm font-semibold text-slate-200">
        Initializing 3D Viewport...
      </span>
      <span className="text-xs text-slate-500 mt-1">
        Streaming lightweight product model
      </span>
    </div>
  );
}

/**
 * HeroSection
 * Full-width flagship hero with 3D visualization and robust progressive enhancement.
 */
export default function HeroSection() {
  const [canRender3D, setCanRender3D] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasSceneError, setHasSceneError] = useState(false);

  useEffect(() => {
    // 1. Check client reduced-motion accessibility preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);

    const handleMotionChange = (e) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotionChange);

    // 2. Check WebGL availability
    const webglOk = isWebGLSupported();
    setCanRender3D(webglOk);

    return () => motionQuery.removeEventListener("change", handleMotionChange);
  }, []);

  return (
    <section className="relative overflow-hidden pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-12 sm:pb-16 lg:pb-24 border-b border-slate-900/60">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[450px] h-[300px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Semantic Headline, Value Prop & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Value Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase shadow-sm">
              <SparklesIcon className="w-4 h-4" />
              <span>Next-Gen 3D & AI Commerce</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Curated Innovation.{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">
                Experience It in 3D.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Explore flagship electronics, precision audio gear, and wearables with
              interactive digital twins and real-time custom finishes before you buy.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.99]"
              >
                <span>Explore Products</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>

              <Link
                to="/3d-demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm transition border border-slate-800 hover:border-slate-700 hover:scale-[1.02] active:scale-[0.99]"
              >
                <CubeIcon className="w-4 h-4 text-indigo-400" />
                <span>Explore 3D Lab</span>
              </Link>
            </div>

            {/* Assurance Trust Badges */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-left">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Interactive 3D
                </span>
                <span className="text-[11px] text-slate-400">
                  Full 360° Inspection
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">
                  Fast Shipping
                </span>
                <span className="text-[11px] text-slate-400">
                  Direct Tracked Delivery
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">
                  Verified Reviews
                </span>
                <span className="text-[11px] text-slate-400">
                  Real Buyer Feedback
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 3D Scene or Progressive Enhancement Fallback */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5 flex justify-center items-center relative"
          >
            {/* Progressive enhancement check: WebGL supported AND not errored */}
            {canRender3D && !hasSceneError ? (
              <Suspense fallback={<Hero3DLoadingPlaceholder />}>
                <Hero3DScene
                  reducedMotion={reducedMotion}
                  onError={() => setHasSceneError(true)}
                />
              </Suspense>
            ) : (
              <HeroStaticVisual />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
