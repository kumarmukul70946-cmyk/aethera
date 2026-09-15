import mongoose from "mongoose";
import { Product, Category } from "../models/index.js";
import { generateProductEmbedding } from "./productEmbeddingService.js";

/**
 * Structured fallback when Atlas Vector Search is unavailable (e.g., local MongoDB,
 * unindexed collection, or cold vectors).
 * Employs category and brand affinity signals alongside quality indicators to return
 * relevant similar items without breaking user experience.
 *
 * @param {Object} targetProduct
 * @param {number} limit
 * @returns {Promise<Array>} Formatted product documents with fallback similarity signals
 */
export const getStructuredFallback = async (targetProduct, limit) => {
  const targetId = targetProduct._id;
  const targetCategoryId = targetProduct.category?._id || targetProduct.category;
  const targetBrand = targetProduct.brand?.trim();

  const results = [];
  const seenIds = new Set([targetId.toString()]);

  // 1. Primary fallback: Same category products, sorted by rating and popularity
  if (targetCategoryId && mongoose.Types.ObjectId.isValid(targetCategoryId)) {
    const categoryMatches = await Product.find({
      _id: { $ne: targetId },
      category: new mongoose.Types.ObjectId(targetCategoryId),
      isActive: true,
      stock: { $gt: 0 }
    })
      .sort({ rating: -1, salesCount: -1 })
      .limit(limit)
      .populate("category", "name slug")
      .lean();

    for (const prod of categoryMatches) {
      if (!seenIds.has(prod._id.toString())) {
        seenIds.add(prod._id.toString());
        results.push({
          ...prod,
          similarityScore: 0.85 // Heuristic affinity signal for same category
        });
      }
    }
  }

  // 2. Secondary fallback: Same brand if needed to meet target limit
  if (results.length < limit && targetBrand) {
    const brandMatches = await Product.find({
      _id: { $nin: Array.from(seenIds).map((id) => new mongoose.Types.ObjectId(id)) },
      brand: targetBrand,
      isActive: true,
      stock: { $gt: 0 }
    })
      .sort({ rating: -1, salesCount: -1 })
      .limit(limit - results.length)
      .populate("category", "name slug")
      .lean();

    for (const prod of brandMatches) {
      if (!seenIds.has(prod._id.toString())) {
        seenIds.add(prod._id.toString());
        results.push({
          ...prod,
          similarityScore: 0.75 // Heuristic affinity signal for same brand
        });
      }
    }
  }

  // 3. Tertiary fallback: Popular catalog items if still below limit
  if (results.length < limit) {
    const popularMatches = await Product.find({
      _id: { $nin: Array.from(seenIds).map((id) => new mongoose.Types.ObjectId(id)) },
      isActive: true,
      stock: { $gt: 0 }
    })
      .sort({ isFeatured: -1, rating: -1, salesCount: -1 })
      .limit(limit - results.length)
      .populate("category", "name slug")
      .lean();

    for (const prod of popularMatches) {
      if (!seenIds.has(prod._id.toString())) {
        seenIds.add(prod._id.toString());
        results.push({
          ...prod,
          similarityScore: 0.65 // Heuristic baseline signal
        });
      }
    }
  }

  return results.slice(0, limit);
};

/**
 * Retrieves semantically similar products using MongoDB Atlas Vector Search.
 * Automatically fails over to structured recommendation fallback if vector search is
 * unavailable or if the collection is unindexed.
 *
 * Excludes:
 * - The current product being viewed
 * - Inactive or soft-deleted products (isActive: false)
 * - Out of stock products (stock <= 0)
 *
 * @param {string|mongoose.Types.ObjectId} productId - Target product ID
 * @param {number} [limit=8] - Target count (clamped 1-20)
 * @returns {Promise<Object>} { products: Array, source: "vector_search" | "structured_fallback" }
 */
export const getSimilarProducts = async (productId, limit = 8) => {
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    const error = new Error("Invalid product ID format.");
    error.statusCode = 400;
    throw error;
  }

  const parsedLimit = Math.min(20, Math.max(1, parseInt(limit, 10) || 8));

  // 1. Load target product including vector
  const targetProduct = await Product.findById(productId)
    .select("+embedding +embeddingSourceHash")
    .populate("category", "name slug")
    .lean();

  if (!targetProduct) {
    const error = new Error(`Product with ID '${productId}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  // 2. Ensure target product has an embedding vector
  let queryVector = targetProduct.embedding;
  if (!Array.isArray(queryVector) || queryVector.length === 0) {
    try {
      // Attempt immediate on-the-fly embedding generation
      const genResult = await generateProductEmbedding(targetProduct._id);
      if (genResult.updated) {
        const refreshed = await Product.findById(targetProduct._id).select("+embedding").lean();
        queryVector = refreshed?.embedding;
      }
    } catch (genErr) {
      console.warn(`[SimilarProducts] Could not generate on-demand embedding for ${productId}: ${genErr.message}`);
    }
  }

  // If still no vector, immediately return structured fallback
  if (!Array.isArray(queryVector) || queryVector.length === 0) {
    const fallbackProducts = await getStructuredFallback(targetProduct, parsedLimit);
    return {
      products: fallbackProducts,
      source: "structured_fallback"
    };
  }

  // 3. Attempt MongoDB Atlas Vector Search aggregation
  const vectorIndexName = process.env.ATLAS_VECTOR_INDEX_NAME || "product_embedding_index";

  /**
   * numCandidates vs limit trade-off:
   * numCandidates specifies the size of the dynamic candidate list evaluated by the HNSW index.
   * A larger numCandidates increases search recall and accuracy at the expense of query latency.
   * Setting numCandidates to ~15x limit (clamped 50-200) balances millisecond latency with high semantic fidelity.
   */
  const numCandidates = Math.max(50, Math.min(200, parsedLimit * 15));
  const searchLimit = Math.min(100, (parsedLimit + 5) * 2);

  const pipeline = [
    {
      $vectorSearch: {
        index: vectorIndexName,
        path: "embedding",
        queryVector,
        numCandidates,
        limit: searchLimit
      }
    },
    {
      $match: {
        _id: { $ne: targetProduct._id },
        isActive: true,
        stock: { $gt: 0 }
      }
    },
    {
      $limit: parsedLimit
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category"
      }
    },
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        description: 1,
        brand: 1,
        price: 1,
        discount: 1,
        finalPrice: 1,
        images: 1,
        category: {
          _id: "$category._id",
          name: "$category.name",
          slug: "$category.slug"
        },
        rating: 1,
        reviewCount: 1,
        stock: 1,
        isFeatured: 1,
        salesCount: 1,
        similarityScore: { $round: [{ $meta: "vectorSearchScore" }, 4] }
      }
    }
  ];

  try {
    const vectorResults = await Product.aggregate(pipeline);

    if (vectorResults && vectorResults.length > 0) {
      return {
        products: vectorResults,
        source: "vector_search"
      };
    }

    // If vector search returned 0 results (e.g. small catalog or threshold filter), fallback gracefully
    const fallbackProducts = await getStructuredFallback(targetProduct, parsedLimit);
    return {
      products: fallbackProducts,
      source: "structured_fallback"
    };
  } catch (vectorError) {
    // Gracefully handle environments without Atlas Vector Search (e.g., local standalone MongoDB)
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        `[SimilarProducts] Atlas Vector Search unavailable (${vectorError.message}). Serving structured recommendation fallback.`
      );
    }

    const fallbackProducts = await getStructuredFallback(targetProduct, parsedLimit);
    return {
      products: fallbackProducts,
      source: "structured_fallback"
    };
  }
};

export default {
  getSimilarProducts,
  getStructuredFallback
};
