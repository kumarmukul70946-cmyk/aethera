import {
  generateProductEmbedding,
  generateProductEmbeddingsBatch
} from "../services/productEmbeddingService.js";

/**
 * Trigger bulk embedding generation across product catalog (Admin only).
 * Operates in bounded batches and skips unchanged products via content hashing.
 *
 * @route POST /api/admin/products/generate-embeddings
 * @access Protected (Admin only)
 */
export const generateBatchEmbeddings = async (req, res, next) => {
  try {
    const { batchSize, force, limit } = req.body || {};

    const summary = await generateProductEmbeddingsBatch({
      batchSize: batchSize !== undefined ? parseInt(batchSize, 10) : 20,
      force: Boolean(force),
      limit: limit !== undefined ? parseInt(limit, 10) : null
    });

    res.status(200).json({
      success: true,
      message: "Product embeddings batch processing completed",
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger single product embedding generation (Admin only).
 *
 * @route POST /api/admin/products/:id/generate-embedding
 * @access Protected (Admin only)
 */
export const generateSingleEmbedding = async (req, res, next) => {
  try {
    const { force } = req.body || {};
    const result = await generateProductEmbedding(req.params.id, {
      force: Boolean(force)
    });

    res.status(200).json({
      success: true,
      message: result.updated
        ? "Product embedding generated successfully"
        : "Product embedding skipped (source content unchanged)",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export default {
  generateBatchEmbeddings,
  generateSingleEmbedding
};
