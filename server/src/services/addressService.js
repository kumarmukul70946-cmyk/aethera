import { Address } from "../models/index.js";

export const addressService = {
  /**
   * Get all addresses belonging to the authenticated user.
   * @param {string} userId
   */
  async getAddresses(userId) {
    const addresses = await Address.find({ user: userId }).sort({
      isDefault: -1,
      createdAt: -1
    });
    return addresses;
  },

  /**
   * Create a new address for user.
   * Ensures single default address rule.
   * @param {string} userId
   * @param {Object} data - Address attributes
   */
  async createAddress(userId, data) {
    const existingCount = await Address.countDocuments({ user: userId });

    // First address is automatically default; or if user requested default
    const isDefault = data.isDefault === true || existingCount === 0;

    if (isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    const address = await Address.create({
      user: userId,
      fullName: data.fullName,
      phone: data.phone,
      addressLine: data.addressLine,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country || "India",
      isDefault
    });

    return address;
  },

  /**
   * Update existing address.
   * Validates ownership before modification.
   * @param {string} userId
   * @param {string} addressId
   * @param {Object} updateData
   */
  async updateAddress(userId, addressId, updateData) {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      const err = new Error("Address not found or unauthorized");
      err.statusCode = 404;
      throw err;
    }

    if (updateData.isDefault === true) {
      await Address.updateMany({ user: userId }, { isDefault: false });
      address.isDefault = true;
    } else if (updateData.isDefault === false && address.isDefault) {
      // Don't unset default if it's the only address
      const totalAddresses = await Address.countDocuments({ user: userId });
      if (totalAddresses > 1) {
        address.isDefault = false;
      }
    }

    if (updateData.fullName) address.fullName = updateData.fullName;
    if (updateData.phone) address.phone = updateData.phone;
    if (updateData.addressLine) address.addressLine = updateData.addressLine;
    if (updateData.city) address.city = updateData.city;
    if (updateData.state) address.state = updateData.state;
    if (updateData.postalCode) address.postalCode = updateData.postalCode;
    if (updateData.country) address.country = updateData.country;

    await address.save();
    return address;
  },

  /**
   * Delete an address belonging to the user.
   * If the deleted address was default, promote another address to default.
   * @param {string} userId
   * @param {string} addressId
   */
  async deleteAddress(userId, addressId) {
    const address = await Address.findOneAndDelete({
      _id: addressId,
      user: userId
    });

    if (!address) {
      const err = new Error("Address not found or unauthorized");
      err.statusCode = 404;
      throw err;
    }

    // If deleted address was default, set the latest remaining address as default
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ user: userId }).sort({
        createdAt: -1
      });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    return { message: "Address deleted successfully" };
  },

  /**
   * Set selected address as the user's default address.
   * @param {string} userId
   * @param {string} addressId
   */
  async setDefaultAddress(userId, addressId) {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      const err = new Error("Address not found or unauthorized");
      err.statusCode = 404;
      throw err;
    }

    await Address.updateMany({ user: userId }, { isDefault: false });

    address.isDefault = true;
    await address.save();

    return address;
  }
};

export default addressService;
