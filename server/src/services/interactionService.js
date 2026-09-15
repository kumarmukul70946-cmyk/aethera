import mongoose from "mongoose";
import { Interaction, Product } from "../models/index.js";

/**
 * Strips sensitive properties from metadata before persistence.
 * Prevents accidental recording of credentials, tokens, or payment card details.
 */
const sanitizeMetadata = (metadata = {}) => {
  if (!metadata || typeof metadata !== "object") return {};

  const clean = { ...metadata };
  const sensitiveKeys = [
    "password",
    "token",
    "jwt",
    "secret",
    "cardNumber",
    "creditCard",
    "cvv",
    "expiry",
    "authorization",
    "cookie"
  ];

  for (const key of Object.keys(clean)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      delete clean[key];
    }
  }

  return clean;
};

export const interactionService = {
  /**
   * Create and record a user interaction event.
   * Can be called by HTTP controller (VIEW, SEARCH) or internal business services
   * (PURCHASE, RATING, CART, WISHLIST).
   *
   * @param {Object} params
   * @param {string|mongoose.Types.ObjectId} [params.userId] - Authenticated user ObjectId
   * @param {string} [params.sessionId] - Anonymous session identifier (UUID)
   * @param {string|mongoose.Types.ObjectId} [params.productId] - Target product ObjectId
   * @param {string} params.type - Interaction enum: VIEW, SEARCH, WISHLIST, CART, PURCHASE, RATING
   * @param {Object} [params.metadata] - Additional non-sensitive event attributes
   * @returns {Promise<Object>} Created Interaction document
   */
  async createInteraction({
    userId = null,
    sessionId = null,
    productId = null,
    type,
    metadata = {}
  }) {
    if (!type) {
      throw new Error("Interaction type is required");
    }

    const validTypes = ["VIEW", "SEARCH", "WISHLIST", "CART", "PURCHASE", "RATING"];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid interaction type: ${type}`);
    }

    // Resolve User ObjectId safely
    let validUserId = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      validUserId = new mongoose.Types.ObjectId(userId);
    }

    // Resolve Product ObjectId safely
    let validProductId = null;
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      validProductId = new mongoose.Types.ObjectId(productId);
    }

    const cleanMetadata = sanitizeMetadata(metadata);

    const interaction = await Interaction.create({
      user: validUserId,
      product: validProductId,
      sessionId: sessionId ? String(sessionId).trim() : null,
      type,
      metadata: cleanMetadata
    });

    return interaction;
  },

  /**
   * Fetch interaction history for a user.
   * Useful for collaborative filtering and preference modeling in Part 13.
   * @param {string} userId
   * @param {Object} options - { limit, type }
   */
  async getUserInteractions(userId, { limit = 50, type = null } = {}) {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }

    const query = { user: new mongoose.Types.ObjectId(userId) };
    if (type) {
      query.type = type;
    }

    return Interaction.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(100, Math.max(1, limit)))
      .populate("product", "name slug brand price images categorySlug")
      .lean();
  },

  /**
   * Aggregate most viewed products over a given timeframe.
   * @param {Object} options - { limit, days }
   */
  async getMostViewedProducts({ limit = 10, days = 30 } = {}) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return Interaction.aggregate([
      {
        $match: {
          type: "VIEW",
          createdAt: { $gte: cutoffDate },
          product: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$product",
          viewCount: { $sum: 1 },
          uniqueSessions: { $addToSet: { $ifNull: ["$user", "$sessionId"] } }
        }
      },
      {
        $project: {
          productId: "$_id",
          viewCount: 1,
          uniqueVisitors: { $size: "$uniqueSessions" }
        }
      },
      { $sort: { viewCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: "$productId",
          viewCount: 1,
          uniqueVisitors: 1,
          name: "$product.name",
          slug: "$product.slug",
          brand: "$product.brand",
          price: "$product.price",
          finalPrice: "$product.finalPrice",
          images: "$product.images"
        }
      }
    ]);
  },

  /**
   * Aggregate most searched query strings.
   * @param {Object} options - { limit, days }
   */
  async getMostSearchedTerms({ limit = 10, days = 30 } = {}) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return Interaction.aggregate([
      {
        $match: {
          type: "SEARCH",
          createdAt: { $gte: cutoffDate },
          "metadata.query": { $exists: true, $ne: "" }
        }
      },
      {
        $project: {
          query: { $toLower: { $trim: { input: "$metadata.query" } } }
        }
      },
      {
        $match: {
          query: { $ne: "" }
        }
      },
      {
        $group: {
          _id: "$query",
          searchCount: { $sum: 1 }
        }
      },
      { $sort: { searchCount: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          term: "$_id",
          count: "$searchCount"
        }
      }
    ]);
  },

  /**
   * Aggregate most added-to-cart products over a given timeframe.
   * @param {Object} options - { limit, days }
   */
  async getMostAddedToCartProducts({ limit = 10, days = 30 } = {}) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return Interaction.aggregate([
      {
        $match: {
          type: "CART",
          "metadata.action": "add",
          createdAt: { $gte: cutoffDate },
          product: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$product",
          cartAddCount: { $sum: 1 },
          totalQuantity: { $sum: { $ifNull: ["$metadata.quantity", 1] } }
        }
      },
      { $sort: { cartAddCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 1,
          cartAddCount: 1,
          totalQuantity: 1,
          name: "$product.name",
          slug: "$product.slug",
          price: "$product.finalPrice"
        }
      }
    ]);
  },

  /**
   * Summarize engagement metrics for a specific product.
   * @param {string} productId
   */
  async getProductEngagement(productId) {
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return null;
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);

    const stats = await Interaction.aggregate([
      { $match: { product: productObjectId } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    const engagement = {
      views: 0,
      cartAdds: 0,
      wishlistAdds: 0,
      purchases: 0,
      ratings: 0
    };

    for (const stat of stats) {
      if (stat._id === "VIEW") engagement.views = stat.count;
      if (stat._id === "CART") engagement.cartAdds = stat.count;
      if (stat._id === "WISHLIST") engagement.wishlistAdds = stat.count;
      if (stat._id === "PURCHASE") engagement.purchases = stat.count;
      if (stat._id === "RATING") engagement.ratings = stat.count;
    }

    return engagement;
  }
};

export default interactionService;
