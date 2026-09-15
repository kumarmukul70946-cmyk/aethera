import mongoose from "mongoose";
import { Product, Review } from "../models/index.js";
import semanticSearchService from "./semanticSearchService.js";

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with",
  "of", "by", "from", "up", "about", "into", "over", "after",
  "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did",
  "which", "what", "where", "who", "whom", "when", "why", "how",
  "i", "me", "my", "we", "us", "our", "you", "your",
  "can", "could", "would", "should", "will",
  "under", "below", "above", "between", "good", "best", "show", "tell", "find",
  "some", "any", "please", "item", "items", "product", "products"
]);

/**
 * Service responsible for the retrieval step in Retrieval-Augmented Generation (RAG).
 * Queries MongoDB Atlas Vector Search (via semanticSearchService) for candidate products,
 * loads full non-sensitive catalog fields, and fetches approved customer reviews.
 */
class RagService {
  /**
   * Retrieves relevant catalog products and approved reviews for a user question.
   *
   * @param {string} query - Customer search or question string
   * @param {Object} [options]
   * @param {number} [options.productLimit=5] - Maximum products to retrieve
   * @param {number} [options.reviewLimit=6] - Maximum reviews to retrieve
   * @returns {Promise<{ products: Array, reviews: Array, query: string }>}
   */
  async retrieveRelevantContext(query, options = {}) {
    if (!query || typeof query !== "string" || !query.trim()) {
      return { products: [], reviews: [], query: "" };
    }

    const normalizedQuery = query.trim();
    const productLimit = Math.max(1, Math.min(10, parseInt(options.productLimit, 10) || 5));
    const reviewLimit = Math.max(1, Math.min(12, parseInt(options.reviewLimit, 10) || 6));

    // 1. Retrieve candidates using Atlas Vector Search with keyword fallback
    let candidateIds = [];
    try {
      const searchResult = await semanticSearchService.searchSemantic({
        q: normalizedQuery,
        page: 1,
        limit: productLimit,
        includeOutOfStock: true // Allow querying out-of-stock products so AI can state stock accurately
      });

      if (searchResult && Array.isArray(searchResult.products) && searchResult.products.length > 0) {
        candidateIds = searchResult.products.map((p) => p._id);
      }
    } catch (err) {
      console.warn(`[RagService] Semantic retrieval error: ${err.message}.`);
      candidateIds = [];
    }

    // 1b. Smart keyword fallback for conversational questions if Atlas Vector Search is inactive locally
    let products = [];
    if (candidateIds.length === 0) {
      const cleanWords = normalizedQuery
        .toLowerCase()
        .replace(/[^\w\s₹]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

      // Check for price constraints (e.g., "under 5000" or "under ₹5000")
      const priceMatch = normalizedQuery.match(/(?:under|below|less\s+than)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
      const maxPrice = priceMatch ? Number(priceMatch[1]) : null;

      const fallbackFilter = { isActive: true };
      if (maxPrice && !isNaN(maxPrice)) {
        fallbackFilter.finalPrice = { $lte: maxPrice };
      }

      if (cleanWords.length > 0) {
        const termRegexes = cleanWords
          .filter((w) => isNaN(Number(w))) // Exclude standalone numbers from term regexes
          .map((w) => new RegExp(escapeRegex(w), "i"));

        if (termRegexes.length > 0) {
          fallbackFilter.$or = [
            { name: { $in: termRegexes } },
            { brand: { $in: termRegexes } },
            { description: { $in: termRegexes } },
            { tags: { $in: termRegexes } }
          ];
        }

        const fallbackCandidates = await Product.find(fallbackFilter)
          .populate("category", "name slug")
          .select(
            "name slug description brand price discount finalPrice rating reviewCount stock colors sizes specifications tags images category"
          )
          .sort({ rating: -1, salesCount: -1 })
          .limit(productLimit)
          .lean();

        products = fallbackCandidates;
      }
    } else {
      // 2. Fetch specific catalog fields for retrieved candidates
      const rawProducts = await Product.find({
        _id: { $in: candidateIds },
        isActive: true
      })
        .populate("category", "name slug")
        .select(
          "name slug description brand price discount finalPrice rating reviewCount stock colors sizes specifications tags images category"
        )
        .lean();

      // Preserve the similarity ranking returned by the vector search
      const productMap = new Map(rawProducts.map((p) => [p._id.toString(), p]));
      products = candidateIds
        .map((id) => productMap.get(id.toString()))
        .filter(Boolean);
    }

    if (products.length === 0) {
      return { products: [], reviews: [], query: normalizedQuery };
    }

    // 3. Fetch verified, approved reviews for the candidate products (strictly public & approved)
    const productObjectIds = products.map((p) => p._id);
    const reviews = await Review.find({
      product: { $in: productObjectIds },
      isApproved: true
    })
      .sort({ helpfulCount: -1, createdAt: -1 })
      .limit(reviewLimit)
      .populate("product", "name")
      .select("product rating comment verifiedPurchase helpfulCount createdAt")
      .lean();

    return {
      products,
      reviews,
      query: normalizedQuery
    };
  }
}

export const ragService = new RagService();
export default ragService;
