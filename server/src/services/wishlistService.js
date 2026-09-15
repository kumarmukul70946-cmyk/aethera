import { Wishlist, Product } from "../models/index.js";
import cartService from "./cartService.js";
import interactionService from "./interactionService.js";

export const wishlistService = {
  /**
   * Get or initialize wishlist for user.
   * Filters out inactive or deleted products safely.
   * @param {string} userId
   */
  async getWishlist(userId) {
    let wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: "products",
      select: "name slug brand price discount finalPrice images stock rating reviewCount isFeatured model3D isActive"
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    // Prune null or inactive products
    const validProducts = (wishlist.products || []).filter(
      (p) => p && p.isActive !== false
    );

    if (validProducts.length !== (wishlist.products || []).length) {
      wishlist.products = validProducts.map((p) => p._id);
      await wishlist.save();
    }

    return {
      _id: wishlist._id,
      user: wishlist.user,
      products: validProducts,
      itemCount: validProducts.length
    };
  },

  /**
   * Add a product to the user's wishlist (prevent duplicates).
   * @param {string} userId
   * @param {string} productId
   */
  async addToWishlist(userId, productId) {
    const product = await Product.findById(productId);
    if (!product || product.isActive === false) {
      const err = new Error("Product not found or is no longer active");
      err.statusCode = 404;
      throw err;
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [productId] });
    } else {
      // Prevent duplicate product entries
      const alreadyExists = wishlist.products.some(
        (id) => id.toString() === productId
      );
      if (!alreadyExists) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    // Record server-side WISHLIST add interaction
    interactionService
      .createInteraction({
        userId,
        productId,
        type: "WISHLIST",
        metadata: { action: "add" }
      })
      .catch((err) => console.warn("[WishlistService] Tracking interaction failed:", err.message));

    return this.getWishlist(userId);
  },

  /**
   * Remove a product from the user's wishlist.
   * @param {string} userId
   * @param {string} productId
   */
  async removeFromWishlist(userId, productId) {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    } else {
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId
      );
      await wishlist.save();
    }

    // Record server-side WISHLIST remove interaction
    interactionService
      .createInteraction({
        userId,
        productId,
        type: "WISHLIST",
        metadata: { action: "remove" }
      })
      .catch((err) => console.warn("[WishlistService] Tracking interaction failed:", err.message));

    return this.getWishlist(userId);
  },

  /**
   * Move item from wishlist into user's cart.
   * @param {string} userId
   * @param {string} productId
   * @param {Object} [customization]
   */
  async moveToCart(userId, productId, customization = null) {
    // 1. Add to cart
    const cart = await cartService.addItem(userId, {
      productId,
      quantity: 1,
      customization
    });

    // 2. Remove from wishlist
    const wishlist = await this.removeFromWishlist(userId, productId);

    return { cart, wishlist };
  }
};

export default wishlistService;
