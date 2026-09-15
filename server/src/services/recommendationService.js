import mongoose from "mongoose";
import { Interaction, Product } from "../models/index.js";
import {
  calculateEffectiveSignal,
  scoreCandidate,
  DECAY_CONFIG
} from "../utils/recommendationScoring.js";

export const recommendationService = {
  /**
   * Fetch bounded recent interactions for a given user.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @param {Object} [options]
   * @param {number} [options.limit=200] - Bounded maximum events
   * @param {number} [options.maxAgeDays=90] - Rolling window in days
   * @returns {Promise<Array>} Lean interaction records with populated product metadata
   */
  async getUserInteractions(
    userId,
    { limit = 200, maxAgeDays = DECAY_CONFIG.maxAgeDays } = {}
  ) {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    return Interaction.find({
      user: new mongoose.Types.ObjectId(userId),
      createdAt: { $gte: cutoffDate }
    })
      .sort({ createdAt: -1 })
      .limit(Math.min(300, Math.max(1, limit)))
      .populate("product", "name slug brand price finalPrice category stock rating salesCount isFeatured isActive")
      .lean();
  },

  /**
   * Builds a structured user preference profile from interaction history.
   * Maps interactions to authoritative database product categories and brands.
   *
   * @param {Array} interactions - Recent user interaction records
   * @returns {Object} Extracted user profile with category, brand, and product affinities
   */
  buildUserPreferenceProfile(interactions = []) {
    const categoryAffinity = {};
    const brandAffinity = {};
    const productAffinity = {};
    const purchasedProductIds = new Set();
    const interactedProductIds = new Set();
    const searchQueries = [];

    for (const item of interactions) {
      const signal = calculateEffectiveSignal(item.type, item.createdAt, item.metadata);

      // 1. Identify already purchased products for exclusion
      if (item.type === "PURCHASE" && item.product) {
        const prodId = (item.product._id || item.product).toString();
        purchasedProductIds.add(prodId);
      }

      // 2. Accumulate product, category, and brand affinities
      if (item.product && typeof item.product === "object") {
        const p = item.product;
        const prodId = (p._id || p).toString();
        interactedProductIds.add(prodId);

        productAffinity[prodId] = (productAffinity[prodId] || 0) + signal;

        // Authoritative category from populated Product document
        const catId = (p.category?._id || p.category)?.toString();
        if (catId) {
          categoryAffinity[catId] = (categoryAffinity[catId] || 0) + signal;
        }

        // Authoritative brand from populated Product document
        if (p.brand && typeof p.brand === "string") {
          const brandTrim = p.brand.trim();
          if (brandTrim) {
            brandAffinity[brandTrim] = (brandAffinity[brandTrim] || 0) + signal;
          }
        }
      }

      // 3. Collect search queries
      if (item.type === "SEARCH" && item.metadata?.query) {
        searchQueries.push(String(item.metadata.query).trim());
      }
    }

    // Compute maximums for normalization
    const catVals = Object.values(categoryAffinity);
    const brandVals = Object.values(brandAffinity);
    const prodVals = Object.values(productAffinity);

    const maxCategoryAffinity = catVals.length > 0 ? Math.max(...catVals) : 0;
    const maxBrandAffinity = brandVals.length > 0 ? Math.max(...brandVals) : 0;
    const maxProductAffinity = prodVals.length > 0 ? Math.max(...prodVals) : 0;
    const totalSignal =
      catVals.reduce((a, b) => a + b, 0) +
      brandVals.reduce((a, b) => a + b, 0) +
      prodVals.reduce((a, b) => a + b, 0);

    return {
      categoryAffinity,
      brandAffinity,
      productAffinity,
      purchasedProductIds,
      interactedProductIds,
      searchQueries,
      maxCategoryAffinity,
      maxBrandAffinity,
      maxProductAffinity,
      totalSignal
    };
  },

  /**
   * Generates candidate products based on the user's highest affinity signals.
   * Single-batch MongoDB query prevents N+1 database performance bottlenecks.
   *
   * @param {Object} profile - User preference profile
   * @param {Object} [options]
   * @param {Object} [options.contextProduct] - Product currently being viewed
   * @param {Array<string>} [options.excludedProductIds=[]] - IDs to omit
   * @param {number} [options.candidatePoolLimit=100] - Upper bound on candidate pool
   * @returns {Promise<Array>} Candidate product documents
   */
  async generateCandidates(
    profile,
    { contextProduct = null, excludedProductIds = [], candidatePoolLimit = 100 } = {}
  ) {
    // 1. Determine top categories (top 3)
    const topCategoryIds = Object.entries(profile.categoryAffinity || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id)
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    // 2. Determine top brands (top 3)
    const topBrands = Object.entries(profile.brandAffinity || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([brand]) => brand);

    // 3. Include context product signals if viewing a product details page
    if (contextProduct) {
      const contextCatId = (contextProduct.category?._id || contextProduct.category)?.toString();
      if (contextCatId && mongoose.Types.ObjectId.isValid(contextCatId)) {
        topCategoryIds.push(new mongoose.Types.ObjectId(contextCatId));
      }
      if (contextProduct.brand) {
        topBrands.push(contextProduct.brand.trim());
      }
    }

    // 4. Combine all IDs to exclude (purchases + context product + explicit exclusions)
    const allExcludedSet = new Set(excludedProductIds.map(String));
    if (profile.purchasedProductIds) {
      for (const id of profile.purchasedProductIds) {
        allExcludedSet.add(String(id));
      }
    }
    if (contextProduct?._id) {
      allExcludedSet.add(contextProduct._id.toString());
    }

    const excludedObjectIds = Array.from(allExcludedSet)
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    // 5. Construct single batch $or criteria
    const orConditions = [];

    if (topCategoryIds.length > 0) {
      orConditions.push({ category: { $in: topCategoryIds } });
    }
    if (topBrands.length > 0) {
      orConditions.push({ brand: { $in: topBrands } });
    }

    // Quality, featured, and popular candidates for broad coverage
    orConditions.push({ isFeatured: true });
    orConditions.push({ rating: { $gte: 4.0 } });
    orConditions.push({ salesCount: { $gte: 1 } });

    const query = {
      isActive: true,
      stock: { $gt: 0 },
      _id: { $nin: excludedObjectIds },
      $or: orConditions
    };

    return Product.find(query)
      .limit(candidatePoolLimit)
      .populate("category", "name slug")
      .lean();
  },

  /**
   * Sorts, filters, and ranks scored candidate items.
   *
   * @param {Array} scoredCandidates - List of { product, score, breakdown, reason }
   * @param {number} limit - Target number of recommendations
   * @returns {Array} Ranked recommendations with explainable reasons
   */
  rankCandidates(scoredCandidates = [], limit = 10) {
    return scoredCandidates
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.product.rating !== a.product.rating) return b.product.rating - a.product.rating;
        return (b.product.salesCount || 0) - (a.product.salesCount || 0);
      })
      .slice(0, limit)
      .map(({ product, score, reason }) => ({
        product,
        score,
        reason
      }));
  },

  /**
   * Cold-start fallback for users with no interaction history.
   * Returns a deterministic set of trending, highly rated, and featured items.
   *
   * @param {Object} [options]
   * @param {number} [options.limit=10]
   * @param {Array} [options.excludedProductIds=[]]
   * @param {Object} [options.contextProduct]
   * @returns {Promise<Array>} Cold-start recommendations
   */
  async getColdStartRecommendations({
    limit = 10,
    excludedProductIds = [],
    contextProduct = null
  } = {}) {
    const allExcluded = new Set(excludedProductIds.map(String));
    if (contextProduct?._id) {
      allExcluded.add(contextProduct._id.toString());
    }

    const excludedObjectIds = Array.from(allExcluded)
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    // If context product provided, prioritize its category first
    let contextCandidates = [];
    if (contextProduct) {
      const contextCatId = (contextProduct.category?._id || contextProduct.category)?.toString();
      if (contextCatId && mongoose.Types.ObjectId.isValid(contextCatId)) {
        contextCandidates = await Product.find({
          isActive: true,
          stock: { $gt: 0 },
          category: new mongoose.Types.ObjectId(contextCatId),
          _id: { $nin: excludedObjectIds }
        })
          .sort({ salesCount: -1, rating: -1 })
          .limit(limit)
          .populate("category", "name slug")
          .lean();
      }
    }

    const remainingLimit = limit - contextCandidates.length;
    let globalCandidates = [];

    if (remainingLimit > 0) {
      const alreadySelected = new Set([
        ...excludedObjectIds.map(String),
        ...contextCandidates.map((p) => p._id.toString())
      ]);

      const globalExcluded = Array.from(alreadySelected)
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      globalCandidates = await Product.find({
        isActive: true,
        stock: { $gt: 0 },
        _id: { $nin: globalExcluded }
      })
        .sort({ isFeatured: -1, rating: -1, salesCount: -1 })
        .limit(remainingLimit)
        .populate("category", "name slug")
        .lean();
    }

    const combined = [...contextCandidates, ...globalCandidates];

    return combined.map((product) => {
      let reason = "Trending across Aethera";
      if (contextProduct && String(product.category?._id || product.category) === String(contextProduct.category?._id || contextProduct.category)) {
        reason = "Similar to the item you're viewing";
      } else if (product.isFeatured) {
        reason = "Featured by Aethera curators";
      } else if (product.rating >= 4.5) {
        reason = "Highly rated by Aethera shoppers";
      }

      const score = Number(((product.rating || 4.0) + 2.0).toFixed(2));

      return {
        product,
        score,
        reason
      };
    });
  },

  /**
   * Master recommendation coordinator.
   * Produces personalized, scored, and explainable recommendations.
   *
   * @param {string|mongoose.Types.ObjectId} userId - Authenticated customer ID
   * @param {Object} [options]
   * @param {number} [options.limit=10] - Number of recommendations to return (1-50)
   * @param {string} [options.contextProductId] - Optional product ID for context sensitivity
   * @returns {Promise<Array>} List of recommendations { product, score, reason }
   */
  async getPersonalizedRecommendations(
    userId,
    { limit = 10, contextProductId = null } = {}
  ) {
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    // Resolve context product if requested
    let contextProduct = null;
    if (contextProductId && mongoose.Types.ObjectId.isValid(contextProductId)) {
      contextProduct = await Product.findById(contextProductId).lean();
    }

    // 1. Fetch user interaction history
    const interactions = await this.getUserInteractions(userId);

    // 2. Cold-start check
    if (!interactions || interactions.length === 0) {
      return this.getColdStartRecommendations({
        limit: safeLimit,
        contextProduct,
        excludedProductIds: contextProduct ? [contextProduct._id.toString()] : []
      });
    }

    // 3. Extract user preference profile
    const profile = this.buildUserPreferenceProfile(interactions);

    if (profile.totalSignal === 0) {
      return this.getColdStartRecommendations({
        limit: safeLimit,
        contextProduct,
        excludedProductIds: contextProduct ? [contextProduct._id.toString()] : []
      });
    }

    // 4. Generate candidates in batch
    const candidates = await this.generateCandidates(profile, {
      contextProduct,
      excludedProductIds: contextProduct ? [contextProduct._id.toString()] : []
    });

    // 5. If insufficient candidates from preference signals, backfill with cold-start items
    const candidateMap = new Map();
    for (const c of candidates) {
      candidateMap.set(c._id.toString(), c);
    }

    if (candidateMap.size < safeLimit) {
      const needed = safeLimit - candidateMap.size;
      const backfill = await this.getColdStartRecommendations({
        limit: needed,
        contextProduct,
        excludedProductIds: [
          ...Array.from(candidateMap.keys()),
          ...Array.from(profile.purchasedProductIds)
        ]
      });

      for (const item of backfill) {
        if (!candidateMap.has(item.product._id.toString())) {
          candidateMap.set(item.product._id.toString(), item.product);
        }
      }
    }

    // 6. Score each candidate
    const scoredList = [];
    for (const product of candidateMap.values()) {
      const { score, breakdown, reason } = scoreCandidate(
        product,
        profile,
        contextProduct
      );
      scoredList.push({ product, score, breakdown, reason });
    }

    // 7. Rank and return top N
    return this.rankCandidates(scoredList, safeLimit);
  }
};

export default recommendationService;
