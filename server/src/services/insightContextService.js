/**
 * Service responsible for converting validated raw analytics into a compact,
 * privacy-safe context payload suitable for LLM reasoning.
 *
 * CRITICAL SECURITY INVARIANT:
 * Zero customer PII, tokens, passwords, payment info, or raw MongoDB ObjectIds
 * are ever passed to the LLM layer.
 */
class InsightContextService {
  /**
   * Sanitizes string data to prevent formatting artifacts or accidental injection cues.
   */
  _cleanText(text) {
    if (!text || typeof text !== "string") return "";
    return text.replace(/[\r\n\t]+/g, " ").trim().slice(0, 150);
  }

  /**
   * Builds an AI-safe, compact metrics summary context.
   *
   * @param {Object} rawMetrics - Authoritative output from adminAnalyticsService
   * @returns {Object} Compact, validated, PII-free business metrics context
   */
  buildContext(rawMetrics) {
    if (!rawMetrics || typeof rawMetrics !== "object") {
      throw new Error("Invalid analytics metrics provided to context builder.");
    }

    const {
      period = "30d",
      dateRange = {},
      comparisonDateRange = {},
      revenue = {},
      orders = {},
      customers = {},
      products = {},
      interactions = {},
      reviews = {},
      conversion = {}
    } = rawMetrics;

    // 1. Revenue & Orders
    const safeRevenue = {
      current: Number(revenue.current) || 0,
      previous: Number(revenue.previous) || 0,
      growthPercent: Number(revenue.growthPercent) || 0
    };

    const safeOrders = {
      current: Number(orders.current) || 0,
      previous: Number(orders.previous) || 0,
      growthPercent: Number(orders.growthPercent) || 0,
      averageOrderValue: Number(orders.averageOrderValue) || 0
    };

    // 2. Customer Acquisition (pure aggregate numbers, no user details)
    const safeCustomers = {
      newCustomers: Number(customers.new) || 0,
      returningCustomers: Number(customers.returning) || 0,
      totalActiveCustomers: Number(customers.totalActive) || 0
    };

    // 3. Products - sanitize product names and cap to top 5
    const topRevenueProducts = (products.topByRevenue || []).slice(0, 5).map((p) => ({
      name: this._cleanText(p.name),
      revenue: Number(p.revenue) || 0,
      unitsSold: Number(p.unitsSold) || 0
    }));

    const topVolumeProducts = (products.topByOrders || []).slice(0, 5).map((p) => ({
      name: this._cleanText(p.name),
      unitsSold: Number(p.unitsSold) || 0,
      revenue: Number(p.revenue) || 0
    }));

    const lowStockProducts = (products.lowStock || []).slice(0, 5).map((p) => ({
      name: this._cleanText(p.name),
      stock: Number(p.stock) || 0
    }));

    const outOfStockProducts = (products.outOfStock || []).slice(0, 5).map((p) => ({
      name: this._cleanText(p.name),
      stock: 0
    }));

    // 4. Interactions
    const safeInteractions = {
      views: Number(interactions.views) || 0,
      cartAdds: Number(interactions.cartAdds) || 0,
      wishlistAdds: Number(interactions.wishlistAdds) || 0,
      searches: Number(interactions.searches) || 0,
      customizations: Number(interactions.customizations) || 0
    };

    // 5. Reviews
    const safeReviews = {
      averageRating: Number(reviews.averageRating) || 0,
      reviewCount: Number(reviews.reviewCount) || 0,
      positivePercentage: Number(reviews.positivePercentage) || 0
    };

    // 6. Conversion indicators
    const safeConversion = {
      viewToCartRate: Number(conversion.viewToCartRate) || 0,
      cartToPurchaseRate: Number(conversion.cartToPurchaseRate) || 0,
      overallConversionRate: Number(conversion.overallConversionRate) || 0
    };

    return {
      period,
      timeframe: {
        currentWindow: `${dateRange.startDate || ""} to ${dateRange.endDate || ""}`,
        comparisonWindow: `${comparisonDateRange.startDate || ""} to ${comparisonDateRange.endDate || ""}`
      },
      revenue: safeRevenue,
      orders: safeOrders,
      customers: safeCustomers,
      products: {
        topByRevenue: topRevenueProducts,
        topByOrders: topVolumeProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts
      },
      interactions: safeInteractions,
      reviews: safeReviews,
      conversion: safeConversion
    };
  }
}

export const insightContextService = new InsightContextService();
export default insightContextService;
