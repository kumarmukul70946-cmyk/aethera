import mongoose from "mongoose";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import ReviewSummary from "../models/ReviewSummary.js";
import comparisonContextService from "./comparisonContextService.js";
import comparisonPromptService from "./comparisonPromptService.js";
import aiService from "./aiService.js";

/**
 * Product Comparison Service
 * Coordinates authoritative MongoDB catalog retrieval, bounded customer review aggregation,
 * deterministic attribute table formulation, and grounded AI explanation synthesis.
 *
 * Fundamental Rule:
 * MongoDB is the authoritative source of truth. Numeric facts (prices, ratings, stock, etc.)
 * are computed directly from database records. The LLM is used solely to explain differences,
 * highlight balanced trade-offs, and synthesize review themes.
 */
class ProductComparisonService {
  /**
   * Compares 2 to 4 products with grounded catalog facts and approved review insights.
   *
   * @param {Object} params
   * @param {Array<string>} params.productIds - Array of 2-4 MongoDB ObjectIds
   * @param {string} [params.question] - Optional user question
   * @param {string} [params.userId] - Authenticated customer ID
   * @returns {Promise<Object>} Grounded comparison result
   */
  async compareProducts({ productIds = [], question = "", userId = null }) {
    if (!Array.isArray(productIds) || productIds.length < 2 || productIds.length > 4) {
      const err = new Error("Comparison requires between 2 and 4 products.");
      err.statusCode = 400;
      throw err;
    }

    // 1. Convert to ObjectIds and check duplicates
    const stringIds = productIds.map((id) => id.toString().trim());
    const uniqueIds = new Set(stringIds);
    if (uniqueIds.size !== stringIds.length) {
      const err = new Error("Duplicate product IDs are not allowed in comparison.");
      err.statusCode = 400;
      throw err;
    }

    const objectIds = stringIds.map((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error(`Invalid product ID: ${id}`);
        err.statusCode = 400;
        throw err;
      }
      return new mongoose.Types.ObjectId(id);
    });

    // 2. Bounded batch fetch: avoids N+1 queries
    const fetchedProducts = await Product.find({
      _id: { $in: objectIds },
      isActive: true
    })
      .populate("category", "name slug")
      .lean();

    // 3. Ensure all requested products exist and are active
    if (fetchedProducts.length !== objectIds.length) {
      const foundIdSet = new Set(fetchedProducts.map((p) => p._id.toString()));
      const missingIds = stringIds.filter((id) => !foundIdSet.has(id));
      const err = new Error(
        `One or more requested products were not found or are inactive: ${missingIds.join(", ")}`
      );
      err.statusCode = 404;
      throw err;
    }

    // Preserve exact requested product ordering
    const productMap = new Map(fetchedProducts.map((p) => [p._id.toString(), p]));
    const orderedProducts = stringIds.map((id) => productMap.get(id));

    // 4. Build deterministic comparison table directly from MongoDB records
    const comparisonTable = this.buildDeterministicComparisonTable(orderedProducts);

    // 5. Retrieve approved reviews & AI summaries for each product
    const reviewData = await this.retrieveApprovedReviewData(orderedProducts);

    // 6. Build prompt context with strict injection isolation
    const context = comparisonContextService.buildComparisonContext(
      orderedProducts,
      reviewData,
      question
    );

    const { systemPrompt, userPrompt } = comparisonPromptService.buildComparisonPrompt(
      context,
      question
    );

    // 7. Invoke LLM for grounded explanation & trade-offs
    const aiOutput = await aiService.generateStructuredComparison({
      systemPrompt,
      userPrompt,
      products: orderedProducts,
      reviewData,
      question
    });

    // 8. Build sanitized source references
    const sources = orderedProducts.map((p) => ({
      productId: p._id.toString(),
      name: p.name,
      slug: p.slug,
      brand: p.brand
    }));

    // 9. Build sanitized safe product cards for frontend
    const safeProducts = orderedProducts.map((p) => {
      const primaryImg =
        p.images && p.images.length > 0
          ? typeof p.images[0] === "string"
            ? p.images[0]
            : p.images[0].url
          : null;

      return {
        _id: p._id.toString(),
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        category: p.category?.name || "General",
        price: p.price,
        discount: p.discount || 0,
        finalPrice: p.finalPrice || p.price,
        rating: p.rating || 0,
        reviewCount: p.reviewCount || 0,
        stock: p.stock,
        colors: p.colors || [],
        sizes: p.sizes || [],
        images: p.images || [],
        image: primaryImg,
        model3D: p.model3D || null
      };
    });

    return {
      products: safeProducts,
      comparisonTable,
      summary: aiOutput.summary,
      tradeoffs: aiOutput.tradeoffs,
      reviewInsights: aiOutput.reviewInsights,
      questionAnswer: aiOutput.questionAnswer,
      sources,
      disclaimer: "Comparison based on current catalog data and approved customer reviews.",
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Constructs deterministic comparison table rows directly from authoritative MongoDB records.
   * Ensures numbers, ratings, prices, and specs cannot be hallucinated.
   *
   * @param {Array<Object>} products - Authoritative product documents
   * @returns {Array<{ attribute: string, values: Array<{ productId: string, value: string|number }> }>}
   */
  buildDeterministicComparisonTable(products = []) {
    const table = [];

    // Helper to add attribute row
    const addRow = (attribute, getValue) => {
      table.push({
        attribute,
        values: products.map((p) => ({
          productId: p._id.toString(),
          value: getValue(p)
        }))
      });
    };

    // 1. Price
    addRow("Price", (p) => `₹${(p.price || 0).toLocaleString("en-IN")}`);

    // 2. Final Discounted Price
    addRow("Final Price", (p) => {
      const finalPrice = p.finalPrice || p.price || 0;
      return `₹${finalPrice.toLocaleString("en-IN")}${p.discount ? ` (${p.discount}% OFF)` : ""}`;
    });

    // 3. Customer Rating
    addRow("Rating", (p) =>
      typeof p.rating === "number" && p.rating > 0
        ? `★ ${p.rating.toFixed(1)} / 5.0 (${p.reviewCount || 0} reviews)`
        : "Not yet rated"
    );

    // 4. Brand
    addRow("Brand", (p) => p.brand || "Aethera");

    // 5. Category
    addRow("Category", (p) => p.category?.name || "General");

    // 6. Availability & Stock
    addRow("Stock Status", (p) =>
      p.stock > 0 ? `In Stock (${p.stock} units)` : "Out of Stock"
    );

    // 7. Colors
    addRow("Available Colors", (p) =>
      Array.isArray(p.colors) && p.colors.length > 0
        ? `${p.colors.length} colors (${p.colors.join(", ")})`
        : "Standard"
    );

    // 8. Sizes
    addRow("Available Sizes", (p) =>
      Array.isArray(p.sizes) && p.sizes.length > 0
        ? `${p.sizes.length} sizes (${p.sizes.join(", ")})`
        : "Standard"
    );

    // 9. 3D Digital Twin Ready
    addRow("3D Interactive View", (p) => (p.model3D ? "Yes (Interactive 3D)" : "Standard 2D"));

    // 10. Extract all dynamic specifications
    const allSpecKeys = new Set();
    for (const p of products) {
      if (p.specifications) {
        const specs = p.specifications instanceof Map
          ? Object.fromEntries(p.specifications)
          : p.specifications;
        Object.keys(specs).forEach((k) => allSpecKeys.add(k));
      }
    }

    for (const key of allSpecKeys) {
      addRow(`Spec: ${key}`, (p) => {
        if (!p.specifications) return "—";
        const specs = p.specifications instanceof Map
          ? Object.fromEntries(p.specifications)
          : p.specifications;
        return specs[key] || "—";
      });
    }

    return table;
  }

  /**
   * Retrieves approved customer reviews and existing AI review summaries for the products.
   *
   * @param {Array<Object>} products - Products list
   * @returns {Promise<Object>} Map of productId -> { summary, themes, reviews }
   */
  async retrieveApprovedReviewData(products = []) {
    const reviewData = {};

    await Promise.all(
      products.map(async (p) => {
        const pid = p._id.toString();

        // Check for fresh AI review summary from Part 17
        const cachedSummary = await ReviewSummary.findOne({
          product: p._id,
          isStale: false
        }).lean();

        // Retrieve bounded approved reviews (max 10)
        const approvedReviews = await Review.find(
          {
            product: p._id,
            isApproved: true
          },
          {
            rating: 1,
            comment: 1,
            verifiedPurchase: 1,
            createdAt: 1
          }
        )
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        reviewData[pid] = {
          summary: cachedSummary?.summary || null,
          themes: cachedSummary?.themes || [],
          reviews: approvedReviews || []
        };
      })
    );

    return reviewData;
  }
}

export const productComparisonService = new ProductComparisonService();
export default productComparisonService;
