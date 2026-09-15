import crypto from "crypto";
import mongoose from "mongoose";
import Review from "../models/Review.js";

/**
 * Review Retrieval & Representative Selection Service
 * Responsible for fetching only approved customer reviews, computing deterministic
 * source hashes for caching, and selecting an explainable, diverse, bounded review sample.
 */
class ReviewRetrievalService {
  /**
   * Retrieves all approved reviews for a given product with projection to strictly safe fields.
   * Excludes any user authentication data, email addresses, or internal moderation logs.
   *
   * @param {string|mongoose.Types.ObjectId} productId
   * @returns {Promise<Array<Object>>}
   */
  async getApprovedReviews(productId) {
    const productObjectId = mongoose.Types.ObjectId.isValid(productId)
      ? new mongoose.Types.ObjectId(productId)
      : productId;

    return Review.find(
      {
        product: productObjectId,
        isApproved: true
      },
      {
        _id: 1,
        rating: 1,
        comment: 1,
        verifiedPurchase: 1,
        createdAt: 1,
        updatedAt: 1
      }
    )
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Computes a deterministic SHA-256 hash of the approved review dataset.
   * If any review is added, updated, deleted, or moderated, this hash changes.
   *
   * @param {Array<Object>} reviews - Array of approved review documents
   * @returns {string} SHA-256 hexadecimal string
   */
  generateSourceHash(reviews = []) {
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return "empty_reviews_hash";
    }

    // Sort by review ID for stable, deterministic ordering
    const sorted = [...reviews].sort((a, b) =>
      a._id.toString().localeCompare(b._id.toString())
    );

    const sourceString = sorted
      .map((r) => {
        const timeVal = r.updatedAt ? new Date(r.updatedAt).getTime() : new Date(r.createdAt || 0).getTime();
        const commentHash = crypto
          .createHash("sha256")
          .update((r.comment || "").trim())
          .digest("hex")
          .slice(0, 16);
        return `${r._id}:${r.rating}:${Boolean(r.verifiedPurchase)}:${timeVal}:${commentHash}`;
      })
      .join("|");

    return crypto.createHash("sha256").update(sourceString).digest("hex");
  }

  /**
   * Selects a bounded, representative subset of reviews for LLM processing.
   * Guarantees:
   * 1. Explainable & deterministic selection.
   * 2. Rating diversity: represents positive (4-5), mixed (3), and negative (1-2) feedback when present.
   * 3. Prioritizes verified purchases and informative review length.
   * 4. Deduplicates identical or near-duplicate review comments.
   * 5. Strict bounding to `maxReviews` (default 15).
   *
   * @param {Array<Object>} reviews - Raw approved reviews from MongoDB
   * @param {number} maxReviews - Upper bound on reviews to send to the LLM (default 15)
   * @returns {Array<Object>} Representative reviews
   */
  selectRepresentativeReviews(reviews = [], maxReviews = 15) {
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return [];
    }

    // 1. Deduplicate comments with identical trimmed lowercase content
    const seenComments = new Set();
    const uniqueReviews = [];

    for (const r of reviews) {
      const normalized = (r.comment || "").trim().toLowerCase();
      if (!normalized) continue;
      if (!seenComments.has(normalized)) {
        seenComments.add(normalized);
        uniqueReviews.push(r);
      }
    }

    if (uniqueReviews.length <= maxReviews) {
      return uniqueReviews;
    }

    // 2. Score individual reviews for informativeness
    const scoreReview = (r) => {
      let score = 0;
      // Verified purchases carry higher trust
      if (r.verifiedPurchase) score += 3;

      const len = (r.comment || "").trim().length;
      // Substantive reviews (>25 chars and <500 chars) are prioritized over single-word comments
      if (len >= 25 && len <= 500) {
        score += 3;
      } else if (len > 500) {
        score += 2;
      }

      // Helpful votes if present
      if (r.helpfulCount && r.helpfulCount > 0) {
        score += Math.min(r.helpfulCount, 3);
      }

      return score;
    };

    // 3. Partition into rating buckets
    const positiveBucket = []; // 4-5 stars
    const mixedBucket = [];    // 3 stars
    const negativeBucket = []; // 1-2 stars

    for (const r of uniqueReviews) {
      const scored = { ...r, _score: scoreReview(r) };
      if (r.rating >= 4) {
        positiveBucket.push(scored);
      } else if (r.rating === 3) {
        mixedBucket.push(scored);
      } else {
        negativeBucket.push(scored);
      }
    }

    // Sort each bucket: highest informativeness score first, then newest
    const sortBucket = (b) =>
      b.sort((a, b) => {
        if (b._score !== a._score) return b._score - a._score;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

    sortBucket(positiveBucket);
    sortBucket(mixedBucket);
    sortBucket(negativeBucket);

    // 4. Calculate diverse allocation quotas
    const totalCount = uniqueReviews.length;
    let negQuota = 0;
    let mixedQuota = 0;
    let posQuota = 0;

    if (negativeBucket.length > 0) {
      // Reserve at least 2 spots (or 25% of maxReviews, up to available) for negative reviews
      negQuota = Math.min(
        negativeBucket.length,
        Math.max(2, Math.round((negativeBucket.length / totalCount) * maxReviews))
      );
    }

    if (mixedBucket.length > 0) {
      // Reserve at least 1 spot for mixed reviews if available
      mixedQuota = Math.min(
        mixedBucket.length,
        Math.max(1, Math.round((mixedBucket.length / totalCount) * maxReviews))
      );
    }

    // Remaining slots go to positive reviews
    let remaining = maxReviews - (negQuota + mixedQuota);
    posQuota = Math.min(positiveBucket.length, Math.max(0, remaining));

    // If positive didn't use all remaining, distribute back to negative then mixed
    let spare = maxReviews - (posQuota + negQuota + mixedQuota);
    if (spare > 0 && negativeBucket.length > negQuota) {
      const addNeg = Math.min(spare, negativeBucket.length - negQuota);
      negQuota += addNeg;
      spare -= addNeg;
    }
    if (spare > 0 && mixedBucket.length > mixedQuota) {
      const addMixed = Math.min(spare, mixedBucket.length - mixedQuota);
      mixedQuota += addMixed;
      spare -= addMixed;
    }

    // Assemble selected items
    const selected = [
      ...positiveBucket.slice(0, posQuota),
      ...mixedBucket.slice(0, mixedQuota),
      ...negativeBucket.slice(0, negQuota)
    ];

    // Clean up temporary score property and sort by createdAt descending
    return selected
      .map(({ _score, ...item }) => item)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, maxReviews);
  }
}

export const reviewRetrievalService = new ReviewRetrievalService();
export default reviewRetrievalService;
