import mongoose from "mongoose";

// Snapshot of purchased item at time of order
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"]
    },
    name: {
      type: String,
      required: [true, "Purchased product name snapshot is required"],
      trim: true
    },
    price: {
      type: Number,
      required: [true, "Purchased price snapshot is required"],
      min: [0, "Price cannot be negative"]
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"]
    },
    customization: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    _id: true
  }
);

// Snapshot of shipping address at time of order
const shippingAddressSnapshotSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, default: "India", trim: true }
  },
  {
    _id: false
  }
);

// Snapshot of payment details
const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      required: [true, "Payment method is required"],
      enum: ["CARD", "UPI", "NET_BANKING", "WALLET", "COD"],
      default: "COD"
    },
    status: {
      type: String,
      required: [true, "Payment status is required"],
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING"
    },
    transactionId: {
      type: String,
      default: null
    }
  },
  {
    _id: false
  }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"]
    },
    items: {
      type: [orderItemSchema],
      required: [true, "Order items cannot be empty"],
      validate: [(val) => val.length > 0, "Order must contain at least one item"]
    },
    shippingAddress: {
      type: shippingAddressSnapshotSchema,
      required: [true, "Shipping address snapshot is required"]
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"]
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"]
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
      min: [0, "Total cannot be negative"]
    },
    payment: {
      type: paymentSchema,
      required: [true, "Payment details are required"]
    },
    status: {
      type: String,
      enum: {
        values: [
          "PENDING",
          "CONFIRMED",
          "PROCESSING",
          "SHIPPED",
          "OUT_FOR_DELIVERY",
          "DELIVERED",
          "CANCELLED"
        ],
        message: "{VALUE} is not a valid order status"
      },
      default: "PENDING"
    }
  },
  {
    timestamps: true
  }
);

// Indexes for order history queries, status tracking, and reporting
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
