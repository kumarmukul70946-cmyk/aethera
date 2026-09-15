import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"]
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, "Product description is required"]
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category reference is required"]
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },
    discount: {
      type: Number,
      min: [0, "Discount cannot be less than 0%"],
      max: [100, "Discount cannot exceed 100%"],
      default: 0
    },
    finalPrice: {
      type: Number,
      required: [true, "Final price is required"],
      min: [0, "Final price cannot be negative"]
    },
    images: {
      type: [String],
      default: []
    },
    model3D: {
      type: String,
      default: null
    },
    customization: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    colors: {
      type: [String],
      default: []
    },
    sizes: {
      type: [String],
      default: []
    },
    specifications: {
      type: Map,
      of: String,
      default: {}
    },
    stock: {
      type: Number,
      required: [true, "Stock count is required"],
      min: [0, "Stock cannot be negative"],
      default: 0
    },
    rating: {
      type: Number,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
      default: 0
    },
    reviewCount: {
      type: Number,
      min: [0, "Review count cannot be negative"],
      default: 0
    },
    tags: {
      type: [String],
      default: []
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    salesCount: {
      type: Number,
      default: 0,
      min: [0, "Sales count cannot be negative"]
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // Part 14: Semantic embedding vector and change-detection hash (kept private)
    embedding: {
      type: [Number],
      default: undefined,
      select: false
    },
    embeddingSourceHash: {
      type: String,
      default: null,
      select: false
    }
  },
  {
    timestamps: true
  }
);

// Pre-validate hook to calculate finalPrice if omitted
productSchema.pre("validate", function (next) {
  if (this.price !== undefined && (this.finalPrice === undefined || this.finalPrice === null)) {
    const discountRate = this.discount || 0;
    this.finalPrice = Math.round(this.price * (1 - discountRate / 100));
  }
  next();
});

// Targeted indexes for catalog filtering, sorting, and search (slug unique: true creates its own index)
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ finalPrice: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ tags: 1 });
productSchema.index({
  name: "text",
  description: "text",
  brand: "text",
  tags: "text"
});

const Product = mongoose.model("Product", productSchema);

export default Product;
