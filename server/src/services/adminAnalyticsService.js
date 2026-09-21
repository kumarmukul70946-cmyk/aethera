import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import Interaction from "../models/Interaction.js";

/**
 * Service providing authoritative administrative analytics.
 * Computes deterministic business metrics via MongoDB aggregations.
 * This is the SOURCE OF TRUTH. The LLM explains these metrics; it never creates them.
 */
class AdminAnalyticsService {
  /**
   * Resolves date boundaries for current and previous comparison periods.
   *
   * @param {string} period - 'today', '7d', '30d', '90d', or 'custom'
   * @param {string|Date} [customStart] - Optional custom start date
   * @param {string|Date} [customEnd] - Optional custom end date
   * @returns {{ currentStart: Date, currentEnd: Date, prevStart: Date, prevEnd: Date, periodLabel: string }}
   */
  resolveDateRanges(period = "30d", customStart, customEnd) {
    const now = new Date();
    // Anchor to nearest minute for stable caching windows on periodic requests
    now.setSeconds(0, 0);
    let currentStart;
    let currentEnd = new Date(now);
    let periodLabel = period;


    switch (period) {
      case "today": {
        currentStart = new Date(now);
        currentStart.setHours(0, 0, 0, 0);
        break;
      }
      case "7d": {
        currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      }
      case "30d": {
        currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      }
      case "90d": {
        currentStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      }
      case "custom": {
        if (customStart && customEnd) {
          currentStart = new Date(customStart);
          currentEnd = new Date(customEnd);
          if (isNaN(currentStart.getTime()) || isNaN(currentEnd.getTime())) {
            currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            currentEnd = now;
          }
        } else {
          currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        periodLabel = "custom";
        break;
      }
      default: {
        currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        periodLabel = "30d";
      }
    }

    const durationMs = currentEnd.getTime() - currentStart.getTime();
    const prevEnd = new Date(currentStart.getTime());
    const prevStart = new Date(prevEnd.getTime() - (durationMs > 0 ? durationMs : 24 * 60 * 60 * 1000));

    return {
      currentStart,
      currentEnd,
      prevStart,
      prevEnd,
      periodLabel
    };
  }

  /**
   * Aggregates revenue and order metrics for a specified time window.
   */
  async getRevenueAndOrderMetrics(startDate, endDate) {
    const results = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: "CANCELLED" }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: "$total" }
        }
      }
    ]);

    if (results.length === 0) {
      return { totalRevenue: 0, orderCount: 0, avgOrderValue: 0 };
    }

    return {
      totalRevenue: Math.round(results[0].totalRevenue * 100) / 100,
      orderCount: results[0].orderCount,
      avgOrderValue: Math.round(results[0].avgOrderValue * 100) / 100
    };
  }

  /**
   * Aggregates customer acquisition and repeat buyer metrics.
   */
  async getCustomerMetrics(startDate, endDate) {
    // New customers: registered within current period
    const newCustomersCount = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      role: "customer"
    });

    // Returning customers who placed an order in this period having ordered before
    const returningOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: "CANCELLED" }
        }
      },
      {
        $group: {
          _id: "$user",
          orderCountInPeriod: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "orders",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", "$$userId"] },
                    { $lt: ["$createdAt", startDate] },
                    { $ne: ["$status", "CANCELLED"] }
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: "priorOrders"
        }
      },
      {
        $match: {
          "priorOrders.0": { $exists: true }
        }
      },
      {
        $count: "returningCount"
      }
    ]);

    const returningCount = returningOrders.length > 0 ? returningOrders[0].returningCount : 0;

    const totalActiveUsers = await User.countDocuments({ role: "customer" });

    return {
      new: newCustomersCount,
      returning: returningCount,
      totalActive: totalActiveUsers
    };
  }

  /**
   * Computes product performance metrics: top revenue, top volume, low stock, out of stock.
   */
  async getProductPerformanceMetrics(startDate, endDate) {
    // Top products by revenue and volume in orders
    const topSold = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: "CANCELLED" }
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          unitsSold: { $sum: "$items.quantity" },
          orderOccurrences: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1, _id: 1 } },
      { $limit: 10 }
    ]);

    const topByRevenue = topSold.slice(0, 5).map((p) => ({
      id: p._id ? p._id.toString() : "unknown",
      name: p.name || "Unnamed Product",
      revenue: Math.round(p.revenue * 100) / 100,
      unitsSold: p.unitsSold
    }));

    const topByOrders = [...topSold]
      .sort((a, b) => (b.unitsSold - a.unitsSold) || (a.name || "").localeCompare(b.name || ""))
      .slice(0, 5)

      .map((p) => ({
        id: p._id ? p._id.toString() : "unknown",
        name: p.name || "Unnamed Product",
        unitsSold: p.unitsSold,
        revenue: Math.round(p.revenue * 100) / 100
      }));

    // Inventory status
    const lowStockThreshold = 10;
    const lowStockProducts = await Product.find({
      isActive: true,
      stock: { $gt: 0, $lte: lowStockThreshold }
    })
      .select("name stock price finalPrice")
      .sort({ stock: 1, name: 1 })
      .limit(10)
      .lean();

    const outOfStockProducts = await Product.find({
      isActive: true,
      stock: 0
    })
      .select("name stock price finalPrice")
      .sort({ name: 1 })
      .limit(10)
      .lean();


    return {
      topByRevenue,
      topByOrders,
      lowStock: lowStockProducts.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        stock: p.stock
      })),
      outOfStock: outOfStockProducts.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        stock: 0
      }))
    };
  }

  /**
   * Aggregates telemetry and shopper interaction counts.
   */
  async getInteractionMetrics(startDate, endDate) {
    const counts = await Interaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = counts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    return {
      views: countMap["VIEW"] || 0,
      cartAdds: countMap["CART"] || 0,
      wishlistAdds: countMap["WISHLIST"] || 0,
      searches: countMap["SEARCH"] || 0,
      customizations: countMap["CUSTOMIZATION"] || 0
    };
  }

  /**
   * Aggregates customer review and satisfaction metrics.
   */
  async getReviewMetrics(startDate, endDate) {
    const reviewStats = await Review.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isApproved: true
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
          positiveCount: {
            $sum: { $cond: [{ $gte: ["$rating", 4] }, 1, 0] }
          }
        }
      }
    ]);

    if (reviewStats.length === 0) {
      return {
        averageRating: 0,
        reviewCount: 0,
        positivePercentage: 0
      };
    }

    const { avgRating, count, positiveCount } = reviewStats[0];
    return {
      averageRating: Math.round(avgRating * 100) / 100,
      reviewCount: count,
      positivePercentage: Math.round((positiveCount / count) * 1000) / 10
    };
  }

  /**
   * Computes the complete authoritative business metrics payload for a given period.
   *
   * @param {Object} options
   * @param {string} [options.period="30d"]
   * @param {string|Date} [options.startDate]
   * @param {string|Date} [options.endDate]
   * @returns {Promise<Object>} Validated business metrics snapshot
   */
  async getBusinessMetrics({ period = "30d", startDate, endDate } = {}) {
    const { currentStart, currentEnd, prevStart, prevEnd, periodLabel } =
      this.resolveDateRanges(period, startDate, endDate);

    // Parallel aggregation for high performance
    const [
      currentRev,
      prevRev,
      customerMetrics,
      productMetrics,
      interactionMetrics,
      reviewMetrics
    ] = await Promise.all([
      this.getRevenueAndOrderMetrics(currentStart, currentEnd),
      this.getRevenueAndOrderMetrics(prevStart, prevEnd),
      this.getCustomerMetrics(currentStart, currentEnd),
      this.getProductPerformanceMetrics(currentStart, currentEnd),
      this.getInteractionMetrics(currentStart, currentEnd),
      this.getReviewMetrics(currentStart, currentEnd)
    ]);

    // Calculate growth percentages
    const calcGrowth = (current, previous) => {
      if (!previous || previous === 0) {
        return current > 0 ? 100 : 0;
      }
      const growth = ((current - previous) / previous) * 100;
      return Math.round(growth * 100) / 100;
    };

    const revenueGrowthPercent = calcGrowth(currentRev.totalRevenue, prevRev.totalRevenue);
    const orderGrowthPercent = calcGrowth(currentRev.orderCount, prevRev.orderCount);

    // Calculate conversion rates if interactions exist
    const viewToCartRate =
      interactionMetrics.views > 0
        ? Math.round((interactionMetrics.cartAdds / interactionMetrics.views) * 10000) / 100
        : 0;

    const cartToPurchaseRate =
      interactionMetrics.cartAdds > 0
        ? Math.round((currentRev.orderCount / interactionMetrics.cartAdds) * 10000) / 100
        : 0;

    const overallConversionRate =
      interactionMetrics.views > 0
        ? Math.round((currentRev.orderCount / interactionMetrics.views) * 10000) / 100
        : 0;

    return {
      period: periodLabel,
      dateRange: {
        startDate: currentStart.toISOString(),
        endDate: currentEnd.toISOString()
      },
      comparisonDateRange: {
        startDate: prevStart.toISOString(),
        endDate: prevEnd.toISOString()
      },
      revenue: {
        current: currentRev.totalRevenue,
        previous: prevRev.totalRevenue,
        growthPercent: revenueGrowthPercent
      },
      orders: {
        current: currentRev.orderCount,
        previous: prevRev.orderCount,
        growthPercent: orderGrowthPercent,
        averageOrderValue: currentRev.avgOrderValue
      },
      customers: customerMetrics,
      products: productMetrics,
      interactions: interactionMetrics,
      reviews: reviewMetrics,
      conversion: {
        viewToCartRate,
        cartToPurchaseRate,
        overallConversionRate
      },
      calculatedAt: new Date().toISOString()
    };
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
export default adminAnalyticsService;
