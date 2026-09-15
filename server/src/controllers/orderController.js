import orderService from "../services/orderService.js";

/**
 * Customer Order Controller
 */
export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const result = await orderService.getCustomerOrders(req.user._id, req.query);

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(
      req.user._id,
      req.params.id,
      false
    );

    res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder
};
