import React, { useRef } from "react";

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Individual asset card for the media and 3D asset manager grid.
 */
export default function AssetCard({ asset, onPreview, onReplace, onDelete }) {
  const fileInputRef = useRef(null);
  const is3D = asset.assetType === "MODEL_3D";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onReplace) {
      onReplace(asset, file);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-neutral-900/60 border border-white/5 hover:border-indigo-500/40 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 overflow-hidden">
      {/* Hidden file input for Replace action */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={is3D ? ".glb,.gltf" : "image/*"}
      />

      <div>
        {/* Thumbnail / 3D Showcase Area */}
        <div
          onClick={() => onPreview(asset)}
          className="relative h-44 w-full bg-neutral-950/80 flex items-center justify-center overflow-hidden cursor-pointer border-b border-white/5"
        >
          {is3D ? (
            <div className="flex flex-col items-center justify-center p-4 text-center group-hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 border border-purple-500/40 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20 mb-2">
                📦
              </div>
              <span className="text-xs font-bold tracking-wider text-neutral-300 uppercase font-mono">
                3D Model ({asset.format})
              </span>
              <span className="text-[11px] text-indigo-400 mt-1 flex items-center gap-1">
                <span>Click to Interact</span> ↗
              </span>
            </div>
          ) : (
            <img
              src={asset.secureUrl || asset.url}
              alt={asset.originalName}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}

          {/* Top badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md ${
                is3D
                  ? "bg-purple-900/80 text-purple-300 border-purple-500/30"
                  : "bg-indigo-900/80 text-indigo-300 border-indigo-500/30"
              }`}
            >
              {asset.assetType.replace("PRODUCT_", "")}
            </span>

            <span className="px-1.5 py-0.5 rounded bg-black/70 text-neutral-300 font-mono text-[10px] border border-white/10 uppercase">
              {asset.format}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-2">
          {/* Filename */}
          <h4
            onClick={() => onPreview(asset)}
            className="text-xs font-bold text-neutral-200 group-hover:text-white truncate cursor-pointer transition-colors"
            title={asset.originalName}
          >
            {asset.originalName}
          </h4>

          {/* Details Pill Row */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span>{formatFileSize(asset.size)}</span>
            <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Associated Product Pill */}
          <div className="pt-1">
            {asset.product ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 max-w-full truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate">{asset.product.name}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-400 border border-white/5">
                Unlinked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 pt-0 border-t border-white/5 grid grid-cols-3 gap-1.5 mt-2">
        <button
          type="button"
          onClick={() => onPreview(asset)}
          className="py-1.5 rounded-lg text-[11px] font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition text-center"
        >
          Preview
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="py-1.5 rounded-lg text-[11px] font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition text-center"
          title="Upload new file to replace binary"
        >
          Replace
        </button>

        <button
          type="button"
          onClick={() => onDelete(asset)}
          className="py-1.5 rounded-lg text-[11px] font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition text-center"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
