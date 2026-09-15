import orderService from "../services/orderService.js";

/**
 * Admin Order Controller
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrdersAdmin(req.query);

    res.status(200).json({
      success: true,
      message: "Admin orders fetched successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(null, req.params.id, true);

    res.status(200).json({
      success: true,
      message: "Admin order details fetched successfully",
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatusAdmin(
      req.params.id,
      req.body.status
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllOrders,
  getOrderById,
  updateOrderStatus
};
