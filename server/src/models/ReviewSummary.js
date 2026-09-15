import mongoose from "mongoose";

/**
 * Sub-schema for identified review themes.
 */
const themeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Theme name is required"],
      trim: true,
      maxlength: [50, "Theme name cannot exceed 50 characters"]
    },
    sentiment: {
      type: String,
      required: [true, "Theme sentiment is required"],
      enum: {
        values: ["positive", "mixed", "negative"],
        message: "Theme sentiment must be 'positive', 'mixed', or 'negative'"
      }
    },
    evidenceCount: {
      type: Number,
      min: [0, "Evidence count cannot be negative"],
      default: undefined
    }
  },
  { _id: false }
);

/**
 * ReviewSummary Schema
 * Stores cached, LLM-generated qualitative summaries of approved customer reviews.
 * Uses sourceHash to detect changes in underlying reviews and avoid redundant LLM invocations.
 */
const reviewSummarySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Summary must be associated with a product"],
      unique: true,
      index: true
    },
    summary: {
      type: String,
      required: [true, "Review summary text is required"],
      trim: true,
      maxlength: [2000, "Review summary cannot exceed 2000 characters"]
    },
    sentiment: {
      type: String,
      required: [true, "Overall sentiment is required"],
      enum: {
        values: ["positive", "mixed", "negative"],
        message: "Sentiment must be 'positive', 'mixed', or 'negative'"
      },
      index: true
    },
    themes: {
      type: [themeSchema],
      default: [],
      validate: [
        (val) => Array.isArray(val) && val.length <= 8,
        "Themes cannot exceed 8 items"
      ]
    },
    reviewCountAtGeneration: {
      type: Number,
      required: [true, "Review count at generation time is required"],
      min: [0, "Review count cannot be negative"]
    },
    sourceHash: {
      type: String,
      required: [true, "Source hash is required for cache validation"],
      index: true
    },
    isStale: {
      type: Boolean,
      default: false,
      index: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index for cache freshness lookups
reviewSummarySchema.index({ product: 1, sourceHash: 1, isStale: 1 });

const ReviewSummary = mongoose.model("ReviewSummary", reviewSummarySchema);

export default ReviewSummary;
