import { Cart, Product } from "../models/index.js";
import interactionService from "./interactionService.js";

/**
 * Helper to compute derived cart subtotals and clean inactive items.
 * @param {Object} cart - Mongoose Cart document populated with product details
 * @returns {Promise<Object>} Formatted cart object with server-calculated totals
 */
const formatCartResponse = async (cart) => {
  let hasChanges = false;
  const validItems = [];

  let cartSubtotal = 0;
  let itemCount = 0;

  for (const item of cart.items) {
    // If product was deleted or marked inactive, prune it safely
    if (!item.product || item.product.isActive === false) {
      hasChanges = true;
      continue;
    }

    const unitPrice =
      typeof item.product.finalPrice === "number"
        ? item.product.finalPrice
        : item.product.price;

    const itemSubtotal = unitPrice * item.quantity;
    cartSubtotal += itemSubtotal;
    itemCount += item.quantity;

    validItems.push({
      _id: item._id,
      product: {
        _id: item.product._id,
        name: item.product.name,
        slug: item.product.slug,
        brand: item.product.brand,
        price: item.product.price,
        discount: item.product.discount,
        finalPrice: unitPrice,
        images: item.product.images,
        stock: item.product.stock,
        colors: item.product.colors,
        sizes: item.product.sizes
      },
      quantity: item.quantity,
      customization: item.customization,
      unitPrice,
      itemSubtotal
    });
  }

  // Save cleaned items if pruned
  if (hasChanges) {
    cart.items = cart.items.filter((it) => it.product && it.product.isActive !== false);
    await cart.save();
  }

  return {
    _id: cart._id,
    user: cart.user,
    items: validItems,
    cartSubtotal,
    itemCount,
    updatedAt: cart.updatedAt
  };
};

export const cartService = {
  /**
   * Get or initialize cart for authenticated user.
   * @param {string} userId - User ObjectId
   */
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    return formatCartResponse(cart);
  },

  /**
   * Add item to cart or increment quantity if item already exists.
   * @param {string} userId
   * @param {Object} itemData - { productId, quantity, customization }
   */
  async addItem(userId, { productId, quantity = 1, customization = null }) {
    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) {
      const err = new Error("Quantity must be a positive integer greater than 0");
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.findById(productId);
    if (!product || product.isActive === false) {
      const err = new Error("Product not found or is no longer active");
      err.statusCode = 404;
      throw err;
    }

    // Validate customization options if specified
    if (customization) {
      if (customization.color && product.colors && product.colors.length > 0) {
        if (!product.colors.includes(customization.color)) {
          const err = new Error(`Invalid color option: ${customization.color}`);
          err.statusCode = 400;
          throw err;
        }
      }
      if (customization.size && product.sizes && product.sizes.length > 0) {
        if (!product.sizes.includes(customization.size)) {
          const err = new Error(`Invalid size option: ${customization.size}`);
          err.statusCode = 400;
          throw err;
        }
      }
      if (customization.custom3D) {
        if (!product.customization || !product.customization.enabled) {
          const err = new Error(`3D Customization is not supported for '${product.name}'`);
          err.statusCode = 400;
          throw err;
        }

        const allowedAreas = product.customization.areas || [];
        for (const [areaId, choice] of Object.entries(customization.custom3D)) {
          const areaDef = allowedAreas.find((a) => a.id === areaId);
          if (!areaDef) {
            const err = new Error(`Unknown customization area: ${areaId}`);
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
            const err = new Error(`Invalid customization option for area '${areaDef.name}'`);
            err.statusCode = 400;
            throw err;
          }
        }
      }
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Check if item with matching product and customization already exists
    const existingIndex = cart.items.findIndex((item) => {
      const isSameProduct = item.product.toString() === productId;
      if (!isSameProduct) return false;

      // Check matching customization if present
      if (!customization && !item.customization) return true;
      if (customization && item.customization) {
        const isStandardMatch =
          customization.color === item.customization.color &&
          customization.size === item.customization.size;
        const is3DMatch =
          JSON.stringify(customization.custom3D || null) ===
          JSON.stringify(item.customization.custom3D || null);
        return isStandardMatch && is3DMatch;
      }
      return false;
    });

    if (existingIndex > -1) {
      const newTotalQty = cart.items[existingIndex].quantity + qty;
      if (newTotalQty > product.stock) {
        const err = new Error(
          `Cannot add ${qty} more. Only ${product.stock} items available in stock (${cart.items[existingIndex].quantity} already in your cart).`
        );
        err.statusCode = 400;
        throw err;
      }
      cart.items[existingIndex].quantity = newTotalQty;
    } else {
      if (qty > product.stock) {
        const err = new Error(
          `Requested quantity (${qty}) exceeds available stock (${product.stock}).`
        );
        err.statusCode = 400;
        throw err;
      }

      cart.items.push({
        product: productId,
        quantity: qty,
        customization: customization || null
      });
    }

    await cart.save();

    // Record server-side CART interaction for behavioral analytics
    interactionService
      .createInteraction({
        userId,
        productId,
        type: "CART",
        metadata: { action: "add", quantity: qty }
      })
      .catch((err) => console.warn("[CartService] Tracking interaction failed:", err.message));

    cart = await Cart.findById(cart._id).populate("items.product");
    return formatCartResponse(cart);
  },

  /**
   * Update quantity of an item in cart.
   * @param {string} userId
   * @param {string} productId - Product ObjectId or item ID
   * @param {Object} updateData - { quantity }
   */
  async updateItem(userId, productId, { quantity }) {
    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) {
      const err = new Error("Quantity must be at least 1");
      err.statusCode = 400;
      throw err;
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      const err = new Error("Cart not found");
      err.statusCode = 404;
      throw err;
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId ||
        (item._id && item._id.toString() === productId)
    );

    if (itemIndex === -1) {
      const err = new Error("Item not found in your cart");
      err.statusCode = 404;
      throw err;
    }

    const product = await Product.findById(cart.items[itemIndex].product);
    if (!product || product.isActive === false) {
      const err = new Error("Product is no longer available");
      err.statusCode = 404;
      throw err;
    }

    if (qty > product.stock) {
      const err = new Error(
        `Insufficient stock. Only ${product.stock} items are available.`
      );
      err.statusCode = 400;
      throw err;
    }

    const targetProductId = cart.items[itemIndex].product;
    cart.items[itemIndex].quantity = qty;
    await cart.save();

    // Record server-side CART interaction for update
    interactionService
      .createInteraction({
        userId,
        productId: targetProductId,
        type: "CART",
        metadata: { action: "update", quantity: qty }
      })
      .catch((err) => console.warn("[CartService] Tracking interaction failed:", err.message));

    const populatedCart = await Cart.findById(cart._id).populate("items.product");
    return formatCartResponse(populatedCart);
  },

  /**
   * Remove item from cart.
   * @param {string} userId
   * @param {string} productId - Product ObjectId or item ID
   */
  async removeItem(userId, productId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      const err = new Error("Cart not found");
      err.statusCode = 404;
      throw err;
    }

    const targetItem = cart.items.find(
      (item) =>
        item.product.toString() === productId ||
        item._id?.toString() === productId
    );
    const resolvedProductId = targetItem ? targetItem.product : productId;

    cart.items = cart.items.filter(
      (item) =>
        item.product.toString() !== productId &&
        item._id?.toString() !== productId
    );

    await cart.save();

    // Record server-side CART interaction for remove
    interactionService
      .createInteraction({
        userId,
        productId: resolvedProductId,
        type: "CART",
        metadata: { action: "remove" }
      })
      .catch((err) => console.warn("[CartService] Tracking interaction failed:", err.message));

    const populatedCart = await Cart.findById(cart._id).populate("items.product");
    return formatCartResponse(populatedCart);
  },

  /**
   * Remove all items from authenticated user's cart.
   * @param {string} userId
   */
  async clearCart(userId) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    } else {
      cart.items = [];
      await cart.save();
    }

    return {
      _id: cart._id,
      user: cart.user,
      items: [],
      cartSubtotal: 0,
      itemCount: 0,
      updatedAt: cart.updatedAt
    };
  }
};

export default cartService;
