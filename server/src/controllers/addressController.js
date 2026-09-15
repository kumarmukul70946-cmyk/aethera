import addressService from "../services/addressService.js";

/**
 * Address Controller
 */
export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await addressService.getAddresses(req.user._id);

    res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: { addresses }
    });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const address = await addressService.createAddress(req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: { address }
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const address = await addressService.updateAddress(
      req.user._id,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: { address }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    await addressService.deleteAddress(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      message: "Address deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await addressService.setDefaultAddress(
      req.user._id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Default address set successfully",
      data: { address }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
