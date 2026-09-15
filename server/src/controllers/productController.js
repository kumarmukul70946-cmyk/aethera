import productService from "../services/productService.js";
import similarProductService from "../services/similarProductService.js";

/**
 * List products with pagination, filtering, sorting, and search.
 * @route GET /api/products
 * @access Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search products by keyword query.
 * @route GET /api/products/search
 * @access Public
 */
export const searchProducts = async (req, res, next) => {
  try {
    const searchQuery = req.query.q || req.query.search;
    const result = await productService.getProducts({
      ...req.query,
      search: searchQuery
    });

    res.status(200).json({
      success: true,
      message: "Search results fetched successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured products.
 * @route GET /api/products/featured
 * @access Public
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const result = await productService.getFeaturedProducts(req.query);

    res.status(200).json({
      success: true,
      message: "Featured products fetched successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get trending products.
 * @route GET /api/products/trending
 * @access Public
 */
export const getTrendingProducts = async (req, res, next) => {
  try {
    const result = await productService.getTrendingProducts(req.query);

    res.status(200).json({
      success: true,
      message: "Trending products fetched successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product by ObjectId.
 * @route GET /api/products/:id
 * @access Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product by URL slug.
 * @route GET /api/products/slug/:slug
 * @access Public
 */
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product.
 * @route POST /api/products
 * @access Protected (Admin only)
 */
export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing product.
 * @route PUT /api/products/:id
 * @access Protected (Admin only)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product stock level.
 * @route PATCH /api/products/:id/stock
 * @access Protected (Admin only)
 */
export const updateStock = async (req, res, next) => {
  try {
    const result = await productService.updateStock(req.params.id, req.body.stock);

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete (soft-delete) a product.
 * @route DELETE /api/products/:id
 * @access Protected (Admin only)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get semantically similar products via MongoDB Atlas Vector Search.
 * @route GET /api/products/:id/similar
 * @access Public
 */
export const getSimilarProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit } = req.query;

    const result = await similarProductService.getSimilarProducts(id, limit);

    res.status(200).json({
      success: true,
      message: "Similar products fetched successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getProducts,
  searchProducts,
  getFeaturedProducts,
  getTrendingProducts,
  getProductById,
  getProductBySlug,
  getSimilarProducts,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct
};
