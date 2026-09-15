import React, { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CubeIcon } from "../common/Icons.jsx";

/**
 * Product Image Gallery Component.
 * Supports image cycling, thumbnail selection, fallback handling,
 * and includes a dedicated future container slot for the 3D viewer.
 */
export default function ProductGallery({
  images = [],
  productName = "Product",
  has3DModel = false,
  onOpen3D = null
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Normalize images array (handles strings or objects with .url)
  const normalizedImages = images.map((img) => (typeof img === "string" ? img : img.url));

  const currentImage =
    !imageError && normalizedImages.length > 0
      ? normalizedImages[selectedIndex]
      : null;

  const handlePrev = () => {
    setImageError(false);
    setSelectedIndex((prev) =>
      prev === 0 ? normalizedImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setImageError(false);
    setSelectedIndex((prev) =>
      prev === normalizedImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Main Image Stage */}
      <div className="relative w-full aspect-square bg-slate-900/60 border border-slate-800/80 rounded-3xl overflow-hidden flex items-center justify-center group shadow-xl">
        {currentImage ? (
          <img
            src={currentImage}
            alt={`${productName} view ${selectedIndex + 1}`}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 p-8 text-center">
            <span className="text-5xl mb-2">✨</span>
            <p className="text-sm font-medium text-slate-400">{productName}</p>
            <p className="text-xs text-slate-500">Image preview unavailable</p>
          </div>
        )}

        {/* 3D Model Readiness Badge & Interactive Switcher */}
        {has3DModel && (
          <button
            type="button"
            onClick={onOpen3D || undefined}
            className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg transition group/btn"
          >
            <CubeIcon className="w-4 h-4 text-indigo-200 group-hover/btn:scale-110 transition" />
            <span>Interactive 3D View</span>
          </button>
        )}

        {/* Prev/Next Buttons (only if > 1 image) */}
        {normalizedImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous product image"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md opacity-0 group-hover:opacity-100 transition shadow-lg"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next product image"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md opacity-0 group-hover:opacity-100 transition shadow-lg"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {normalizedImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {normalizedImages.map((imgUrl, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setImageError(false);
                  setSelectedIndex(idx);
                }}
                className={`relative aspect-square rounded-xl overflow-hidden bg-slate-900/60 border p-1 transition ${
                  isSelected
                    ? "border-indigo-500 ring-2 ring-indigo-500/30"
                    : "border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
