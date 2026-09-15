import mongoose from "mongoose";
import { Product, Category } from "../models/index.js";
import { buildProductEmbeddingText, computeEmbeddingHash } from "../utils/embeddingTextBuilder.js";
import { generateEmbedding, getEmbeddingConfig } from "./embeddingService.js";

/**
 * Generates and persists a high-dimensional semantic vector embedding for a single product.
 * Enforces SHA-256 content hashing to avoid redundant external API calls and compute costs.
 *
 * @param {string|mongoose.Types.ObjectId} productId
 * @param {Object} [options]
 * @param {boolean} [options.force=false] - If true, regenerates even if hash is unchanged
 * @returns {Promise<Object>} Sanitized execution result
 */
export const generateProductEmbedding = async (productId, options = {}) => {
  const { force = false } = options;

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    const error = new Error("Invalid product ID format.");
    error.statusCode = 400;
    throw error;
  }

  // 1. Load product including hidden vector and hash fields
  const product = await Product.findById(productId)
    .select("+embedding +embeddingSourceHash")
    .populate("category", "name slug");

  if (!product) {
    const error = new Error(`Product with ID '${productId}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  // 2. Build canonical, deterministic embedding source text
  const sourceText = buildProductEmbeddingText(product);
  const currentHash = computeEmbeddingHash(sourceText);

  // 3. Content change detection: Skip external API call if content has not changed
  const hasExistingVector = Array.isArray(product.embedding) && product.embedding.length > 0;
  if (!force && hasExistingVector && product.embeddingSourceHash === currentHash) {
    return {
      success: true,
      updated: false,
      reason: "unchanged",
      productId: product._id.toString()
    };
  }

  // 4. Generate high-dimensional vector from embedding provider
  const vector = await generateEmbedding(sourceText);

  // 5. Atomic persistence: Update vector and hash without exposing vector in memory
  await Product.findByIdAndUpdate(product._id, {
    $set: {
      embedding: vector,
      embeddingSourceHash: currentHash
    }
  });

  return {
    success: true,
    updated: true,
    productId: product._id.toString(),
    dimensions: vector.length
  };
};

/**
 * Batch processes product catalog to generate or update vector embeddings.
 * Operates in bounded chunks with rate-limit pauses to safeguard external API quotas.
 *
 * @param {Object} [options]
 * @param {number} [options.batchSize=20] - Number of products per batch (1-100)
 * @param {boolean} [options.force=false] - Force regeneration of existing embeddings
 * @param {number} [options.limit] - Optional upper cap on total products to process
 * @returns {Promise<Object>} Summary counts: { total, updated, skipped, failed, errors }
 */
export const generateProductEmbeddingsBatch = async (options = {}) => {
  const { batchSize = 20, force = false, limit = null } = options;

  const safeBatchSize = Math.min(100, Math.max(1, parseInt(batchSize, 10) || 20));
  const query = {};

  const totalCandidates = await Product.countDocuments(query);
  const maxToProcess = limit ? Math.min(totalCandidates, parseInt(limit, 10)) : totalCandidates;

  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];

  let skip = 0;

  while (processed < maxToProcess) {
    const currentLimit = Math.min(safeBatchSize, maxToProcess - processed);

    const products = await Product.find(query)
      .select("+embedding +embeddingSourceHash")
      .populate("category", "name slug")
      .skip(skip)
      .limit(currentLimit);

    if (!products || products.length === 0) break;

    for (const product of products) {
      processed++;
      try {
        const sourceText = buildProductEmbeddingText(product);
        const currentHash = computeEmbeddingHash(sourceText);

        const hasExistingVector = Array.isArray(product.embedding) && product.embedding.length > 0;
        if (!force && hasExistingVector && product.embeddingSourceHash === currentHash) {
          skipped++;
          continue;
        }

        // Call provider
        const vector = await generateEmbedding(sourceText);

        await Product.findByIdAndUpdate(product._id, {
          $set: {
            embedding: vector,
            embeddingSourceHash: currentHash
          }
        });

        updated++;
      } catch (err) {
        failed++;
        errors.push({
          productId: product._id.toString(),
          name: product.name,
          error: err.message
        });
      }
    }

    skip += currentLimit;

    // Small rate-limit delay between batches (100ms)
    if (processed < maxToProcess) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  const config = getEmbeddingConfig();

  return {
    total: processed,
    updated,
    skipped,
    failed,
    provider: config.provider,
    model: config.model,
    dimensions: config.dimensions,
    errors: errors.slice(0, 10) // return first 10 error descriptions if any
  };
};

export default {
  generateProductEmbedding,
  generateProductEmbeddingsBatch
};
