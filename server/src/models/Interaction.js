import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null
    },
    type: {
      type: String,
      required: [true, "Interaction type is required"],
      enum: {
        values: ["VIEW", "SEARCH", "WISHLIST", "CART", "PURCHASE", "RATING"],
        message: "{VALUE} is not a valid interaction type"
      }
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    sessionId: {
      type: String,
      default: null,
      trim: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Targeted indexes optimized for AI recommendation engine and collaborative filtering queries
interactionSchema.index({ user: 1, createdAt: -1 });
interactionSchema.index({ sessionId: 1, createdAt: -1 });
interactionSchema.index({ product: 1, type: 1 });
interactionSchema.index({ type: 1, createdAt: -1 });

const Interaction = mongoose.model("Interaction", interactionSchema);

export default Interaction;
