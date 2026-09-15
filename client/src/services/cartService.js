import api from "./api.js";

/**
 * Customer Cart Service
 */
export const cartService = {
  async getCart() {
    const res = await api.get("/cart");
    return res.data.data.cart;
  },

  async addItem({ productId, quantity = 1, customization = null }) {
    const res = await api.post("/cart/items", {
      productId,
      quantity,
      customization
    });
    return res.data.data.cart;
  },

  async updateItem(productId, { quantity }) {
    const res = await api.put(`/cart/items/${productId}`, { quantity });
    return res.data.data.cart;
  },

  async removeItem(productId) {
    const res = await api.delete(`/cart/items/${productId}`);
    return res.data.data.cart;
  },

  async clearCart() {
    const res = await api.delete("/cart");
    return res.data.data.cart;
  }
};

export default cartService;
