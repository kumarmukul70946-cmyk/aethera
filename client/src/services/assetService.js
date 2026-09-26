import api from "./api.js";

/**
 * Service handling admin media and 3D asset management API calls.
 */

/**
 * Uploads a new image or 3D model asset.
 *
 * @param {FormData} formData - Multipart form containing 'file', 'assetType', and optional 'productId'
 * @returns {Promise<Object>} Created asset document
 */
export const uploadAsset = async (formData) => {
  const response = await api.post("/admin/assets", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

/**
 * Retrieves paginated, filtered list of assets.
 *
 * @param {Object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 * @param {string} [params.assetType]
 * @param {string} [params.status]
 * @param {string} [params.search]
 * @param {string} [params.productId]
 * @param {string} [params.sort]
 * @returns {Promise<Object>}
 */
export const getAssets = async (params = {}) => {
  const response = await api.get("/admin/assets", { params });
  return response.data;
};

/**
 * Retrieves metadata for a single asset.
 *
 * @param {string} id - Asset ID
 * @returns {Promise<Object>}
 */
export const getAssetById = async (id) => {
  const response = await api.get(`/admin/assets/${id}`);
  return response.data;
};

/**
 * Replaces an existing asset file with a new upload.
 *
 * @param {string} id - Asset ID
 * @param {FormData} formData - Multipart form containing replacement 'file'
 * @returns {Promise<Object>}
 */
export const replaceAsset = async (id, formData) => {
  const response = await api.patch(`/admin/assets/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

/**
 * Deletes an asset from storage and MongoDB.
 *
 * @param {string} id - Asset ID
 * @returns {Promise<Object>}
 */
export const deleteAsset = async (id) => {
  const response = await api.delete(`/admin/assets/${id}`);
  return response.data;
};

/**
 * Links or updates an asset's connection to a specific Product.
 *
 * @param {string} productId - Product ID
 * @param {Object} data
 * @param {string} data.assetId - Asset ID
 * @param {string} [data.role="gallery"] - "primary" | "gallery"
 * @returns {Promise<Object>}
 */
export const associateProductAsset = async (productId, data) => {
  const response = await api.patch(`/admin/products/${productId}/assets`, data);
  return response.data;
};

export default {
  uploadAsset,
  getAssets,
  getAssetById,
  replaceAsset,
  deleteAsset,
  associateProductAsset
};
