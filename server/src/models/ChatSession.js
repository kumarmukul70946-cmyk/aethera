import mongoose from "mongoose";

const messageSourceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "product"
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    id: {
      type: String
    },
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String
    },
    brand: {
      type: String
    },
    price: {
      type: Number
    },
    discount: {
      type: Number,
      default: 0
    },
    finalPrice: {
      type: Number
    },
    rating: {
      type: Number,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    stock: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      default: null
    },
    images: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, "Message content cannot exceed 2000 characters"]
    },
    sources: {
      type: [messageSourceSchema],
      default: []
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Chat session must belong to an authenticated user"],
      index: true
    },
    title: {
      type: String,
      default: "Shopping Assistant Chat",
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"]
    },
    messages: {
      type: [chatMessageSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient user session listing sorted by recent activity
chatSessionSchema.index({ user: 1, updatedAt: -1 });

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);

export default ChatSession;
