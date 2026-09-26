import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import fs from "fs";
import path from "path";

/**
 * Service managing media and 3D asset uploads to Cloudinary CDN with
 * a resilient local mock engine for testing and offline environments.
 */
class CloudinaryService {
  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
    this.apiKey = process.env.CLOUDINARY_API_KEY || "";
    this.apiSecret = process.env.CLOUDINARY_API_SECRET || "";

    this.isConfigured = Boolean(
      this.cloudName &&
      this.apiKey &&
      this.apiSecret &&
      this.apiSecret !== "your_api_secret_here" &&
      process.env.NODE_ENV !== "test"
    );

    if (this.isConfigured) {
      cloudinary.config({
        cloud_name: this.cloudName,
        api_key: this.apiKey,
        api_secret: this.apiSecret,
        secure: true
      });
    }

    // Ensure local mock storage directory exists for offline/test environments
    this.localStorageDir = path.resolve("public/uploads");
    if (!fs.existsSync(this.localStorageDir)) {
      try {
        fs.mkdirSync(this.localStorageDir, { recursive: true });
      } catch {
        // Ignore in environments where root fs is restricted
      }
    }
  }

  /**
   * Resolves the canonical Cloudinary folder path based on assetType.
   *
   * @param {string} assetType
   * @returns {string} Cloudinary folder path
   */
  resolveFolder(assetType) {
    switch (assetType) {
      case "MODEL_3D":
        return "aethera/products/models";
      case "PRODUCT_THUMBNAIL":
        return "aethera/products/thumbnails";
      case "PRODUCT_GALLERY":
      case "PRODUCT_IMAGE":
      default:
        return "aethera/products/images";
    }
  }

  /**
   * Generates a safe, non-colliding publicId.
   *
   * @param {string} folder
   * @param {string} prefix
   * @returns {string} Safe publicId
   */
  generatePublicId(folder, prefix = "asset") {
    const randomHex = crypto.randomBytes(8).toString("hex");
    return `${folder}/${prefix}_${Date.now()}_${randomHex}`;
  }

  /**
   * Uploads an asset buffer to Cloudinary or the local mock storage engine.
   *
   * @param {Buffer} buffer - Binary file buffer
   * @param {Object} options
   * @param {string} options.assetType - "PRODUCT_IMAGE" | "PRODUCT_GALLERY" | "PRODUCT_THUMBNAIL" | "MODEL_3D"
   * @param {string} options.format - File extension (e.g. "png", "glb")
   * @param {string} [options.resourceType="image"] - "image" | "raw"
   * @param {string} [options.productId] - Optional product association ID
   * @returns {Promise<{ publicId: string, url: string, secureUrl: string, resourceType: string, format: string, bytes: number, width: number|null, height: number|null }>}
   */
  async uploadAsset(buffer, { assetType, format, resourceType = "image", productId }) {
    const folder = this.resolveFolder(assetType);
    const prefix = productId ? `prod_${productId}` : "asset";
    const publicId = this.generatePublicId(folder, prefix);

    // If Cloudinary is not configured or in test mode, use the local mock engine
    if (!this.isConfigured) {
      return this._mockUpload(buffer, {
        publicId,
        assetType,
        format,
        resourceType
      });
    }

    // Upload to real Cloudinary via streaming
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: path.basename(publicId),
          resource_type: resourceType,
          format: format || undefined,
          use_filename: false,
          unique_filename: true,
          overwrite: false
        },
        (error, result) => {
          if (error) {
            console.error("[CloudinaryService] Upload failed:", error);
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }
          resolve({
            publicId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
            resourceType: result.resource_type,
            format: result.format || format,
            bytes: result.bytes,
            width: result.width || null,
            height: result.height || null
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Deletes an asset from Cloudinary or local storage.
   *
   * @param {string} publicId - Cloudinary publicId
   * @param {string} [resourceType="image"] - "image" | "raw"
   * @returns {Promise<boolean>}
   */
  async deleteAsset(publicId, resourceType = "image") {
    if (!publicId) return true;

    if (!this.isConfigured) {
      return this._mockDelete(publicId);
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true
      });
      return result.result === "ok" || result.result === "not found";
    } catch (error) {
      console.error("[CloudinaryService] Delete failed:", error);
      throw new Error(`Cloudinary deletion failed: ${error.message}`);
    }
  }

  /**
   * Local mock upload engine for test suites and offline development.
   */
  async _mockUpload(buffer, { publicId, format, resourceType }) {
    const filename = `${path.basename(publicId)}.${format}`;
    const filePath = path.join(this.localStorageDir, filename);

    try {
      await fs.promises.writeFile(filePath, buffer);
    } catch {
      // Non-fatal if local directory is read-only in sandbox
    }

    const mockUrl = `/uploads/${filename}`;
    const mockSecureUrl = `https://res.cloudinary.com/aethera-mock/${resourceType}/upload/v1/${publicId}.${format}`;

    return {
      publicId,
      url: mockUrl,
      secureUrl: mockSecureUrl,
      resourceType,
      format,
      bytes: buffer.length,
      width: resourceType === "image" ? 800 : null,
      height: resourceType === "image" ? 800 : null
    };
  }

  /**
   * Local mock delete engine.
   */
  async _mockDelete(publicId) {
    try {
      const files = await fs.promises.readdir(this.localStorageDir);
      const targetPrefix = path.basename(publicId);
      const match = files.find((f) => f.startsWith(targetPrefix));
      if (match) {
        await fs.promises.unlink(path.join(this.localStorageDir, match));
      }
    } catch {
      // Ignore
    }
    return true;
  }
}

export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
