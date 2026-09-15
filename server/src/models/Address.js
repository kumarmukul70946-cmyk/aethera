import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Address must belong to a user"]
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true
    },
    addressLine: {
      type: String,
      required: [true, "Address line is required"],
      trim: true
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      default: "India",
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes for user address lookups and default selection
addressSchema.index({ user: 1, isDefault: 1 });

const Address = mongoose.model("Address", addressSchema);

export default Address;
