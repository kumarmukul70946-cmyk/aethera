import React, { useState, useEffect, useCallback } from "react";
import AssetUploader from "../../components/admin/assets/AssetUploader.jsx";
import AssetFilters from "../../components/admin/assets/AssetFilters.jsx";
import AssetGrid from "../../components/admin/assets/AssetGrid.jsx";
import AssetPreview from "../../components/admin/assets/AssetPreview.jsx";
import AssetDeleteDialog from "../../components/admin/assets/AssetDeleteDialog.jsx";
import { getAssets, replaceAsset, deleteAsset } from "../../services/assetService.js";

/**
 * Admin Media & 3D Asset Management Workspace.
 * Provides complete lifecycle management for e-commerce media,
 * including 3D GLB model validation, replacement, preview, and Cloudinary CDN coordination.
 */
export default function AdminAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  // Filters state
  const [search, setSearch] = useState("");
  const [assetType, setAssetType] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("-createdAt");

  // Interactive states
  const [previewAsset, setPreviewAsset] = useState(null);
  const [deleteTargetAsset, setDeleteTargetAsset] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotification, setActionNotification] = useState(null);

  // Quick stats summary
  const [stats, setStats] = useState({ total: 0, models: 0, images: 0, orphaned: 0 });

  const showNotification = (type, message) => {
    setActionNotification({ type, message });
    setTimeout(() => {
      setActionNotification(null);
    }, 4500);
  };

  const fetchAssetsList = useCallback(async (pageToLoad = 1) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        page: pageToLoad,
        limit: 12,
        sort
      };
      if (search.trim()) queryParams.search = search.trim();
      if (assetType) queryParams.assetType = assetType;
      if (status) queryParams.status = status;

      const res = await getAssets(queryParams);
      if (res.success) {
        setAssets(res.data.assets || []);
        setPagination(res.data.pagination || { page: pageToLoad, limit: 12, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load assets.");
    } finally {
      setLoading(false);
    }
  }, [search, assetType, status, sort]);

  // Load summary stats
  const fetchSummaryStats = useCallback(async () => {
    try {
      // Parallel fetch for quick KPI counts
      const [allRes, modelRes, imageRes, orphanRes] = await Promise.all([
        getAssets({ limit: 1 }),
        getAssets({ assetType: "MODEL_3D", limit: 1 }),
        getAssets({ assetType: "PRODUCT_IMAGE", limit: 1 }),
        getAssets({ status: "ORPHANED", limit: 1 })
      ]);

      setStats({
        total: allRes?.data?.pagination?.total || 0,
        models: modelRes?.data?.pagination?.total || 0,
        images: imageRes?.data?.pagination?.total || 0,
        orphaned: orphanRes?.data?.pagination?.total || 0
      });
    } catch {
      // Non-blocking for summary stats
    }
  }, []);

  useEffect(() => {
    fetchAssetsList(1);
    fetchSummaryStats();
  }, [fetchAssetsList, fetchSummaryStats]);

  const handlePageChange = (newPage) => {
    fetchAssetsList(newPage);
  };

  const handleResetFilters = () => {
    setSearch("");
    setAssetType("");
    setStatus("");
    setSort("-createdAt");
  };

  const handleUploadSuccess = (newAsset) => {
    showNotification("success", `Successfully uploaded "${newAsset.originalName}" to Cloudinary.`);
    fetchAssetsList(1);
    fetchSummaryStats();
  };

  // Safe Asset Replacement Flow: uploads new binary first, updates reference, then archives old
  const handleReplaceInitiated = async (assetToReplace, newFile) => {
    if (!newFile) return;

    try {
      showNotification("info", `Replacing "${assetToReplace.originalName}" with "${newFile.name}"...`);
      const formData = new FormData();
      formData.append("file", newFile);

      const res = await replaceAsset(assetToReplace._id, formData);
      if (res.success) {
        showNotification(
          "success",
          `Safely replaced "${assetToReplace.originalName}". Updated product references and purged old media.`
        );
        fetchAssetsList(pagination.page);
        fetchSummaryStats();
      } else {
        showNotification("error", res.message || "Asset replacement failed.");
      }
    } catch (err) {
      showNotification(
        "error",
        err.response?.data?.message || err.message || "Asset replacement failed."
      );
    }
  };

  // Deletion Flow
  const handleDeleteInitiated = (asset) => {
    setDeleteTargetAsset(asset);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetAsset) return;

    setIsDeleting(true);
    try {
      const res = await deleteAsset(deleteTargetAsset._id);
      if (res.success) {
        showNotification(
          "success",
          `Asset "${deleteTargetAsset.originalName}" deleted from storage and references removed.`
        );
        setDeleteTargetAsset(null);
        if (previewAsset?._id === deleteTargetAsset._id) {
          setPreviewAsset(null);
        }
        fetchAssetsList(pagination.page);
        fetchSummaryStats();
      } else {
        showNotification("error", res.message || "Asset deletion failed.");
      }
    } catch (err) {
      showNotification(
        "error",
        err.response?.data?.message || err.message || "Asset deletion failed."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Toast Notification Banner */}
      {actionNotification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-top-3 ${
            actionNotification.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
              : actionNotification.type === "error"
              ? "bg-rose-950/90 border-rose-500/30 text-rose-300"
              : "bg-indigo-950/90 border-indigo-500/30 text-indigo-300"
          }`}
        >
          <span>
            {actionNotification.type === "success"
              ? "✅"
              : actionNotification.type === "error"
              ? "❌"
              : "ℹ️"}
          </span>
          <p className="text-xs font-semibold">{actionNotification.message}</p>
        </div>
      )}

      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Media & 3D Assets Engine
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Asset Management & Cloudinary CDN
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Store metadata in MongoDB, stream binaries to Cloudinary, and manage 3D GLB interactive models.
          </p>
        </div>

        {/* Quick KPI Stat Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-xl bg-neutral-900/80 border border-white/5 text-xs flex items-center gap-2">
            <span className="text-neutral-400">Total Assets:</span>
            <strong className="text-white font-mono">{stats.total}</strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs flex items-center gap-2">
            <span className="text-purple-300">3D Models:</span>
            <strong className="text-purple-400 font-mono">{stats.models}</strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs flex items-center gap-2">
            <span className="text-indigo-300">Images:</span>
            <strong className="text-indigo-400 font-mono">{stats.images}</strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-amber-950/40 border border-amber-500/20 text-xs flex items-center gap-2">
            <span className="text-amber-300">Orphaned:</span>
            <strong className="text-amber-400 font-mono">{stats.orphaned}</strong>
          </div>
        </div>
      </div>

      {/* SECTION 1: Direct Media Upload Pipeline */}
      <AssetUploader onUploadSuccess={handleUploadSuccess} />

      {/* SECTION 2: Filter, Search, and Sort Controls */}
      <div className="space-y-4">
        <AssetFilters
          search={search}
          onSearchChange={setSearch}
          assetType={assetType}
          onAssetTypeChange={setAssetType}
          status={status}
          onStatusChange={setStatus}
          sort={sort}
          onSortChange={setSort}
          onReset={handleResetFilters}
        />

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchAssetsList(pagination.page)}
              className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* SECTION 3: Asset Grid & Pagination */}
        <AssetGrid
          assets={assets}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPreview={(asset) => setPreviewAsset(asset)}
          onReplace={handleReplaceInitiated}
          onDelete={handleDeleteInitiated}
        />
      </div>

      {/* Full Preview Modal */}
      <AssetPreview
        asset={previewAsset}
        onClose={() => setPreviewAsset(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AssetDeleteDialog
        asset={deleteTargetAsset}
        isOpen={!!deleteTargetAsset}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetAsset(null)}
        deleting={isDeleting}
      />
    </div>
  );
}
