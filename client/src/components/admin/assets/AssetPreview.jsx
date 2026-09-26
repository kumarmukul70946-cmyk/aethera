import React, { useState } from "react";
import ModelPreview from "./ModelPreview.jsx";

/**
 * Format bytes to readable KB/MB string.
 */
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Full-screen inspection modal for images and 3D assets with rich metadata pane.
 */
export default function AssetPreview({ asset, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!asset) return null;

  const is3D = asset.assetType === "MODEL_3D";

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(asset.secureUrl || asset.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col lg:flex-row bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition border border-white/10"
        >
          ✕
        </button>

        {/* Media Canvas / Preview Area (Left / Top) */}
        <div className="flex-1 min-h-[340px] lg:min-h-[500px] flex items-center justify-center p-6 bg-neutral-950/60 border-b lg:border-b-0 lg:border-r border-white/5 relative overflow-hidden">
          {is3D ? (
            <ModelPreview url={asset.secureUrl || asset.url} className="w-full h-full min-h-[380px]" />
          ) : (
            <div className="relative max-h-full max-w-full flex items-center justify-center">
              <img
                src={asset.secureUrl || asset.url}
                alt={asset.originalName}
                className="max-h-[440px] max-w-full object-contain rounded-xl shadow-lg border border-white/5"
              />
            </div>
          )}
        </div>

        {/* Metadata Inspector (Right Pane) */}
        <div className="w-full lg:w-96 p-6 flex flex-col justify-between overflow-y-auto bg-neutral-900/90 text-neutral-200">
          <div className="space-y-5">
            {/* Header badges */}
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                is3D
                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              }`}>
                {asset.assetType}
              </span>

              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                asset.product
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}>
                {asset.product ? "LINKED" : "ORPHANED"}
              </span>
            </div>

            {/* Filename */}
            <div>
              <h3 className="text-base font-bold text-white break-all">
                {asset.originalName}
              </h3>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                Format: <strong className="text-neutral-300 uppercase">{asset.format}</strong> • {asset.mimeType}
              </p>
            </div>

            {/* Spec grid */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/5 text-xs">
              <div>
                <span className="text-neutral-500 block">File Size</span>
                <span className="font-semibold text-neutral-200 font-mono">
                  {formatFileSize(asset.size)}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Dimensions</span>
                <span className="font-semibold text-neutral-200 font-mono">
                  {asset.width && asset.height ? `${asset.width} × ${asset.height}px` : "N/A (3D)"}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Resource Type</span>
                <span className="font-semibold text-neutral-200 uppercase font-mono">
                  {asset.resourceType}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Uploaded Date</span>
                <span className="font-semibold text-neutral-200 font-mono">
                  {new Date(asset.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Associated Product */}
            <div>
              <span className="text-xs text-neutral-500 block mb-1">Associated Product</span>
              {asset.product ? (
                <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/5 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-neutral-200 truncate">
                      {asset.product.name}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      ₹{asset.product.price?.toLocaleString()}
                    </p>
                  </div>
                  <a
                    href={`/products/${asset.product._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium shrink-0"
                  >
                    View ↗
                  </a>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-neutral-950/40 border border-white/5 text-xs text-neutral-500">
                  Unassociated (Not linked to any product)
                </div>
              )}
            </div>

            {/* Public ID */}
            <div>
              <span className="text-xs text-neutral-500 block mb-1">Public ID / Storage Key</span>
              <p className="text-xs font-mono text-neutral-400 bg-neutral-950/60 p-2 rounded-lg border border-white/5 break-all">
                {asset.publicId}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-6 mt-4 border-t border-white/5 flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition flex items-center justify-center gap-1.5 border border-white/10"
            >
              {copied ? "✓ Copied CDN URL" : "Copy Secure URL"}
            </button>

            <a
              href={asset.secureUrl || asset.url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shrink-0"
            >
              Open File ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
