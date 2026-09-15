import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true
    },
    type: {
      type: String,
      required: [true, "Coupon type is required"],
      enum: {
        values: ["percentage", "fixed"],
        message: "{VALUE} is not a valid coupon type"
      }
    },
    value: {
      type: Number,
      required: [true, "Coupon discount value is required"],
      min: [0, "Discount value cannot be negative"]
    },
    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative"]
    },
    maximumDiscount: {
      type: Number,
      default: null,
      min: [0, "Maximum discount cannot be negative"]
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"]
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [1, "Usage limit must be at least 1"]
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"]
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for fast coupon active status and expiry lookup (code uniqueness index is created by unique: true)
couponSchema.index({ isActive: 1, expiryDate: 1 });

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
