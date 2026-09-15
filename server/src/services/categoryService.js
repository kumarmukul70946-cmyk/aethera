import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

/**
 * Generate a URL-friendly slug from a string.
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Fetch all categories with total active product counts.
 */
export const getAllCategories = async () => {
  const categories = await Category.find().sort({ name: 1 }).lean();

  // Aggregate active product counts grouped by category
  const counts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);

  const countMap = new Map();
  counts.forEach((c) => countMap.set(c._id.toString(), c.count));

  return categories.map((cat) => ({
    ...cat,
    productCount: countMap.get(cat._id.toString()) || 0
  }));
};

/**
 * Fetch a single category by ObjectId or slug.
 */
export const getCategoryByIdOrSlug = async (identifier) => {
  let category;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    category = await Category.findById(identifier).lean();
  }

  if (!category) {
    category = await Category.findOne({ slug: identifier.toLowerCase().trim() }).lean();
  }

  if (!category) {
    const error = new Error(`Category '${identifier}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  const productCount = await Product.countDocuments({
    category: category._id,
    isActive: true
  });

  return {
    ...category,
    productCount
  };
};

/**
 * Create a new category (Admin only).
 */
export const createCategory = async ({ name, slug, description, image }) => {
  const generatedSlug = slug ? slugify(slug) : slugify(name);

  // Check uniqueness
  const existing = await Category.findOne({ slug: generatedSlug });
  if (existing) {
    const error = new Error(`A category with slug '${generatedSlug}' already exists.`);
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.create({
    name: name.trim(),
    slug: generatedSlug,
    description: description ? description.trim() : "",
    image: image || ""
  });

  return category;
};

/**
 * Update an existing category (Admin only).
 */
export const updateCategory = async (id, { name, slug, description, image }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid category ID format.");
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.findById(id);
  if (!category) {
    const error = new Error("Category not found.");
    error.statusCode = 404;
    throw error;
  }

  if (name !== undefined) category.name = name.trim();
  if (description !== undefined) category.description = description.trim();
  if (image !== undefined) category.image = image.trim();

  if (slug !== undefined) {
    const newSlug = slugify(slug);
    if (newSlug !== category.slug) {
      const existing = await Category.findOne({ slug: newSlug });
      if (existing) {
        const error = new Error(`A category with slug '${newSlug}' already exists.`);
        error.statusCode = 400;
        throw error;
      }
      category.slug = newSlug;
    }
  }

  await category.save();
  return category;
};

/**
 * Delete category (Admin only).
 * Ensures no active products belong to category prior to deletion.
 */
export const deleteCategory = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid category ID format.");
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.findById(id);
  if (!category) {
    const error = new Error("Category not found.");
    error.statusCode = 404;
    throw error;
  }

  // Guard against deleting categories that currently hold active products
  const activeProductCount = await Product.countDocuments({
    category: id,
    isActive: true
  });

  if (activeProductCount > 0) {
    const error = new Error(
      `Cannot delete category '${category.name}' because it contains ${activeProductCount} active products.`
    );
    error.statusCode = 400;
    throw error;
  }

  await Category.findByIdAndDelete(id);
  return true;
};

export default {
  getAllCategories,
  getCategoryByIdOrSlug,
  createCategory,
  updateCategory,
  deleteCategory
};
