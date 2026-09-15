import cartService from "../services/cartService.js";

/**
 * Cart Controller
 */
export const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user._id);

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const cart = await cartService.addItem(req.user._id, req.body);

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const cart = await cartService.updateItem(
      req.user._id,
      req.params.productId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeItem(
      req.user._id,
      req.params.productId
    );

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user._id);

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart
};
