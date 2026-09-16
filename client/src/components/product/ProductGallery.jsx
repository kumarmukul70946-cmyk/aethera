import React, { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CubeIcon } from "../common/Icons.jsx";

/**
 * Product Image Gallery Component — Warm-light Japandi style.
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
      <div className="relative w-full aspect-square bg-white border border-neutral-200/80 rounded-3xl overflow-hidden flex items-center justify-center group shadow-xs">
        {currentImage ? (
          <img
            src={currentImage}
            alt={`${productName} view ${selectedIndex + 1}`}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain p-6 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-400 p-8 text-center">
            <span className="text-5xl mb-2">✨</span>
            <p className="text-sm font-semibold text-neutral-700">{productName}</p>
            <p className="text-xs text-neutral-400">Image preview unavailable</p>
          </div>
        )}

        {/* 3D Model Readiness Badge & Interactive Switcher */}
        {has3DModel && (
          <button
            type="button"
            onClick={onOpen3D || undefined}
            className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition group/btn"
          >
            <CubeIcon className="w-4 h-4 text-neutral-300 group-hover/btn:scale-110 transition" />
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
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-800 border border-neutral-200 backdrop-blur-md opacity-0 group-hover:opacity-100 transition shadow-md flex items-center justify-center"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next product image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-800 border border-neutral-200 backdrop-blur-md opacity-0 group-hover:opacity-100 transition shadow-md flex items-center justify-center"
            >
              <ChevronRightIcon className="w-4 h-4" />
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
                className={`aspect-square rounded-2xl overflow-hidden bg-white border p-1 transition shadow-xs ${
                  isSelected
                    ? "border-neutral-900 ring-1 ring-neutral-900 scale-105"
                    : "border-neutral-200/80 hover:border-neutral-400 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
