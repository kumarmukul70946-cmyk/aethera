import api from "./api.js";

/**
 * Customer Wishlist Service
 */
export const wishlistService = {
  async getWishlist() {
    const res = await api.get("/wishlist");
    return res.data.data.wishlist;
  },

  async addItem(productId) {
    const res = await api.post(`/wishlist/${productId}`);
    return res.data.data.wishlist;
  },

  async removeItem(productId) {
    const res = await api.delete(`/wishlist/${productId}`);
    return res.data.data.wishlist;
  },

  async moveToCart(productId, customization = null) {
    const res = await api.post(`/wishlist/${productId}/move-to-cart`, {
      customization
    });
    return res.data.data;
  }
};

export default wishlistService;
