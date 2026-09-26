import assetService from "../services/assetService.js";

/**
 * Controller handling Media and 3D Asset management endpoints.
 */

/**
 * POST /api/admin/assets
 * Uploads an image or 3D GLB model and creates asset metadata.
 */
export const uploadAsset = async (req, res, next) => {
  try {
    const { assetType, productId } = req.body;
    const file = req.file;

    const asset = await assetService.uploadAsset({
      file,
      assetType,
      productId: productId || null,
      userId: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "Asset uploaded and registered successfully.",
      data: asset
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/assets
 * Retrieves paginated, filtered list of assets.
 */
export const getAssets = async (req, res, next) => {
  try {
    const result = await assetService.getAssets(req.query);

    return res.status(200).json({
      success: true,
      data: result.assets,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/assets/:id
 * Retrieves metadata for a single asset.
 */
export const getAssetById = async (req, res, next) => {
  try {
    const asset = await assetService.getAssetById(req.params.id);

    return res.status(200).json({
      success: true,
      data: asset
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/assets/:id
 * Replaces an existing asset file (upload-first safe sequence) or updates metadata.
 */
export const replaceAsset = async (req, res, next) => {
  try {
    const assetId = req.params.id;

    if (req.file) {
      const updatedAsset = await assetService.replaceAsset(assetId, {
        file: req.file,
        userId: req.user._id
      });

      return res.status(200).json({
        success: true,
        message: "Asset replaced successfully.",
        data: updatedAsset
      });
    }

    return res.status(400).json({
      success: false,
      message: "No replacement file provided."
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/assets/:id
 * Removes asset from Cloudinary and cleans up MongoDB metadata & product associations.
 */
export const deleteAsset = async (req, res, next) => {
  try {
    const result = await assetService.deleteAsset(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Asset deleted and disassociated successfully.",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/products/:productId/assets
 * Associates or links an asset to a specific Product.
 */
export const associateProductAssets = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { assetId, role = "gallery" } = req.body;

    if (!assetId) {
      return res.status(400).json({
        success: false,
        message: "assetId is required for product association."
      });
    }

    const result = await assetService.associateWithProduct(assetId, {
      productId,
      role
    });

    return res.status(200).json({
      success: true,
      message: "Asset linked to product successfully.",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export default {
  uploadAsset,
  getAssets,
  getAssetById,
  replaceAsset,
  deleteAsset,
  associateProductAssets
};
