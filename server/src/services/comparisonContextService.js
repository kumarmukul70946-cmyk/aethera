/**
 * Comparison Context Service
 * Formats authoritative catalog data and bounded customer reviews into a strictly
 * structured, injection-resistant context string for LLM processing.
 *
 * Security Invariant:
 * Product descriptions, specifications, tags, and customer reviews are treated
 * strictly as UNTRUSTED reference data and quarantined inside explicit delimiter tags.
 */

class ComparisonContextService {
  /**
   * Strips HTML tags and excessive whitespace to sanitize untrusted strings.
   *
   * @param {string} str
   * @returns {string}
   */
  sanitizeText(str) {
    if (typeof str !== "string") return "";
    return str
      .replace(/<[^>]*>?/gm, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Builds the formatted context string for comparison.
   *
   * @param {Array<Object>} products - Safe product objects from MongoDB
   * @param {Object} reviewData - Map of productId -> { summary, themes, reviews }
   * @param {string} [question] - Optional user question
   * @returns {string} Structured context block
   */
  buildComparisonContext(products = [], reviewData = {}, question = "") {
    const lines = [];

    lines.push("<reference_catalog_data>");
    lines.push("The following products are authoritative records retrieved directly from MongoDB:");
    lines.push("");

    products.forEach((p, index) => {
      const pid = p._id ? p._id.toString() : p.id;
      const categoryName = p.category?.name || p.categoryName || (typeof p.category === "string" ? p.category : "N/A");
      const specsObj = p.specifications instanceof Map
        ? Object.fromEntries(p.specifications)
        : (p.specifications && typeof p.specifications === "object" ? p.specifications : {});

      const specString = Object.entries(specsObj)
        .map(([k, v]) => `${this.sanitizeText(k)}: ${this.sanitizeText(String(v))}`)
        .join("; ") || "None listed";

      const colorsList = Array.isArray(p.colors) && p.colors.length > 0 ? p.colors.join(", ") : "Standard";
      const sizesList = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes.join(", ") : "Standard";
      const tagsList = Array.isArray(p.tags) && p.tags.length > 0 ? p.tags.slice(0, 8).join(", ") : "None";
      const stockStatus = p.stock > 0 ? `In Stock (${p.stock} units)` : "Out of Stock";

      lines.push(`PRODUCT ${index + 1}:`);
      lines.push(`ID: ${pid}`);
      lines.push(`Name: ${this.sanitizeText(p.name)}`);
      lines.push(`Brand: ${this.sanitizeText(p.brand || "Aethera")}`);
      lines.push(`Category: ${this.sanitizeText(categoryName)}`);
      lines.push(`Original Price: ₹${p.price}`);
      lines.push(`Discount: ${p.discount || 0}%`);
      lines.push(`Final Listed Price: ₹${p.finalPrice || p.price}`);
      lines.push(`Average Rating: ${typeof p.rating === "number" ? p.rating.toFixed(1) : "0.0"} / 5.0`);
      lines.push(`Total Review Count: ${p.reviewCount || 0}`);
      lines.push(`Availability: ${stockStatus}`);
      lines.push(`Available Sizes: ${sizesList}`);
      lines.push(`Available Colors: ${colorsList}`);
      lines.push(`Specifications: ${specString}`);
      lines.push(`Tags: ${tagsList}`);
      lines.push(`Description: ${this.sanitizeText(p.description).slice(0, 400)}`);
      lines.push("");
    });
    lines.push("</reference_catalog_data>");
    lines.push("");

    // Customer Reviews Reference Data
    lines.push("<reference_reviews_data>");
    lines.push("The following customer reviews and aggregated themes are approved subjective feedback:");
    lines.push("");

    products.forEach((p, index) => {
      const pid = p._id ? p._id.toString() : p.id;
      const pReview = reviewData[pid] || {};

      lines.push(`REVIEWS FOR PRODUCT ${index + 1} (${this.sanitizeText(p.name)} - ID: ${pid}):`);

      // If pre-aggregated summary / themes exist from Part 17
      if (pReview.summary) {
        lines.push(`AI Consensus Summary: ${this.sanitizeText(pReview.summary)}`);
      }
      if (Array.isArray(pReview.themes) && pReview.themes.length > 0) {
        const themesStr = pReview.themes
          .map((t) => `${this.sanitizeText(t.name)} (${t.sentiment || "mixed"})`)
          .join(", ");
        lines.push(`Consensus Themes: ${themesStr}`);
      }

      // Sample representative reviews
      const sampleReviews = Array.isArray(pReview.reviews) ? pReview.reviews : [];
      if (sampleReviews.length > 0) {
        lines.push("Sample Customer Feedback:");
        sampleReviews.slice(0, 6).forEach((r, rIdx) => {
          const verified = r.verifiedPurchase ? " [Verified Buyer]" : "";
          const comment = this.sanitizeText(r.comment || "").slice(0, 200);
          lines.push(`  - [Rating: ${r.rating || 5}/5]${verified}: "${comment}"`);
        });
      } else if (!pReview.summary) {
        lines.push("No customer reviews currently recorded for this product.");
      }
      lines.push("");
    });
    lines.push("</reference_reviews_data>");

    // User question if present
    if (question && question.trim()) {
      lines.push("");
      lines.push("<user_question>");
      lines.push(this.sanitizeText(question.trim()));
      lines.push("</user_question>");
    }

    return lines.join("\n");
  }
}

export const comparisonContextService = new ComparisonContextService();
export default comparisonContextService;
