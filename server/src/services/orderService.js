import { Order, Cart, Product, Address, Coupon } from "../models/index.js";
import couponService from "./couponService.js";
import interactionService from "./interactionService.js";

// Valid status transitions state machine
const ALLOWED_STATUS_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [], // Terminal status
  CANCELLED: [] // Terminal status
};

export const orderService = {
  /**
   * Complete checkout and order creation flow.
   * Performs all calculations server-side and atomic stock reservation.
   * @param {string} userId - Authenticated user ObjectId
   * @param {Object} checkoutData - { shippingAddressId, couponCode, paymentMethod }
   */
  async createOrder(userId, { shippingAddressId, couponCode, paymentMethod = "COD" }) {
    // 1. Load user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart || !cart.items || cart.items.length === 0) {
      const err = new Error("Cannot checkout with an empty shopping cart");
      err.statusCode = 400;
      throw err;
    }

    // 2. Validate shipping address strictly belonging to the user
    if (!shippingAddressId) {
      const err = new Error("Shipping address is required to place an order");
      err.statusCode = 400;
      throw err;
    }

    const addressDoc = await Address.findOne({
      _id: shippingAddressId,
      user: userId
    });

    if (!addressDoc) {
      const err = new Error("Invalid shipping address selected or access denied");
      err.statusCode = 404;
      throw err;
    }

    // Prepare immutable address snapshot
    const shippingAddressSnapshot = {
      fullName: addressDoc.fullName,
      phone: addressDoc.phone,
      addressLine: addressDoc.addressLine,
      city: addressDoc.city,
      state: addressDoc.state,
      postalCode: addressDoc.postalCode,
      country: addressDoc.country
    };

    // 3. Load fresh product documents and validate availability
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        const err = new Error("One or more products in your cart no longer exist");
        err.statusCode = 400;
        throw err;
      }

      if (product.isActive === false) {
        const err = new Error(`Product '${product.name}' is no longer active or available`);
        err.statusCode = 400;
        throw err;
      }

      if (product.stock < item.quantity) {
        const err = new Error(
          `Insufficient stock for '${product.name}'. Available: ${product.stock}, in cart: ${item.quantity}`
        );
        err.statusCode = 400;
        throw err;
      }

      // Validate customization against product attributes
      if (item.customization) {
        if (item.customization.color && product.colors?.length > 0) {
          if (!product.colors.includes(item.customization.color)) {
            const err = new Error(
              `Selected color '${item.customization.color}' is no longer available for '${product.name}'`
            );
            err.statusCode = 400;
            throw err;
          }
        }
        if (item.customization.size && product.sizes?.length > 0) {
          if (!product.sizes.includes(item.customization.size)) {
            const err = new Error(
              `Selected size '${item.customization.size}' is no longer available for '${product.name}'`
            );
            err.statusCode = 400;
            throw err;
          }
        }
        if (item.customization.custom3D) {
          const allowedAreas = product.customization?.areas || [];
          for (const [areaId, choice] of Object.entries(item.customization.custom3D)) {
            const areaDef = allowedAreas.find((a) => a.id === areaId);
            if (!areaDef) {
              const err = new Error(`Unknown customization area '${areaId}' on '${product.name}'`);
              err.statusCode = 400;
              throw err;
            }
            const validOption = areaDef.options.find(
              (opt) =>
                opt.id === choice.id ||
                opt.color?.toLowerCase() === choice.color?.toLowerCase() ||
                opt.name === choice.name
            );
            if (!validOption) {
              const err = new Error(
                `Invalid customization option for area '${areaDef.name}' on '${product.name}'`
              );
              err.statusCode = 400;
              throw err;
            }
          }
        }
      }

      // Calculate server-side purchase-time price
      const purchasePrice =
        typeof product.finalPrice === "number" ? product.finalPrice : product.price;

      const itemTotal = purchasePrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: purchasePrice,
        quantity: item.quantity,
        customization: item.customization || null
      });
    }

    // 4. Validate coupon if provided
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode && couponCode.trim()) {
      const couponResult = await couponService.validateCoupon(
        couponCode.trim(),
        subtotal
      );
      discount = couponResult.discount;
      appliedCoupon = couponResult.coupon;
    }

    const total = Math.max(0, subtotal - discount);

    // 5. Atomic Stock Deduction & Inventory Protection
    // Use conditional update (stock >= quantity) to guard against race conditions
    const successfullyDeducted = [];
    try {
      for (const item of orderItems) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity, salesCount: item.quantity } },
          { new: true }
        );

        if (!updated) {
          throw new Error(
            `Stock level changed during checkout for '${item.name}'. Please review your cart.`
          );
        }

        successfullyDeducted.push({
          productId: item.product,
          quantity: item.quantity
        });
      }
    } catch (stockError) {
      // Rollback any successfully deducted items
      for (const reverted of successfullyDeducted) {
        await Product.updateOne(
          { _id: reverted.productId },
          { $inc: { stock: reverted.quantity, salesCount: -reverted.quantity } }
        );
      }
      stockError.statusCode = 400;
      throw stockError;
    }

    // 6. Create Order document with purchase-time snapshots
    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress: shippingAddressSnapshot,
      subtotal,
      discount,
      total,
      payment: {
        method: paymentMethod || "COD",
        status: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
        transactionId: null
      },
      status: "PENDING"
    });

    // 7. Increment coupon usedCount if coupon was applied
    if (appliedCoupon) {
      await Coupon.updateOne(
        { code: appliedCoupon.code },
        { $inc: { usedCount: 1 } }
      );
    }

    // 8. Clear the authenticated user's cart
    cart.items = [];
    await cart.save();

    // 9. Generate server-side PURCHASE interactions for behavioral signals
    for (const item of orderItems) {
      interactionService
        .createInteraction({
          userId,
          productId: item.product,
          type: "PURCHASE",
          metadata: {
            orderId: order._id,
            quantity: item.quantity,
            unitPrice: item.price,
            itemTotal: item.itemTotal
          }
        })
        .catch((err) =>
          console.warn("[OrderService] Tracking purchase interaction failed:", err.message)
        );
    }

    return order;
  },

  /**
   * Get paginated orders for customer.
   * @param {string} userId
   * @param {Object} query - { page, limit }
   */
  async getCustomerOrders(userId, { page = 1, limit = 10 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments({ user: userId })
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      }
    };
  },

  /**
   * Get single order by ID with ownership verification.
   * @param {string} userId
   * @param {string} orderId
   * @param {boolean} [isAdmin=false]
   */
  async getOrderById(userId, orderId, isAdmin = false) {
    const query = isAdmin ? { _id: orderId } : { _id: orderId, user: userId };

    const order = await Order.findOne(query)
      .populate("items.product", "slug images brand")
      .populate("user", "name email");

    if (!order) {
      const err = new Error("Order not found or access denied");
      err.statusCode = 404;
      throw err;
    }

    return order;
  },

  /**
   * Customer cancels an eligible order.
   * Restocks items and decrements salesCount.
   * @param {string} userId
   * @param {string} orderId
   */
  async cancelOrder(userId, orderId) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      const err = new Error("Order not found or access denied");
      err.statusCode = 404;
      throw err;
    }

    const cancelableStatuses = ["PENDING", "CONFIRMED", "PROCESSING"];
    if (!cancelableStatuses.includes(order.status)) {
      const err = new Error(
        `Cannot cancel order at '${order.status}' stage. Cancellation is only permitted before shipping.`
      );
      err.statusCode = 400;
      throw err;
    }

    // Transition status to CANCELLED
    order.status = "CANCELLED";
    await order.save();

    // Restock inventory exactly once
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity, salesCount: -item.quantity } }
      );
    }

    return order;
  },

  /**
   * Admin: Get all customer orders with filtering and pagination.
   * @param {Object} query - { page, limit, status }
   */
  async getAllOrdersAdmin({ page = 1, limit = 10, status }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status && ALLOWED_STATUS_TRANSITIONS[status.toUpperCase()]) {
      filter.status = status.toUpperCase();
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      }
    };
  },

  /**
   * Admin: Update order status respecting transition rules.
   * @param {string} orderId
   * @param {string} newStatus
   */
  async updateOrderStatusAdmin(orderId, newStatus) {
    const normalizedStatus = newStatus.toUpperCase();

    const order = await Order.findById(orderId);
    if (!order) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      throw err;
    }

    if (order.status === normalizedStatus) {
      return order;
    }

    const allowedNext = ALLOWED_STATUS_TRANSITIONS[order.status] || [];
    if (!allowedNext.includes(normalizedStatus)) {
      const err = new Error(
        `Invalid order status transition from '${order.status}' to '${normalizedStatus}'. Allowed: [${allowedNext.join(", ") || "None (Terminal State)"}]`
      );
      err.statusCode = 400;
      throw err;
    }

    // If transitioning to CANCELLED, restore inventory
    if (normalizedStatus === "CANCELLED" && order.status !== "CANCELLED") {
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity, salesCount: -item.quantity } }
        );
      }
    }

    order.status = normalizedStatus;
    await order.save();

    return order;
  }
};

export default orderService;
