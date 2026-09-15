import api from "./api.js";

/**
 * Customer Order Service
 */
export const orderService = {
  async createOrder({ shippingAddressId, couponCode, paymentMethod = "COD" }) {
    const res = await api.post("/orders", {
      shippingAddressId,
      couponCode,
      paymentMethod
    });
    return res.data.data.order;
  },

  async getOrders(params = {}) {
    const res = await api.get("/orders", { params });
    return res.data.data;
  },

  async getOrderById(id) {
    const res = await api.get(`/orders/${id}`);
    return res.data.data.order;
  },

  async cancelOrder(id) {
    const res = await api.patch(`/orders/${id}/cancel`);
    return res.data.data.order;
  }
};

export default orderService;
