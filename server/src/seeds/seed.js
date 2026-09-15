import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Category, Product, Cart, Wishlist, Order, Review, Coupon, Address, Interaction } from "../models/index.js";
import { categoriesData, productsData, couponsData } from "./seedData.js";

/**
 * Clear existing database collections.
 */
const clearDatabase = async () => {
  console.log("[Seed] Clearing collections...");
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
    Wishlist.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
    Coupon.deleteMany({}),
    Address.deleteMany({}),
    Interaction.deleteMany({})
  ]);
  console.log("[Seed] Collections cleared successfully.");
};

/**
 * Seed categories and products into MongoDB.
 */
const seedDatabase = async () => {
  try {
    console.log("[Seed] Connecting to database...");
    await connectDB();

    const isClearOnly = process.argv.includes("--clear");

    if (isClearOnly) {
      await clearDatabase();
      console.log("[Seed] Database cleared. Exiting without seeding new data.");
      await mongoose.connection.close();
      process.exit(0);
    }

    // Step 1: Clear old data
    await clearDatabase();

    // Step 2: Insert categories
    console.log(`[Seed] Inserting ${categoriesData.length} categories...`);
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`[Seed] Successfully inserted ${createdCategories.length} categories.`);

    // Build lookup map: slug -> _id
    const categoryMap = new Map();
    createdCategories.forEach((cat) => {
      categoryMap.set(cat.slug, cat._id);
    });

    // Step 3: Map category ObjectId to products
    const preparedProducts = productsData.map((prod, index) => {
      const categoryId = categoryMap.get(prod.categorySlug);
      if (!categoryId) {
        throw new Error(`Category slug '${prod.categorySlug}' not found in inserted categories.`);
      }

      const { categorySlug, ...productPayload } = prod;
      return {
        ...productPayload,
        category: categoryId,
        isFeatured: prod.isFeatured !== undefined ? prod.isFeatured : index % 4 === 0,
        salesCount: prod.salesCount !== undefined ? prod.salesCount : 40 + ((index * 31) % 350),
        isActive: prod.isActive !== undefined ? prod.isActive : true
      };
    });

    // Step 4: Insert products
    console.log(`[Seed] Inserting ${preparedProducts.length} products...`);
    const createdProducts = await Product.insertMany(preparedProducts);
    console.log(`[Seed] Successfully inserted ${createdProducts.length} products.`);

    // Step 5: Insert coupons
    console.log(`[Seed] Inserting ${couponsData.length} coupons...`);
    const createdCoupons = await Coupon.insertMany(couponsData);
    console.log(`[Seed] Successfully inserted ${createdCoupons.length} coupons.`);

    console.log("\n=========================================");
    console.log("  Aethera Commerce Database Seeded!  ");
    console.log(`  - Categories: ${createdCategories.length}`);
    console.log(`  - Products:   ${createdProducts.length}`);
    console.log(`  - Coupons:    ${createdCoupons.length}`);
    console.log("=========================================\n");

    await mongoose.connection.close();
    console.log("[Seed] Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Seeding failed: ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDatabase();
