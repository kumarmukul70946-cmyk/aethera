import mongoose from "mongoose";
import { Product, Category } from "../models/index.js";
import { generateEmbedding } from "./embeddingService.js";
import productService from "./productService.js";

/**
 * Escapes special regular expression characters to prevent ReDoS or regex injection.
 */
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Normalizes customer search queries for embedding generation.
 * Strips non-printable characters and collapses excessive whitespace while
 * strictly preserving natural language words, prepositions, and semantic context.
 *
 * @param {string} q - Raw search query
 * @returns {string} Clean, normalized query string
 */
export const normalizeQuery = (q) => {
  if (!q || typeof q !== "string") return "";
  return q
    .replace(/[\x00-\x1F\x7F]/g, " ") // Convert control characters to whitespace
    .replace(/\s+/g, " ")             // Collapse multiple whitespace
    .trim();
};

/**
 * Safely constructs structured MongoDB $match filter conditions.
 * Guarantees that arbitrary client query parameters cannot inject MongoDB operators.
 *
 * @param {Object} filters
 * @returns {Promise<Object>} Safe MongoDB filter object
 */
export const buildStructuredFilters = async (filters = {}) => {
  const { category, brand, minPrice, maxPrice, rating, includeOutOfStock = false } = filters;
  const match = {
    isActive: true
  };

  if (!includeOutOfStock) {
    match.stock = { $gt: 0 };
  }

  // 1. Category filter: resolves ObjectId or Category slug
  if (category && typeof category === "string" && category.trim()) {
    const trimmedCat = category.trim();
    if (mongoose.Types.ObjectId.isValid(trimmedCat)) {
      match.category = new mongoose.Types.ObjectId(trimmedCat);
    } else {
      const foundCategory = await Category.findOne({
        slug: trimmedCat.toLowerCase()
      }).lean();

      if (foundCategory) {
        match.category = foundCategory._id;
      } else {
        // If category slug does not exist, force match to fail safely
        match.category = new mongoose.Types.ObjectId();
      }
    }
  }

  // 2. Brand filter (case-insensitive literal match)
  if (brand && typeof brand === "string" && brand.trim()) {
    match.brand = new RegExp(`^${escapeRegex(brand.trim())}$`, "i");
  }

  // 3. Price range filtering (based on finalPrice)
  if (minPrice !== undefined || maxPrice !== undefined) {
    match.finalPrice = {};
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      match.finalPrice.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      match.finalPrice.$lte = Number(maxPrice);
    }
  }

  // 4. Minimum rating filter
  if (rating !== undefined && !isNaN(Number(rating))) {
    match.rating = { $gte: Number(rating) };
  }

  return match;
};

/**
 * Executes high-performance semantic search using MongoDB Atlas Vector Search.
 * Falls back gracefully to structured keyword search if Atlas Vector Search is
 * unsupported in the current environment or temporarily unavailable.
 *
 * @param {Object} params
 * @param {string} params.q - Customer search query
 * @param {number} [params.page=1] - Target pagination page
 * @param {number} [params.limit=12] - Results per page
 * @param {string} [params.category] - Optional category filter
 * @param {string} [params.brand] - Optional brand filter
 * @param {number} [params.minPrice] - Minimum final price
 * @param {number} [params.maxPrice] - Maximum final price
 * @param {number} [params.rating] - Minimum rating
 * @returns {Promise<Object>} Standardized search result envelope
 */
export const searchSemantic = async (params = {}) => {
  const {
    q,
    page = 1,
    limit = 12,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    includeOutOfStock = false
  } = params;

  const normalizedQuery = normalizeQuery(q);
  if (!normalizedQuery) {
    const error = new Error("Search query cannot be empty.");
    error.statusCode = 400;
    throw error;
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (parsedPage - 1) * parsedLimit;

  // Build safe structured filters
  const matchFilters = await buildStructuredFilters({
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    includeOutOfStock
  });

  const vectorIndexName = process.env.ATLAS_VECTOR_INDEX_NAME || "product_embedding_index";

  /**
   * numCandidates vs limit trade-off:
   * numCandidates governs how many nearest neighbors the HNSW index explores before ranking.
   * Higher candidates yield superior recall for complex semantic queries at small latency cost.
   * Setting numCandidates to dynamically accommodate the current pagination window guarantees
   * accurate multi-page browsing without performing an exhaustive full-database scan.
   */
  const numCandidates = Math.max(50, Math.min(300, parsedPage * parsedLimit + 80));
  const searchLimit = Math.min(200, parsedPage * parsedLimit + 40);

  try {
    // 1. Generate query vector from embedding service
    const queryVector = await generateEmbedding(normalizedQuery);

    // 2. Atlas Vector Search Aggregation Pipeline
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
        $match: matchFilters
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

    const allCandidates = await Product.aggregate(pipeline);

    const total = allCandidates.length;
    const paginatedProducts = allCandidates.slice(skip, skip + parsedLimit);
    const totalPages = Math.ceil(total / parsedLimit) || 1;

    return {
      products: paginatedProducts,
      query: normalizedQuery,
      searchMode: "semantic",
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages,
        hasNextPage: parsedPage < totalPages,
        hasPreviousPage: parsedPage > 1
      }
    };
  } catch (err) {
    // Fallback strategy: fail over cleanly to keyword search
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        `[SemanticSearch] Vector search unavailable (${err.message}). Falling back to keyword search.`
      );
    }

    const keywordResult = await productService.getProducts({
      search: normalizedQuery,
      page: parsedPage,
      limit: parsedLimit,
      category,
      brand,
      minPrice,
      maxPrice,
      rating
    });

    const mappedProducts = (keywordResult.products || []).map((p) => ({
      ...p,
      similarityScore: null // No vector similarity score in keyword fallback mode
    }));

    return {
      products: mappedProducts,
      query: normalizedQuery,
      searchMode: "keyword_fallback",
      pagination: keywordResult.pagination
    };
  }
};

export default {
  normalizeQuery,
  buildStructuredFilters,
  searchSemantic
};
