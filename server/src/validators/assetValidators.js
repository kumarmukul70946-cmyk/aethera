import { VALID_ASSET_TYPES } from "../utils/assetValidation.js";

/**
 * Validates multipart asset upload request parameters.
 */
export function validateAssetUpload(req, res, next) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file provided. Please upload a file."
    });
  }

  const { assetType } = req.body;
  if (!assetType || !VALID_ASSET_TYPES.includes(assetType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid or missing assetType. Allowed values: ${VALID_ASSET_TYPES.join(", ")}.`
    });
  }

  next();
}

/**
 * Validates asset replacement request.
 */
export function validateAssetReplacement(req, res, next) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Replacement file is required."
    });
  }

  next();
}

/**
 * Validates product association parameters.
 */
export function validateProductAssociation(req, res, next) {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Target productId is required for asset association."
    });
  }

  next();
}

export default {
  validateAssetUpload,
  validateAssetReplacement,
  validateProductAssociation
};
