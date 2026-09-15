import categoryService from "../services/categoryService.js";

/**
 * Get all categories with product counts.
 * @route GET /api/categories
 * @access Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single category by ID or slug.
 * @route GET /api/categories/:id
 * @access Public
 */
export const getCategory = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryByIdOrSlug(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new category.
 * @route POST /api/categories
 * @access Protected (Admin only)
 */
export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing category.
 * @route PUT /api/categories/:id
 * @access Protected (Admin only)
 */
export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a category.
 * @route DELETE /api/categories/:id
 * @access Protected (Admin only)
 */
export const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
