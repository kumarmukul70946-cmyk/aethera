/**
 * Formatting utility functions for Aethera Commerce.
 */

/**
 * Format numeric value as currency (default INR ₹, or USD $).
 * @param {number} amount
 * @param {string} [currency='INR']
 * @returns {string}
 */
export const formatCurrency = (amount, currency = "INR") => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "₹0";
  }

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency === "USD" ? "USD" : "INR",
      maximumFractionDigits: 0
    }).format(amount);
  } catch (err) {
    return `₹${amount.toLocaleString()}`;
  }
};

/**
 * Calculate amount saved from discount.
 * @param {number} originalPrice
 * @param {number} discountPercentage
 * @returns {number}
 */
export const calculateSavings = (originalPrice, discountPercentage) => {
  if (!discountPercentage || discountPercentage <= 0) return 0;
  return Math.round(originalPrice * (discountPercentage / 100));
};

/**
 * Truncate long strings with ellipsis.
 * @param {string} text
 * @param {number} limit
 * @returns {string}
 */
export const truncateText = (text, limit = 80) => {
  if (!text) return "";
  if (text.length <= limit) return text;
  return text.slice(0, limit).trim() + "...";
};
