import mongoose from "mongoose";

/**
 * ReviewHelpful Model
 * Tracks individual helpful votes per customer to enforce the single-vote constraint.
 */
const reviewHelpfulSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vote must belong to a user"]
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: [true, "Vote must reference a review"]
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring one helpful vote per user per review
reviewHelpfulSchema.index({ user: 1, review: 1 }, { unique: true });

const ReviewHelpful = mongoose.model("ReviewHelpful", reviewHelpfulSchema);

export default ReviewHelpful;
