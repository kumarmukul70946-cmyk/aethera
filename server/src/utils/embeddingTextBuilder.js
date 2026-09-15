import crypto from "crypto";

/**
 * Normalizes text to prevent whitespace variations from invalidating hashes.
 */
const cleanString = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.replace(/\s+/g, " ").trim();
};

/**
 * Extracts a human-readable category name from either an ObjectId, populated object, or string.
 *
 * @param {Object|string} category
 * @returns {string} Category name
 */
const resolveCategoryName = (category) => {
  if (!category) return "";
  if (typeof category === "object") {
    return cleanString(category.name || category.slug || "");
  }
  return cleanString(String(category));
};

/**
 * Deterministically formats specifications (Map or plain object) with sorted keys.
 *
 * @param {Map|Object} specifications
 * @returns {string} Sorted key-value specification string
 */
const formatSpecifications = (specifications) => {
  if (!specifications) return "";

  let entries = [];
  if (specifications instanceof Map) {
    entries = Array.from(specifications.entries());
  } else if (typeof specifications === "object") {
    entries = Object.entries(specifications);
  }

  if (entries.length === 0) return "";

  // Sort alphabetically by specification key for determinism
  return entries
    .filter(([k, v]) => k && v !== undefined && v !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${cleanString(k)}: ${cleanString(String(v))}`)
    .join(", ");
};

/**
 * Constructs a structured, deterministic text representation of a product
 * optimized for high-dimensional semantic vector embedding models.
 *
 * Guaranteed to exclude:
 * - Passwords, user data, and customer identities
 * - Internal database identifiers (_id, __v)
 * - Volatile operational metrics (price, discount, stock, rating, reviewCount, salesCount)
 * - Timestamps (createdAt, updatedAt)
 *
 * @param {Object} product - Product document or plain object
 * @returns {string} Deterministic canonical representation
 */
export const buildProductEmbeddingText = (product) => {
  if (!product || typeof product !== "object") {
    throw new Error("Invalid product provided for embedding text generation.");
  }

  const parts = [];

  // 1. Product Name
  const name = cleanString(product.name);
  if (name) {
    parts.push(`Product: ${name}`);
  }

  // 2. Category
  const categoryName = resolveCategoryName(product.category);
  if (categoryName) {
    parts.push(`Category: ${categoryName}`);
  }

  // 3. Brand
  const brand = cleanString(product.brand);
  if (brand) {
    parts.push(`Brand: ${brand}`);
  }

  // 4. Description
  const description = cleanString(product.description);
  if (description) {
    parts.push(`Description: ${description}`);
  }

  // 5. Tags (sorted for strict determinism)
  if (Array.isArray(product.tags) && product.tags.length > 0) {
    const sortedTags = product.tags
      .map((t) => cleanString(t).toLowerCase())
      .filter(Boolean)
      .sort();
    if (sortedTags.length > 0) {
      parts.push(`Tags: ${sortedTags.join(", ")}`);
    }
  }

  // 6. Specifications
  const specsText = formatSpecifications(product.specifications);
  if (specsText) {
    parts.push(`Specifications: ${specsText}`);
  }

  // 7. Physical Attributes (Colors, Sizes)
  const attrParts = [];
  if (Array.isArray(product.colors) && product.colors.length > 0) {
    const colors = product.colors.map(cleanString).filter(Boolean).sort();
    if (colors.length > 0) {
      attrParts.push(`Colors: ${colors.join(", ")}`);
    }
  }
  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    const sizes = product.sizes.map(cleanString).filter(Boolean).sort();
    if (sizes.length > 0) {
      attrParts.push(`Sizes: ${sizes.join(", ")}`);
    }
  }
  if (attrParts.length > 0) {
    parts.push(`Attributes: ${attrParts.join("; ")}`);
  }

  return parts.join("\n");
};

/**
 * Computes a deterministic SHA-256 hash of the product's embedding source text.
 * Used for change detection to eliminate redundant API embedding generation costs.
 *
 * @param {string} text - Canonical product embedding text
 * @returns {string} SHA-256 hexadecimal hash
 */
export const computeEmbeddingHash = (text) => {
  if (!text || typeof text !== "string") {
    return "";
  }
  return crypto.createHash("sha256").update(text.trim(), "utf8").digest("hex");
};

export default {
  buildProductEmbeddingText,
  computeEmbeddingHash
};
