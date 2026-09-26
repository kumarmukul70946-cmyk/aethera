import React, { useState, useEffect, useRef } from "react";
import { uploadAsset } from "../../../services/assetService.js";
import { productService } from "../../../services/productService.js";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_MODEL_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
const ALLOWED_MODEL_EXTENSIONS = ["glb", "gltf"];

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Modern drag-and-drop asset uploader with real-time validation,
 * upload progress simulation, product association, and asset type detection.
 */
export default function AssetUploader({ onUploadSuccess }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [assetType, setAssetType] = useState("PRODUCT_IMAGE");
  const [productId, setProductId] = useState("");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [validationError, setValidationError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Fetch product list for association dropdown
  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      setProductsLoading(true);
      try {
        const data = await productService.getProducts({ limit: 100 });
        if (isMounted && data?.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to load products for asset association:", err);
      } finally {
        if (isMounted) setProductsLoading(false);
      }
    }
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const validateSelectedFile = (selectedFile, type = assetType) => {
    setValidationError("");
    if (!selectedFile) return false;

    const parts = selectedFile.name.split(".");
    const ext = parts.length > 1 ? parts.pop().toLowerCase() : "";

    const is3D = type === "MODEL_3D" || ALLOWED_MODEL_EXTENSIONS.includes(ext);

    if (is3D) {
      if (!ALLOWED_MODEL_EXTENSIONS.includes(ext)) {
        setValidationError(`Invalid 3D model format (.${ext}). Only .glb and .gltf files are supported.`);
        return false;
      }
      if (selectedFile.size > MAX_MODEL_SIZE) {
        setValidationError(`3D model file size (${formatBytes(selectedFile.size)}) exceeds the maximum 50 MB limit.`);
        return false;
      }
    } else {
      if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
        setValidationError(`Invalid image format (.${ext}). Supported formats: JPEG, PNG, WebP, AVIF.`);
        return false;
      }
      if (selectedFile.size > MAX_IMAGE_SIZE) {
        setValidationError(`Image file size (${formatBytes(selectedFile.size)}) exceeds the maximum 5 MB limit.`);
        return false;
      }
    }

    return true;
  };

  const handleFile = (newFile) => {
    if (!newFile) return;

    const ext = newFile.name.split(".").pop().toLowerCase();
    let detectedType = assetType;

    // Auto-detect 3D model vs Image
    if (ALLOWED_MODEL_EXTENSIONS.includes(ext)) {
      detectedType = "MODEL_3D";
      setAssetType("MODEL_3D");
    } else if (ALLOWED_IMAGE_EXTENSIONS.includes(ext) && assetType === "MODEL_3D") {
      detectedType = "PRODUCT_IMAGE";
      setAssetType("PRODUCT_IMAGE");
    }

    setFile(newFile);
    setUploadSuccess(null);
    setUploadError("");
    validateSelectedFile(newFile, detectedType);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleTypeChange = (newType) => {
    setAssetType(newType);
    if (file) {
      validateSelectedFile(file, newType);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    if (!validateSelectedFile(file, assetType)) {
      return;
    }

    setUploading(true);
    setUploadProgress(15);
    setUploadError("");
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("assetType", assetType);
    if (productId) {
      formData.append("productId", productId);
    }

    // Simulate steady progress while streaming upload
    const progressTimer = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 200);

    try {
      const res = await uploadAsset(formData);
      clearInterval(progressTimer);
      setUploadProgress(100);

      if (res.success) {
        setUploadSuccess(res.data);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (onUploadSuccess) {
          onUploadSuccess(res.data);
        }
      } else {
        setUploadError(res.message || "Asset upload failed.");
      }
    } catch (err) {
      clearInterval(progressTimer);
      setUploadProgress(0);
      setUploadError(
        err.response?.data?.message || err.message || "Failed to upload asset to media storage."
      );
    } finally {
      setUploading(false);
    }
  };

  const resetSelection = () => {
    setFile(null);
    setValidationError("");
    setUploadError("");
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="rounded-3xl bg-neutral-900/60 border border-white/5 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>⚡</span> Direct Media & 3D Pipeline
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Zero binary database footprint. Assets stream directly to Cloudinary with server signature checks.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-neutral-400 bg-neutral-950/80 px-3 py-1.5 rounded-xl border border-white/5">
          <span>Max Image: <strong className="text-indigo-400">5 MB</strong></span>
          <span>•</span>
          <span>Max 3D: <strong className="text-purple-400">50 MB (GLB)</strong></span>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        {/* Drag & Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
            dragOver
              ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
              : file
              ? "border-emerald-500/50 bg-emerald-950/20"
              : "border-white/10 hover:border-indigo-500/40 bg-neutral-950/50 hover:bg-neutral-950/70"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFile(e.target.files?.[0])}
            accept=".jpg,.jpeg,.png,.webp,.avif,.glb,.gltf"
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/10">
                {file.name.endsWith(".glb") || file.name.endsWith(".gltf") ? "📦" : "🖼️"}
              </div>
              <div>
                <p className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                  {file.name}
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 mt-1">
                  <span className="font-mono">{formatBytes(file.size)}</span>
                  <span>•</span>
                  <span className="uppercase font-semibold text-emerald-400">Ready to upload</span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetSelection();
                }}
                className="text-xs text-neutral-400 hover:text-rose-400 transition underline pt-1"
              >
                Change selected file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-white/5 flex items-center justify-center text-xl text-neutral-300">
                📥
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-200">
                  Drag & drop your product image or 3D GLB model here
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  or click to browse your computer
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {["GLB (3D)", "PNG", "JPEG", "WEBP", "AVIF"].map((fmt) => (
                  <span
                    key={fmt}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-neutral-800/60 text-neutral-400 border border-white/5"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Configuration Row: Asset Type & Product Association */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Asset Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Asset Type <span className="text-rose-400">*</span>
            </label>
            <select
              value={assetType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="PRODUCT_IMAGE">Primary Image (PRODUCT_IMAGE)</option>
              <option value="PRODUCT_GALLERY">Gallery Image (PRODUCT_GALLERY)</option>
              <option value="PRODUCT_THUMBNAIL">Thumbnail (PRODUCT_THUMBNAIL)</option>
              <option value="MODEL_3D">3D Interactive Model (MODEL_3D / GLB)</option>
            </select>
          </div>

          {/* Product Association Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Associate with Product <span className="text-neutral-500">(Optional)</span>
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
              disabled={productsLoading}
            >
              <option value="">-- No Association (Unlinked Asset) --</option>
              {products.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name} ({p.category || "General"})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Client-Side Validation Error */}
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-start gap-2">
            <span className="shrink-0">⚠️</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* Server Upload Error */}
        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center justify-between gap-2">
            <div className="flex items-start gap-2">
              <span className="shrink-0">❌</span>
              <span>{uploadError}</span>
            </div>
            <button
              type="button"
              onClick={handleUpload}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Upload Success Alert */}
        {uploadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>
                Successfully uploaded <strong>{uploadSuccess.originalName}</strong> (
                {uploadSuccess.format}) to media CDN!
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-500 uppercase">
              {uploadSuccess.status}
            </span>
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                Streaming to Cloudinary Storage...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit & Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {file && (
            <button
              type="button"
              onClick={resetSelection}
              disabled={uploading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white transition disabled:opacity-50"
            >
              Clear
            </button>
          )}

          <button
            type="submit"
            disabled={!file || !!validationError || uploading}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {uploading ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Uploading Asset...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Upload & Store Asset</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
