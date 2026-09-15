/**
 * Recommendation Scoring Utilities
 *
 * Provides deterministic mathematical models for:
 * 1. Interaction weighting (relative intent strength)
 * 2. Exponential recency decay
 * 3. Multi-factor candidate scoring
 * 4. Deterministic, explainable recommendation reasons
 *
 * NOTE: These weights and decay factors are heuristic starting values that can be
 * tuned via offline evaluation, A/B testing, or replaced by ML ranking models.
 */

export const INTERACTION_WEIGHTS = {
  VIEW: 1,      // Weak discovery signal
  SEARCH: 2,    // Explicit intent signal
  RATING: 3,    // Explicit qualitative signal
  WISHLIST: 4,  // Strong consideration signal
  CART: 5,      // Very strong purchase consideration
  PURCHASE: 6   // Strongest verified transaction signal
};

export const DECAY_CONFIG = {
  halfLifeDays: 14, // Signal strength halves every 14 days
  maxAgeDays: 90    // Interactions older than 90 days are excluded
};

export const SCORING_WEIGHTS = {
  category: 3.5,
  brand: 2.5,
  behavior: 2.0,
  context: 2.5,
  popularity: 1.5,
  rating: 1.5
};

/**
 * Calculates the exponential recency decay factor for an interaction.
 * factor = exp(-ln(2) * deltaDays / halfLifeDays)
 *
 * @param {Date|string|number} interactionDate - Timestamp of the interaction
 * @param {number} [halfLifeDays] - Half-life in days (default 14)
 * @returns {number} Decay factor between 0.0 and 1.0
 */
export const calculateRecencyFactor = (
  interactionDate,
  halfLifeDays = DECAY_CONFIG.halfLifeDays
) => {
  if (!interactionDate) return 0;

  const date = new Date(interactionDate);
  const now = new Date();
  const deltaMs = now.getTime() - date.getTime();

  if (deltaMs <= 0) return 1.0;

  const deltaDays = deltaMs / (1000 * 60 * 60 * 24);

  if (deltaDays > DECAY_CONFIG.maxAgeDays) {
    return 0;
  }

  // Exponential decay formula with specified half-life
  const decayConstant = Math.LN2 / halfLifeDays;
  const factor = Math.exp(-decayConstant * deltaDays);

  return Math.min(1.0, Math.max(0.0, factor));
};

/**
 * Calculates the effective weighted signal of an interaction incorporating recency decay.
 *
 * @param {string} type - Interaction type (VIEW, SEARCH, WISHLIST, etc.)
 * @param {Date|string|number} createdAt - Interaction timestamp
 * @param {Object} [metadata] - Additional interaction metadata (e.g. rating score)
 * @returns {number} Effective signal score
 */
export const calculateEffectiveSignal = (type, createdAt, metadata = {}) => {
  const baseWeight = INTERACTION_WEIGHTS[type] || 1;
  const recency = calculateRecencyFactor(createdAt);

  let multiplier = 1.0;
  // If RATING interaction, scale by score if present (1-5 normalized around 1.0)
  if (type === "RATING" && metadata?.rating) {
    multiplier = Math.max(0.5, Number(metadata.rating) / 4.0);
  }

  return baseWeight * recency * multiplier;
};

/**
 * Deterministically scores a candidate product against a user preference profile.
 *
 * @param {Object} product - Product document from database
 * @param {Object} profile - User preference profile extracted by recommendationService
 * @param {Object} [contextProduct] - Optional product currently being viewed
 * @returns {{ score: number, breakdown: Object, reason: string }}
 */
export const scoreCandidate = (product, profile = {}, contextProduct = null) => {
  if (!product) return { score: 0, breakdown: {}, reason: "Default" };

  const productIdStr = product._id?.toString();
  const categoryIdStr = (product.category?._id || product.category)?.toString();
  const brandName = product.brand?.trim();

  // 1. Category Affinity (0.0 to 1.0)
  const categoryRaw = profile.categoryAffinity?.[categoryIdStr] || 0;
  const maxCategory = profile.maxCategoryAffinity || 1;
  const categoryNorm = Math.min(1.0, categoryRaw / Math.max(1, maxCategory));
  const categoryScore = categoryNorm * SCORING_WEIGHTS.category;

  // 2. Brand Affinity (0.0 to 1.0)
  const brandRaw = profile.brandAffinity?.[brandName] || 0;
  const maxBrand = profile.maxBrandAffinity || 1;
  const brandNorm = Math.min(1.0, brandRaw / Math.max(1, maxBrand));
  const brandScore = brandNorm * SCORING_WEIGHTS.brand;

  // 3. Direct Past Behavioral Affinity (0.0 to 1.0)
  const behaviorRaw = profile.productAffinity?.[productIdStr] || 0;
  const maxBehavior = profile.maxProductAffinity || 1;
  const behaviorNorm = Math.min(1.0, behaviorRaw / Math.max(1, maxBehavior));
  const behaviorScore = behaviorNorm * SCORING_WEIGHTS.behavior;

  // 4. Context Product Similarity (if viewing a specific product)
  let contextScore = 0;
  if (contextProduct) {
    const contextCatId = (contextProduct.category?._id || contextProduct.category)?.toString();
    const isSameCat = contextCatId && contextCatId === categoryIdStr;
    const isSameBrand = contextProduct.brand && contextProduct.brand === brandName;

    let contextNorm = 0;
    if (isSameCat && isSameBrand) {
      contextNorm = 1.0;
    } else if (isSameCat) {
      contextNorm = 0.75;
    } else if (isSameBrand) {
      contextNorm = 0.45;
    }
    contextScore = contextNorm * SCORING_WEIGHTS.context;
  }

  // 5. Popularity Score (salesCount normalized, 0.0 to 1.0)
  const sales = product.salesCount || 0;
  const maxSales = profile.maxCatalogSales || 50;
  const popNorm = Math.min(1.0, sales / Math.max(1, maxSales));
  const popularityScore = popNorm * SCORING_WEIGHTS.popularity;

  // 6. Rating Score (rating normalized 0.0 to 1.0)
  const rating = product.rating || 0;
  const ratingNorm = Math.min(1.0, rating / 5.0);
  const ratingScore = ratingNorm * SCORING_WEIGHTS.rating;

  // Total Score
  const totalScore =
    categoryScore +
    brandScore +
    behaviorScore +
    contextScore +
    popularityScore +
    ratingScore;

  // Determine Dominant Reason
  const breakdown = {
    categoryScore,
    brandScore,
    behaviorScore,
    contextScore,
    popularityScore,
    ratingScore
  };

  const reason = determineReason(breakdown, product, profile, contextProduct);

  return {
    score: Number(totalScore.toFixed(2)),
    breakdown: {
      category: Number(categoryScore.toFixed(2)),
      brand: Number(brandScore.toFixed(2)),
      behavior: Number(behaviorScore.toFixed(2)),
      context: Number(contextScore.toFixed(2)),
      popularity: Number(popularityScore.toFixed(2)),
      rating: Number(ratingScore.toFixed(2))
    },
    reason
  };
};

/**
 * Generates an explainable, deterministic reason based on the dominant scoring component.
 */
const determineReason = (breakdown, product, profile, contextProduct) => {
  // If context similarity was applied and was influential
  if (contextProduct && breakdown.contextScore >= 1.0) {
    return "Similar to the item you're viewing";
  }

  // Identify highest contributing personalized signal
  const signals = [
    { key: "category", val: breakdown.categoryScore, label: "Popular in categories you browse" },
    { key: "brand", val: breakdown.brandScore, label: "From a brand you frequently explore" },
    { key: "behavior", val: breakdown.behaviorScore, label: "Based on your recent interests" }
  ];

  signals.sort((a, b) => b.val - a.val);

  if (signals[0].val >= 1.0) {
    return signals[0].label;
  }

  // Quality & Popularity fallbacks
  if (product.rating >= 4.5 && product.reviewCount >= 5) {
    return "Highly rated by Aethera shoppers";
  }

  if (product.isFeatured) {
    return "Featured by Aethera curators";
  }

  return "Trending across Aethera";
};
