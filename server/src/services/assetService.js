import Asset from "../models/Asset.js";
import Product from "../models/Product.js";
import cloudinaryService from "./cloudinaryService.js";
import { validateUploadedFile } from "../utils/assetValidation.js";

/**
 * Service managing media and 3D asset lifecycle, validation, product association,
 * replacements, and storage cleanup.
 */
class AssetService {
  /**
   * Uploads and registers a new media or 3D asset.
   */
  async uploadAsset({ file, assetType, productId, userId }) {
    // 1. Validate file format, magic bytes, and size boundaries
    const validation = validateUploadedFile(file, assetType);
    if (!validation.isValid) {
      const error = new Error(validation.error);
      error.statusCode = 400;
      throw error;
    }

    // 2. Validate product existence if product association requested
    let productDoc = null;
    if (productId) {
      productDoc = await Product.findById(productId);
      if (!productDoc) {
        const error = new Error("Associated product not found.");
        error.statusCode = 404;
        throw error;
      }
    }

    // 3. Upload to Cloudinary / storage provider
    const uploadResult = await cloudinaryService.uploadAsset(file.buffer, {
      assetType,
      format: validation.format,
      resourceType: validation.resourceType,
      productId: productDoc?._id?.toString()
    });

    // 4. Create Asset document in MongoDB
    const assetDoc = await Asset.create({
      publicId: uploadResult.publicId,
      url: uploadResult.url,
      secureUrl: uploadResult.secureUrl,
      resourceType: uploadResult.resourceType,
      assetType,
      originalName: file.originalname,
      mimeType: file.mimetype,
      format: validation.format,
      size: file.size,
      width: uploadResult.width,
      height: uploadResult.height,
      product: productDoc ? productDoc._id : null,
      folder: cloudinaryService.resolveFolder(assetType),
      status: "ACTIVE",
      uploadedBy: userId,
      metadata: {}
    });

    // 5. Update Product references if associated
    if (productDoc) {
      await this._syncProductAsset(productDoc, assetDoc);
    }

    return assetDoc;
  }

  /**
   * Retrieves paginated, filtered list of assets.
   */
  async getAssets({
    page = 1,
    limit = 20,
    assetType,
    productId,
    status,
    search,
    sort = "-createdAt"
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (assetType && assetType !== "ALL") {
      query.assetType = assetType;
    }

    if (productId) {
      query.product = productId;
    }

    if (status) {
      if (status === "ORPHANED") {
        query.product = null;
        query.status = "ACTIVE";
      } else if (status !== "ALL") {
        query.status = status;
      }
    }

    if (search && search.trim()) {
      query.originalName = { $regex: search.trim(), $options: "i" };
    }

    const [assets, total] = await Promise.all([
      Asset.find(query)
        .populate("product", "name slug price images model3D")
        .populate("uploadedBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Asset.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      assets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasMore: pageNum < totalPages
      }
    };
  }

  /**
   * Retrieves single asset with populated references.
   */
  async getAssetById(id) {
    const asset = await Asset.findById(id)
      .populate("product", "name slug price images model3D")
      .populate("uploadedBy", "name email");

    if (!asset) {
      const error = new Error("Asset not found.");
      error.statusCode = 404;
      throw error;
    }

    return asset;
  }

  /**
   * Replaces an asset's binary file with safe zero-downtime upload-first sequence:
   * 1. Validate new file
   * 2. Upload new asset to storage
   * 3. Update asset record & product reference
   * 4. Delete old asset from storage
   */
  async replaceAsset(id, { file, userId }) {
    const asset = await Asset.findById(id);
    if (!asset) {
      const error = new Error("Asset to replace not found.");
      error.statusCode = 404;
      throw error;
    }

    // 1. Validate new file matches the existing assetType
    const validation = validateUploadedFile(file, asset.assetType);
    if (!validation.isValid) {
      const error = new Error(validation.error);
      error.statusCode = 400;
      throw error;
    }

    const oldPublicId = asset.publicId;
    const oldResourceType = asset.resourceType;
    const oldSecureUrl = asset.secureUrl;

    // 2. Upload new file to Cloudinary first
    const uploadResult = await cloudinaryService.uploadAsset(file.buffer, {
      assetType: asset.assetType,
      format: validation.format,
      resourceType: validation.resourceType,
      productId: asset.product?.toString()
    });

    // 3. Update Asset document
    asset.publicId = uploadResult.publicId;
    asset.url = uploadResult.url;
    asset.secureUrl = uploadResult.secureUrl;
    asset.resourceType = uploadResult.resourceType;
    asset.originalName = file.originalname;
    asset.mimeType = file.mimetype;
    asset.format = validation.format;
    asset.size = file.size;
    asset.width = uploadResult.width;
    asset.height = uploadResult.height;
    asset.uploadedBy = userId;
    await asset.save();

    // 4. Update product references if asset is linked to a product
    if (asset.product) {
      const product = await Product.findById(asset.product);
      if (product) {
        if (asset.assetType === "MODEL_3D") {
          product.model3D = asset._id;
        } else {
          // Replace matching old URL in images array
          const idx = product.images.indexOf(oldSecureUrl);
          if (idx !== -1) {
            product.images[idx] = asset.secureUrl;
          } else if (!product.images.includes(asset.secureUrl)) {
            product.images.push(asset.secureUrl);
          }
        }
        await product.save();
      }
    }

    // 5. Safely clean up old asset from Cloudinary storage
    try {
      await cloudinaryService.deleteAsset(oldPublicId, oldResourceType);
    } catch (cleanupErr) {
      console.warn("[AssetService] Cleanup of old asset failed:", cleanupErr.message);
    }

    return asset;
  }

  /**
   * Deletes an asset, cleans up product associations, and removes binary from Cloudinary.
   */
  async deleteAsset(id) {
    const asset = await Asset.findById(id);
    if (!asset) {
      const error = new Error("Asset not found.");
      error.statusCode = 404;
      throw error;
    }

    // 1. Clean up product references so product is never left with a broken link
    if (asset.product) {
      const product = await Product.findById(asset.product);
      if (product) {
        if (
          product.model3D &&
          (product.model3D.toString() === asset._id.toString() ||
            product.model3D === asset.secureUrl ||
            product.model3D === asset.url)
        ) {
          product.model3D = null;
        }

        product.images = (product.images || []).filter(
          (img) => img !== asset.secureUrl && img !== asset.url
        );

        if (Array.isArray(product.assets)) {
          product.assets = product.assets.filter(
            (aId) => aId.toString() !== asset._id.toString()
          );
        }

        await product.save();
      }
    }

    // 2. Delete binary from Cloudinary CDN
    await cloudinaryService.deleteAsset(asset.publicId, asset.resourceType);

    // 3. Delete metadata from MongoDB
    await Asset.findByIdAndDelete(id);

    return {
      deleted: true,
      id: asset._id
    };
  }

  /**
   * Associates or updates an asset's connection to a Product.
   */
  async associateWithProduct(assetId, { productId, role = "gallery" }) {
    const asset = await Asset.findById(assetId);
    if (!asset) {
      const error = new Error("Asset not found.");
      error.statusCode = 404;
      throw error;
    }

    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found.");
      error.statusCode = 404;
      throw error;
    }

    asset.product = product._id;
    await asset.save();

    await this._syncProductAsset(product, asset, role);

    return {
      asset,
      product
    };
  }

  /**
   * Disassociates an asset from a product (marks asset as ORPHANED for review).
   */
  async disassociateFromProduct(assetId) {
    const asset = await Asset.findById(assetId);
    if (!asset) {
      const error = new Error("Asset not found.");
      error.statusCode = 404;
      throw error;
    }

    if (asset.product) {
      const product = await Product.findById(asset.product);
      if (product) {
        if (product.model3D?.toString() === asset._id.toString()) {
          product.model3D = null;
        }
        product.images = (product.images || []).filter(
          (img) => img !== asset.secureUrl && img !== asset.url
        );
        if (Array.isArray(product.assets)) {
          product.assets = product.assets.filter(
            (aId) => aId.toString() !== asset._id.toString()
          );
        }
        await product.save();
      }
    }

    asset.product = null;
    await asset.save();

    return asset;
  }

  /**
   * Internal helper synchronizing Product model fields with an Asset.
   */
  async _syncProductAsset(product, asset, role = "gallery") {
    if (!Array.isArray(product.assets)) {
      product.assets = [];
    }

    const assetIdStr = asset._id.toString();
    const alreadyLinked = product.assets.some((a) => a.toString() === assetIdStr);
    if (!alreadyLinked) {
      product.assets.push(asset._id);
    }

    if (asset.assetType === "MODEL_3D") {
      product.model3D = asset._id;
    } else {
      if (!Array.isArray(product.images)) {
        product.images = [];
      }

      if (role === "primary" || asset.assetType === "PRODUCT_IMAGE" || asset.assetType === "PRODUCT_THUMBNAIL") {
        // Place as first image if primary
        product.images = [
          asset.secureUrl,
          ...product.images.filter((img) => img !== asset.secureUrl)
        ];
      } else if (!product.images.includes(asset.secureUrl)) {
        product.images.push(asset.secureUrl);
      }
    }

    await product.save();
  }
}

export const assetService = new AssetService();
export default assetService;
