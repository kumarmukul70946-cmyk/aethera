import React from "react";

/**
 * Modal dialog for confirming asset deletion with product dependency warnings.
 */
export default function AssetDeleteDialog({ asset, isOpen, onConfirm, onCancel, deleting }) {
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md p-6 bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center text-lg shrink-0">
            🗑️
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Delete Asset</h3>
            <p className="text-xs text-neutral-400">This action cannot be undone.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-white/5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-neutral-300">
            <span className="text-neutral-500">Filename:</span>
            <span className="font-semibold truncate max-w-[200px]">{asset.originalName}</span>
          </div>
          <div className="flex items-center justify-between text-neutral-300">
            <span className="text-neutral-500">Asset Type:</span>
            <span className="font-mono">{asset.assetType}</span>
          </div>

          {asset.product ? (
            <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
              ⚠️ <strong>Warning:</strong> This asset is linked to product{" "}
              <strong>"{asset.product.name}"</strong>. Deleting will safely clean up the product reference without breaking the product catalog.
            </div>
          ) : (
            <div className="mt-1 text-[11px] text-neutral-400">
              ✓ This asset is orphaned and not linked to any product.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1.5 shadow-sm shadow-rose-600/30"
          >
            {deleting ? "Deleting..." : "Delete Asset"}
          </button>
        </div>
      </div>
    </div>
  );
}
