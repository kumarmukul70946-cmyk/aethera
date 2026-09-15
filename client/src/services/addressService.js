import api from "./api.js";

/**
 * Customer Address Service
 */
export const addressService = {
  async getAddresses() {
    const res = await api.get("/addresses");
    return res.data.data.addresses;
  },

  async createAddress(addressData) {
    const res = await api.post("/addresses", addressData);
    return res.data.data.address;
  },

  async updateAddress(id, addressData) {
    const res = await api.put(`/addresses/${id}`, addressData);
    return res.data.data.address;
  },

  async deleteAddress(id) {
    const res = await api.delete(`/addresses/${id}`);
    return res.data;
  },

  async setDefaultAddress(id) {
    const res = await api.patch(`/addresses/${id}/default`);
    return res.data.data.address;
  }
};

export default addressService;
