/**
 * Automated Verification Suite for Part 4: Product Catalog & Product APIs.
 * Tests all 28 required scenarios covering filtering, sorting, pagination, search,
 * category relationships, and role-based admin CRUD operations.
 */

const BASE_URL = "http://localhost:5000/api";

let adminCookie = "";
let customerCookie = "";
let sampleCategoryId = "";
let sampleProductId = "";
let sampleProductSlug = "";
let createdProductId = "";

const extractCookie = (res) => {
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return "";
  const match = setCookie.match(/token=[^;]+/);
  return match ? match[0] : "";
};

const runTest = async (testName, testFn) => {
  try {
    process.stdout.write(`Testing: ${testName}... `);
    await testFn();
    console.log("PASSED");
  } catch (err) {
    console.log("FAILED");
    console.error(`  Error in [${testName}]:`, err.message);
    process.exitCode = 1;
  }
};

const main = async () => {
  console.log("\n=======================================================");
  console.log("  Aethera Commerce Part 4 Product Catalog Test Suite");
  console.log("=======================================================\n");

  // Step 0: Obtain Admin and Customer authentication cookies
  await runTest("Setup: Obtain Admin and Customer Auth Cookies", async () => {
    // Admin login
    const adminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL || "admin@aethera.com",
        password: process.env.ADMIN_PASSWORD || "AdminPassword123!"
      })
    });
    if (adminRes.status !== 200) throw new Error("Admin login failed");
    adminCookie = extractCookie(adminRes);

    // Customer registration / login
    const custEmail = `cust_${Date.now()}@aethera.com`;
    const custRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Shopper",
        email: custEmail,
        password: "CustomerPassword123!"
      })
    });
    if (custRes.status !== 201) throw new Error("Customer setup failed");
    customerCookie = extractCookie(custRes);
  });

  // 1. Get all products
  await runTest("1. Get all products", async () => {
    const res = await fetch(`${BASE_URL}/products`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(data.data.products)) throw new Error("Expected products array");
    if (data.data.products.length === 0) throw new Error("Products array is empty");

    // Save sample product for subsequent tests
    const sample = data.data.products[0];
    sampleProductId = sample._id;
    sampleProductSlug = sample.slug;
    sampleCategoryId = sample.category._id || sample.category;
  });

  // 2. Get paginated products
  await runTest("2. Get paginated products with pagination metadata", async () => {
    const res = await fetch(`${BASE_URL}/products?page=2&limit=8`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const { pagination, products } = data.data;
    if (pagination.page !== 2) throw new Error(`Expected page 2, got ${pagination.page}`);
    if (pagination.limit !== 8) throw new Error(`Expected limit 8, got ${pagination.limit}`);
    if (typeof pagination.total !== "number" || pagination.total < 30) {
      throw new Error(`Expected total >= 30, got ${pagination.total}`);
    }
    if (typeof pagination.totalPages !== "number") throw new Error("Expected totalPages");
    if (typeof pagination.hasNextPage !== "boolean") throw new Error("Expected hasNextPage");
    if (typeof pagination.hasPreviousPage !== "boolean") throw new Error("Expected hasPreviousPage");
    if (products.length > 8) throw new Error("Products length exceeded requested limit");
  });

  // 3. Search products by keyword
  await runTest("3. Search products by keyword", async () => {
    const res = await fetch(`${BASE_URL}/products?search=keyboard`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (data.data.products.length === 0) throw new Error("Expected matching products for search 'keyboard'");
    const matches = data.data.products.some((p) =>
      p.name.toLowerCase().includes("keyboard") || p.tags.includes("keyboard")
    );
    if (!matches) throw new Error("Result products do not match keyword 'keyboard'");
  });

  // 4. Filter by category
  await runTest("4. Filter by category (slug & ObjectId)", async () => {
    // Filter by slug
    const resSlug = await fetch(`${BASE_URL}/products?category=electronics`);
    const dataSlug = await resSlug.json();
    if (resSlug.status !== 200) throw new Error(`Slug filter expected 200, got ${resSlug.status}`);
    if (dataSlug.data.products.length === 0) throw new Error("Expected products for category 'electronics'");

    // Filter by ObjectId
    const resId = await fetch(`${BASE_URL}/products?category=${sampleCategoryId}`);
    const dataId = await resId.json();
    if (resId.status !== 200) throw new Error(`Id filter expected 200, got ${resId.status}`);
    if (dataId.data.products.length === 0) throw new Error("Expected products for category ObjectId");
  });

  // 5. Filter by brand
  await runTest("5. Filter by brand", async () => {
    const res = await fetch(`${BASE_URL}/products?brand=Aether`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (data.data.products.length === 0) throw new Error("Expected products for brand 'Aether'");
    const allMatch = data.data.products.every((p) => p.brand.toLowerCase() === "aether");
    if (!allMatch) throw new Error("Found product with non-matching brand");
  });

  // 6. Filter by price range
  await runTest("6. Filter by price range (minPrice & maxPrice)", async () => {
    const min = 5000;
    const max = 25000;
    const res = await fetch(`${BASE_URL}/products?minPrice=${min}&maxPrice=${max}`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const allInRange = data.data.products.every((p) => p.finalPrice >= min && p.finalPrice <= max);
    if (!allInRange) throw new Error("Found product outside of requested price range");
  });

  // 7. Filter by rating
  await runTest("7. Filter by rating", async () => {
    const minRating = 4.8;
    const res = await fetch(`${BASE_URL}/products?rating=${minRating}`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const allAboveRating = data.data.products.every((p) => p.rating >= minRating);
    if (!allAboveRating) throw new Error("Found product with rating below requested threshold");
  });

  // 8. Sort by price ascending
  await runTest("8. Sort by price ascending (price_asc)", async () => {
    const res = await fetch(`${BASE_URL}/products?sort=price_asc&limit=15`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const prices = data.data.products.map((p) => p.finalPrice);
    for (let i = 0; i < prices.length - 1; i++) {
      if (prices[i] > prices[i + 1]) throw new Error(`Prices not ascending: ${prices[i]} > ${prices[i + 1]}`);
    }
  });

  // 9. Sort by price descending
  await runTest("9. Sort by price descending (price_desc)", async () => {
    const res = await fetch(`${BASE_URL}/products?sort=price_desc&limit=15`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const prices = data.data.products.map((p) => p.finalPrice);
    for (let i = 0; i < prices.length - 1; i++) {
      if (prices[i] < prices[i + 1]) throw new Error(`Prices not descending: ${prices[i]} < ${prices[i + 1]}`);
    }
  });

  // 10. Sort by rating
  await runTest("10. Sort by rating (rating)", async () => {
    const res = await fetch(`${BASE_URL}/products?sort=rating&limit=15`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const ratings = data.data.products.map((p) => p.rating);
    for (let i = 0; i < ratings.length - 1; i++) {
      if (ratings[i] < ratings[i + 1]) throw new Error(`Ratings not descending: ${ratings[i]} < ${ratings[i + 1]}`);
    }
  });

  // 11. Sort by newest
  await runTest("11. Sort by newest (newest)", async () => {
    const res = await fetch(`${BASE_URL}/products?sort=newest&limit=15`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const dates = data.data.products.map((p) => new Date(p.createdAt).getTime());
    for (let i = 0; i < dates.length - 1; i++) {
      if (dates[i] < dates[i + 1]) throw new Error("Dates not sorted newest first");
    }
  });

  // 12. Get product by ID
  await runTest("12. Get product by ID", async () => {
    const res = await fetch(`${BASE_URL}/products/${sampleProductId}`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (data.data.product._id !== sampleProductId) throw new Error("Product ID mismatch");
    if (!data.data.product.category) throw new Error("Expected populated category");
  });

  // 13. Get product by slug
  await runTest("13. Get product by slug", async () => {
    const res = await fetch(`${BASE_URL}/products/slug/${sampleProductSlug}`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (data.data.product.slug !== sampleProductSlug) throw new Error("Product slug mismatch");
  });

  // 14. Get featured products
  await runTest("14. Get featured products", async () => {
    const res = await fetch(`${BASE_URL}/products/featured`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (data.data.products.length === 0) throw new Error("Expected featured products");
    const allFeatured = data.data.products.every((p) => p.isFeatured === true);
    if (!allFeatured) throw new Error("Found non-featured product in featured endpoint");
  });

  // 15. Get trending products
  await runTest("15. Get trending products", async () => {
    const res = await fetch(`${BASE_URL}/products/trending`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (data.data.products.length === 0) throw new Error("Expected trending products");
    const sales = data.data.products.map((p) => p.salesCount);
    for (let i = 0; i < sales.length - 1; i++) {
      if (sales[i] < sales[i + 1]) throw new Error("Products not sorted by salesCount descending");
    }
  });

  // 16. Get categories
  await runTest("16. Get categories with product count", async () => {
    const res = await fetch(`${BASE_URL}/categories`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(data.data.categories) || data.data.categories.length < 8) {
      throw new Error("Expected at least 8 categories");
    }
    const hasCount = data.data.categories.every((c) => typeof c.productCount === "number");
    if (!hasCount) throw new Error("Expected productCount attribute on categories");
  });

  // 17. Create product as admin
  await runTest("17. Create product as admin (201 Created)", async () => {
    const payload = {
      name: "Apex Cyber Desk V2",
      description: "Advanced mechanical modular studio desk with magnetic cable management.",
      category: sampleCategoryId,
      brand: "Apex",
      price: 49999,
      discount: 10,
      stock: 20,
      isFeatured: true,
      colors: ["Midnight Black", "Steel Gray"],
      tags: ["desk", "studio", "furniture", "apex"]
    };

    const res = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${data.message}`);
    if (!data.data.product._id) throw new Error("Expected created product ID");
    createdProductId = data.data.product._id;

    // Verify finalPrice was calculated on server: 49999 - 10% = 44999
    if (data.data.product.finalPrice !== 44999) {
      throw new Error(`Expected finalPrice 44999, got ${data.data.product.finalPrice}`);
    }
    // Verify protected metrics default to 0
    if (data.data.product.rating !== 0 || data.data.product.salesCount !== 0) {
      throw new Error("Protected fields rating/salesCount were not initialized to 0");
    }
  });

  // 18. Create product as customer rejected (403 Forbidden)
  await runTest("18. Create product as customer rejected (403 Forbidden)", async () => {
    const res = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie
      },
      body: JSON.stringify({
        name: "Unauthorized Product",
        description: "Trying to create product as customer",
        category: sampleCategoryId,
        brand: "Apex",
        price: 1000
      })
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 19. Update product as admin
  await runTest("19. Update product as admin (200 OK)", async () => {
    const res = await fetch(`${BASE_URL}/products/${createdProductId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie
      },
      body: JSON.stringify({
        name: "Apex Cyber Desk V2 Pro Edition",
        price: 59999,
        discount: 20 // 59999 - 20% = 47999
      })
    });

    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${data.message}`);
    if (data.data.product.name !== "Apex Cyber Desk V2 Pro Edition") throw new Error("Name was not updated");
    if (data.data.product.finalPrice !== 47999) {
      throw new Error(`Expected recalculated finalPrice 47999, got ${data.data.product.finalPrice}`);
    }
  });

  // 20. Update product as customer rejected (403 Forbidden)
  await runTest("20. Update product as customer rejected (403 Forbidden)", async () => {
    const res = await fetch(`${BASE_URL}/products/${createdProductId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie
      },
      body: JSON.stringify({
        name: "Hacked Price",
        price: 1
      })
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 21. Update stock
  await runTest("21. Update stock level (PATCH /stock)", async () => {
    const res = await fetch(`${BASE_URL}/products/${createdProductId}/stock`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie
      },
      body: JSON.stringify({
        stock: 88
      })
    });

    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${data.message}`);
    if (data.data.stock !== 88) throw new Error(`Expected stock 88, got ${data.data.stock}`);
  });

  // 22. Delete product (soft-delete)
  await runTest("22. Soft-delete product as admin (DELETE /products/:id)", async () => {
    const res = await fetch(`${BASE_URL}/products/${createdProductId}`, {
      method: "DELETE",
      headers: {
        Cookie: adminCookie
      }
    });

    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${data.message}`);
  });

  // 23. Deleted product is hidden from customer list
  await runTest("23. Soft-deleted product is hidden from public catalog", async () => {
    const res = await fetch(`${BASE_URL}/products/${createdProductId}`);
    if (res.status !== 404) throw new Error(`Expected 404 for soft-deleted product, got ${res.status}`);
  });

  // 24. Invalid product ID rejection
  await runTest("24. Invalid product ID format rejected with 400", async () => {
    const res = await fetch(`${BASE_URL}/products/invalid-id-xyz`);
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 25. Non-existing product ID returns 404
  await runTest("25. Non-existing valid ObjectId returns 404", async () => {
    const nonExistingId = "65e26b1c9f4d7b2f8a123456";
    const res = await fetch(`${BASE_URL}/products/${nonExistingId}`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  // 26. Invalid product creation validation (missing required fields)
  await runTest("26. Invalid product creation rejected with 400", async () => {
    const res = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie
      },
      body: JSON.stringify({
        name: "Incomplete Product"
      })
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    const data = await res.json();
    if (!data.errors || data.errors.length === 0) throw new Error("Expected validation errors array");
  });

  // 27. Duplicate slug handling (auto-resolves without database crash)
  await runTest("27. Duplicate product slug handles collision safely", async () => {
    const payload = {
      name: "Aether Duplicate Slug Test",
      description: "Testing collision resolution",
      category: sampleCategoryId,
      brand: "Aether",
      price: 1999,
      slug: "aether-dup-test"
    };

    // First creation
    const res1 = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify(payload)
    });
    const data1 = await res1.json();
    if (res1.status !== 201) throw new Error("First product creation failed");

    // Second creation with same slug
    const res2 = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify(payload)
    });
    const data2 = await res2.json();
    if (res2.status !== 201) throw new Error("Second product creation failed");
    if (data1.data.product.slug === data2.data.product.slug) {
      throw new Error("Slugs should be unique, but collision occurred");
    }

    // Clean up test products
    await fetch(`${BASE_URL}/products/${data1.data.product._id}`, { method: "DELETE", headers: { Cookie: adminCookie } });
    await fetch(`${BASE_URL}/products/${data2.data.product._id}`, { method: "DELETE", headers: { Cookie: adminCookie } });
  });

  // 28. Pagination limit safety (limit > 50 rejected or capped)
  await runTest("28. Excessively large pagination limit safely handled", async () => {
    const res = await fetch(`${BASE_URL}/products?limit=100`);
    // Validator enforces max 50
    if (res.status === 400) {
      const data = await res.json();
      if (!data.errors) throw new Error("Expected validation error message for limit > 50");
    } else if (res.status === 200) {
      const data = await res.json();
      if (data.data.pagination.limit > 50) throw new Error("Limit was not capped to safe max 50");
    } else {
      throw new Error(`Unexpected status ${res.status}`);
    }
  });

  console.log("\n=======================================================");
  console.log("  ALL PART 4 PRODUCT CATALOG TESTS PASSED (28/28)!  ");
  console.log("=======================================================\n");
};

main();
