import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { generateProductEmbedding } from "./productEmbeddingService.js";

/**
 * Helper to escape regex special characters.
 */
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Generate a URL-safe slug.
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
 * Retrieve paginated, filtered, and sorted products.
 */
export const getProducts = async (params = {}) => {
  const {
    page = 1,
    limit = 12,
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    sort,
    isFeatured,
    discount,
    minDiscount,
    hasDiscount,
    includeInactive = false
  } = params;

  // Sanitize pagination limits
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (parsedPage - 1) * parsedLimit;

  // 1. Build dynamic MongoDB query filter
  const filter = {};

  // Active status
  if (!includeInactive) {
    filter.isActive = true;
  }

  // Featured flag
  if (isFeatured !== undefined) {
    filter.isFeatured = isFeatured === true || isFeatured === "true";
  }

  // Discount / Deals filter
  if (discount === true || discount === "true" || hasDiscount === true || hasDiscount === "true") {
    if (minDiscount && !isNaN(Number(minDiscount)) && Number(minDiscount) > 0) {
      filter.discount = { $gte: Number(minDiscount) };
    } else {
      filter.discount = { $gt: 0 };
    }
  } else if (minDiscount && !isNaN(Number(minDiscount)) && Number(minDiscount) > 0) {
    filter.discount = { $gte: Number(minDiscount) };
  }

  // Category filter: Supports MongoDB ObjectId or Category slug
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category = new mongoose.Types.ObjectId(category);
    } else {
      const foundCategory = await Category.findOne({
        slug: category.toLowerCase().trim()
      }).lean();

      if (foundCategory) {
        filter.category = foundCategory._id;
      } else {
        // If category slug does not exist, return empty result set safely
        return {
          products: [],
          pagination: {
            page: parsedPage,
            limit: parsedLimit,
            total: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false
          }
        };
      }
    }
  }

  // Brand filter (case-insensitive)
  if (brand && brand.trim()) {
    filter.brand = new RegExp(`^${escapeRegex(brand.trim())}$`, "i");
  }

  // Price range filtering (based on finalPrice)
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.finalPrice = {};
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      filter.finalPrice.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      filter.finalPrice.$lte = Number(maxPrice);
    }
  }

  // Minimum rating filter
  if (rating !== undefined && !isNaN(Number(rating))) {
    filter.rating = { $gte: Number(rating) };
  }

  // Discount / Deals filter
  const isDiscountRequested =
    discount === true ||
    discount === "true" ||
    discount === "1" ||
    hasDiscount === true ||
    hasDiscount === "true";

  if (minDiscount !== undefined && !isNaN(Number(minDiscount))) {
    filter.discount = { $gte: Math.max(Number(minDiscount), 1) };
  } else if (isDiscountRequested) {
    filter.discount = { $gt: 0 };
  }

  // Keyword search across name, brand, description, and tags
  if (search && search.trim()) {
    const keywordRegex = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [
      { name: keywordRegex },
      { brand: keywordRegex },
      { description: keywordRegex },
      { tags: { $in: [keywordRegex] } }
    ];
  }

  // 2. Map user-friendly sort option to MongoDB sort spec
  let sortOption = { createdAt: -1 }; // default newest
  switch (sort) {
    case "price_asc":
      sortOption = { finalPrice: 1 };
      break;
    case "price_desc":
      sortOption = { finalPrice: -1 };
      break;
    case "rating":
      sortOption = { rating: -1, reviewCount: -1 };
      break;
    case "newest":
      sortOption = { createdAt: -1 };
      break;
    case "popular":
      sortOption = { salesCount: -1, rating: -1, createdAt: -1 };
      break;
    case "discount_desc":
      sortOption = { discount: -1, finalPrice: 1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  // 3. Execute count and find queries with .lean() for read performance
  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("category", "name slug")
    .sort(sortOption)
    .skip(skip)
    .limit(parsedLimit)
    .lean();

  const totalPages = Math.ceil(total / parsedLimit) || 1;

  return {
    products,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages,
      hasNextPage: parsedPage < totalPages,
      hasPreviousPage: parsedPage > 1
    }
  };
};

/**
 * Fetch a single product by ObjectId.
 */
export const getProductById = async (id, includeInactive = false) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid product ID format.");
    error.statusCode = 400;
    throw error;
  }

  const query = { _id: id };
  if (!includeInactive) {
    query.isActive = true;
  }

  const product = await Product.findOne(query)
    .populate("category", "name slug description")
    .lean();

  if (!product) {
    const error = new Error("Product not found.");
    error.statusCode = 404;
    throw error;
  }

  return product;
};

/**
 * Fetch a single product by URL slug.
 */
export const getProductBySlug = async (slug, includeInactive = false) => {
  const normalizedSlug = slug.toLowerCase().trim();
  const query = { slug: normalizedSlug };

  if (!includeInactive) {
    query.isActive = true;
  }

  const product = await Product.findOne(query)
    .populate("category", "name slug description")
    .lean();

  if (!product) {
    const error = new Error(`Product with slug '${slug}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  return product;
};

/**
 * Fetch featured products.
 */
export const getFeaturedProducts = async (query = {}) => {
  return getProducts({
    ...query,
    isFeatured: true,
    includeInactive: false
  });
};

/**
 * Fetch trending products (ordered by salesCount, rating, createdAt).
 */
export const getTrendingProducts = async (query = {}) => {
  return getProducts({
    ...query,
    sort: "popular",
    includeInactive: false
  });
};

/**
 * Create a new product (Admin only).
 * Server calculates finalPrice and prevents client override of rating/salesCount.
 */
export const createProduct = async (data) => {
  const {
    name,
    slug,
    description,
    category,
    brand,
    price,
    discount = 0,
    images = [],
    model3D = null,
    colors = [],
    sizes = [],
    specifications = {},
    stock = 0,
    tags = [],
    isFeatured = false
  } = data;

  // Validate category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    const error = new Error("Referenced category does not exist.");
    error.statusCode = 400;
    throw error;
  }

  // Generate unique slug
  let candidateSlug = slug ? slugify(slug) : slugify(name);
  const existingSlug = await Product.findOne({ slug: candidateSlug });
  if (existingSlug) {
    candidateSlug = `${candidateSlug}-${Date.now().toString().slice(-4)}`;
  }

  // Server calculation of finalPrice
  const parsedPrice = Number(price);
  const parsedDiscount = Number(discount) || 0;
  const finalPrice = Math.round(parsedPrice * (1 - parsedDiscount / 100));

  const product = await Product.create({
    name: name.trim(),
    slug: candidateSlug,
    description: description.trim(),
    category,
    brand: brand.trim(),
    price: parsedPrice,
    discount: parsedDiscount,
    finalPrice,
    images,
    model3D,
    colors,
    sizes,
    specifications,
    stock: Number(stock) || 0,
    tags,
    isFeatured: Boolean(isFeatured),
    isActive: true,
    rating: 0,
    reviewCount: 0,
    salesCount: 0
  });

  // Non-blocking embedding generation for new product
  generateProductEmbedding(product._id).catch((err) => {
    console.warn(`[ProductService] Background embedding generation failed for ${product._id}:`, err.message);
  });

  return Product.findById(product._id).populate("category", "name slug");
};

/**
 * Update product fields (Admin only).
 * Recalculates finalPrice on server if price or discount changes.
 */
export const updateProduct = async (id, updates) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid product ID format.");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(id);
  if (!product) {
    const error = new Error("Product not found.");
    error.statusCode = 404;
    throw error;
  }

  // Prevent client from mutating protected statistics and vector fields
  delete updates.rating;
  delete updates.reviewCount;
  delete updates.salesCount;
  delete updates.finalPrice;
  delete updates.embedding;
  delete updates.embeddingSourceHash;

  // Track if any semantic fields are changing to trigger re-embedding
  const semanticFields = ["name", "description", "category", "brand", "tags", "specifications", "colors", "sizes"];
  const hasSemanticChanges = semanticFields.some((field) => updates[field] !== undefined);

  // Validate category if being updated
  if (updates.category) {
    const catExists = await Category.findById(updates.category);
    if (!catExists) {
      const error = new Error("Referenced category does not exist.");
      error.statusCode = 400;
      throw error;
    }
  }

  // Handle slug change if provided
  if (updates.slug) {
    const candidateSlug = slugify(updates.slug);
    if (candidateSlug !== product.slug) {
      const existing = await Product.findOne({ slug: candidateSlug });
      if (existing) {
        const error = new Error(`Product slug '${candidateSlug}' is already taken.`);
        error.statusCode = 400;
        throw error;
      }
      updates.slug = candidateSlug;
    }
  }

  // Recalculate finalPrice if price or discount is changing
  if (updates.price !== undefined || updates.discount !== undefined) {
    const newPrice = updates.price !== undefined ? Number(updates.price) : product.price;
    const newDiscount = updates.discount !== undefined ? Number(updates.discount) : product.discount;
    updates.finalPrice = Math.round(newPrice * (1 - newDiscount / 100));
  }

  Object.assign(product, updates);
  await product.save();

  // Non-blocking embedding update when semantic fields change
  if (hasSemanticChanges) {
    generateProductEmbedding(product._id).catch((err) => {
      console.warn(`[ProductService] Background embedding update failed for ${product._id}:`, err.message);
    });
  }

  return Product.findById(product._id).populate("category", "name slug");
};

/**
 * Update product inventory level (Admin only).
 */
export const updateStock = async (id, stock) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid product ID format.");
    error.statusCode = 400;
    throw error;
  }

  const parsedStock = parseInt(stock, 10);
  if (isNaN(parsedStock) || parsedStock < 0) {
    const error = new Error("Stock must be a non-negative integer.");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(id);
  if (!product) {
    const error = new Error("Product not found.");
    error.statusCode = 404;
    throw error;
  }

  product.stock = parsedStock;
  await product.save();

  return {
    id: product._id,
    name: product.name,
    stock: product.stock
  };
};

/**
 * Soft-delete product (Admin only).
 * Sets isActive to false, protecting order and review integrity.
 */
export const deleteProduct = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid product ID format.");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(id);
  if (!product) {
    const error = new Error("Product not found.");
    error.statusCode = 404;
    throw error;
  }

  product.isActive = false;
  await product.save();

  return true;
};

export default {
  getProducts,
  getProductById,
  getProductBySlug,
  getFeaturedProducts,
  getTrendingProducts,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct
};
