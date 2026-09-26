import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: [true, "Public ID is required"],
      unique: true,
      trim: true,
      index: true
    },
    url: {
      type: String,
      required: [true, "Media URL is required"],
      trim: true
    },
    secureUrl: {
      type: String,
      required: [true, "Secure CDN URL is required"],
      trim: true
    },
    resourceType: {
      type: String,
      enum: {
        values: ["image", "raw"],
        message: "{VALUE} is not a valid resource type"
      },
      default: "image"
    },
    assetType: {
      type: String,
      required: [true, "Asset type is required"],
      enum: {
        values: [
          "PRODUCT_IMAGE",
          "PRODUCT_GALLERY",
          "PRODUCT_THUMBNAIL",
          "MODEL_3D"
        ],
        message: "{VALUE} is not a valid asset type"
      }
    },
    originalName: {
      type: String,
      required: [true, "Original filename is required"],
      trim: true
    },
    mimeType: {
      type: String,
      required: [true, "MIME type is required"],
      trim: true
    },
    format: {
      type: String,
      required: [true, "File format is required"],
      lowercase: true,
      trim: true
    },
    size: {
      type: Number,
      required: [true, "File size in bytes is required"],
      min: [0, "File size cannot be negative"]
    },
    width: {
      type: Number,
      default: null
    },
    height: {
      type: Number,
      default: null
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
      index: true
    },
    folder: {
      type: String,
      default: "aethera/products"
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "ARCHIVED", "ORPHANED"],
        message: "{VALUE} is not a valid asset status"
      },
      default: "ACTIVE"
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader user ID is required"],
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for optimized filtering, relations, and lifecycle queries
assetSchema.index({ product: 1, assetType: 1 });
assetSchema.index({ assetType: 1, createdAt: -1 });
assetSchema.index({ uploadedBy: 1, createdAt: -1 });
assetSchema.index({ status: 1, createdAt: -1 });

const Asset = mongoose.model("Asset", assetSchema);

export default Asset;
