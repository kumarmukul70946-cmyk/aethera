import wishlistService from "../services/wishlistService.js";

/**
 * Wishlist Controller
 */
export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user._id);

    res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: { wishlist }
    });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.addToWishlist(
      req.user._id,
      req.params.productId
    );

    res.status(200).json({
      success: true,
      message: "Product added to wishlist successfully",
      data: { wishlist }
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.removeFromWishlist(
      req.user._id,
      req.params.productId
    );

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
      data: { wishlist }
    });
  } catch (error) {
    next(error);
  }
};

export const moveToCart = async (req, res, next) => {
  try {
    const result = await wishlistService.moveToCart(
      req.user._id,
      req.params.productId,
      req.body.customization
    );

    res.status(200).json({
      success: true,
      message: "Product moved from wishlist to cart successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart
};
