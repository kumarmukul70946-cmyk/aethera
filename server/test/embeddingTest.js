import "dotenv/config";
import mongoose from "mongoose";
import { User, Product, Category } from "../src/models/index.js";
import {
  buildProductEmbeddingText,
  computeEmbeddingHash
} from "../src/utils/embeddingTextBuilder.js";
import {
  generateEmbedding,
  generateDeterministicMockEmbedding,
  getEmbeddingConfig,
  PROVIDER_CONFIGS
} from "../src/services/embeddingService.js";
import {
  generateProductEmbedding,
  generateProductEmbeddingsBatch
} from "../src/services/productEmbeddingService.js";
import {
  getSimilarProducts,
  getStructuredFallback
} from "../src/services/similarProductService.js";
import app from "../src/app.js";

const TEST_PORT = 5002;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

let testsPassed = 0;
let testsFailed = 0;
let serverInstance = null;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

const extractCookie = (res) => {
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return "";
  const match = setCookie.match(/token=[^;]+/);
  return match ? match[0] : "";
};

const makeClient = (initialCookie = "") => {
  let cookie = initialCookie;
  return {
    setCookie: (c) => {
      cookie = c;
    },
    getCookie: () => cookie,
    request: async (endpoint, options = {}) => {
      const headers = {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
        ...(options.headers || {})
      };

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      const newCookie = extractCookie(res);
      if (newCookie) {
        cookie = newCookie;
      }

      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        // non-JSON
      }

      return {
        status: res.status,
        headers: res.headers,
        data
      };
    }
  };
};

async function runTests() {
  console.log("\n=======================================================");
  console.log("   AETHERA COMMERCE — PART 14 EMBEDDINGS & SIMILARITY  ");
  console.log("=======================================================\n");

  try {
    // 1. Connect Mongoose to local MongoDB
    if (mongoose.connection.readyState === 0) {
      const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aethera_commerce";
      await mongoose.connect(mongoUri);
    }

    // 2. Start HTTP server on isolated TEST_PORT
    await new Promise((resolve) => {
      serverInstance = app.listen(TEST_PORT, () => {
        resolve();
      });
    });

    // ── Test 1: Product embedding text generation & determinism ──
    console.log("\n[Test Suite 1: Text Builder & Determinism]");
    const sampleProduct = {
      name: "Aether Pro Stride",
      category: { name: "Footwear", slug: "footwear" },
      brand: "Aether",
      description: "Supercritical foam running shoes engineered for endurance.",
      tags: ["running", "marathon", "cushion"],
      specifications: new Map([
        ["Weight", "210g"],
        ["Drop", "8mm"],
        ["Outsole", "Carbon rubber"]
      ]),
      colors: ["Midnight", "Volt"],
      sizes: ["US 9", "US 10"],
      price: 14999, // Should NOT be in text
      stock: 50,    // Should NOT be in text
      rating: 4.9   // Should NOT be in text
    };

    const text1 = buildProductEmbeddingText(sampleProduct);
    const text2 = buildProductEmbeddingText(sampleProduct);

    assert(typeof text1 === "string" && text1.length > 0, "Embedding text is a non-empty string");
    assert(text1.includes("Product: Aether Pro Stride"), "Includes product name");
    assert(text1.includes("Category: Footwear"), "Includes category name");
    assert(text1.includes("Brand: Aether"), "Includes brand");
    assert(text1.includes("Description: Supercritical foam"), "Includes description");
    assert(text1.includes("Tags: cushion, marathon, running"), "Tags are normalized and sorted");
    assert(text1.includes("Drop: 8mm") && text1.includes("Weight: 210g"), "Specifications are included");
    assert(!text1.includes("14999") && !text1.includes("50") && !text1.includes("4.9"), "Excludes volatile pricing, stock, and rating metrics");
    assert(text1 === text2, "Embedding text generation is strictly deterministic across calls");

    // ── Test 2: SHA-256 Hash Generation & Invariance ──
    console.log("\n[Test Suite 2: Content Hashing & Change Detection]");
    const hash1 = computeEmbeddingHash(text1);
    const hash2 = computeEmbeddingHash(text2);

    assert(typeof hash1 === "string" && hash1.length === 64, "SHA-256 hash has length 64");
    assert(hash1 === hash2, "Identical source text yields identical hash");

    const modifiedProduct = { ...sampleProduct, description: "Updated marathon shoe with enhanced upper mesh." };
    const modifiedText = buildProductEmbeddingText(modifiedProduct);
    const modifiedHash = computeEmbeddingHash(modifiedText);

    assert(modifiedHash !== hash1, "Changed product content produces a distinct hash");

    // ── Test 3: Unchanged product does not regenerate embedding ──
    console.log("\n[Test Suite 3: Caching & Redundant Embedding Prevention]");
    const targetDoc = await Product.findOne({ isActive: true });
    if (!targetDoc) {
      throw new Error("No active product found in database to run tests against.");
    }

    // Generate once
    const firstGen = await generateProductEmbedding(targetDoc._id, { force: true });
    assert(firstGen.success && firstGen.updated, "Initial embedding generated successfully");

    // Attempt second generation without changes
    const secondGen = await generateProductEmbedding(targetDoc._id, { force: false });
    assert(secondGen.success && secondGen.updated === false && secondGen.reason === "unchanged", "Unchanged product skips embedding generation (0 redundant API calls)");

    // ── Test 4: Changed description triggers re-embedding ──
    console.log("\n[Test Suite 4: Semantic Mutation Re-embedding]");
    const originalDesc = targetDoc.description;
    await Product.findByIdAndUpdate(targetDoc._id, {
      description: originalDesc + " — Special Performance Edition"
    });

    const thirdGen = await generateProductEmbedding(targetDoc._id, { force: false });
    assert(thirdGen.success && thirdGen.updated === true, "Modified product triggers re-embedding");

    // Restore original description
    await Product.findByIdAndUpdate(targetDoc._id, { description: originalDesc });
    await generateProductEmbedding(targetDoc._id, { force: true });

    // ── Test 5: Embedding Service & Error Handling ──
    console.log("\n[Test Suite 5: Provider Isolation & Error Handling]");
    const mockVector = await generateEmbedding("comfortable running shoes", { provider: "mock" });
    assert(Array.isArray(mockVector) && mockVector.length === 1536, "Mock provider generates 1536-dimensional vector");

    let threwEmpty = false;
    try {
      await generateEmbedding("");
    } catch (e) {
      threwEmpty = true;
      assert(e.statusCode === 400, "Empty text validation throws 400 error");
    }
    assert(threwEmpty, "Rejects empty text");

    let threwAuth = false;
    try {
      await generateEmbedding("test", { provider: "openai", apiKey: "" });
    } catch (e) {
      threwAuth = true;
      assert(!e.message.includes("sk-"), "Error message never exposes secret keys");
    }
    assert(threwAuth, "Missing API key fails safely without exposing secrets");

    // ── Test 6: API Secrecy — Raw embeddings are NOT exposed ──
    console.log("\n[Test Suite 6: Security & Vector Projection]");
    const client = makeClient();
    const prodRes = await client.request(`/products/${targetDoc._id}`);
    assert(prodRes.status === 200, "Fetched product details successfully");
    assert(prodRes.data?.data?.product?.embedding === undefined, "Normal product details query omits raw embedding");
    assert(prodRes.data?.data?.product?.embeddingSourceHash === undefined, "Normal product details query omits hash");

    const listRes = await client.request("/products?limit=2");
    assert(listRes.status === 200, "Fetched product listing successfully");
    const anyHasEmbedding = listRes.data?.data?.products?.some((p) => p.embedding !== undefined);
    assert(!anyHasEmbedding, "Catalog listing endpoint never exposes raw vectors");

    // ── Test 7: Similar Product Endpoint (`GET /api/products/:id/similar`) ──
    console.log("\n[Test Suite 7: Similar Products Endpoint & Filtering]");
    const simRes = await client.request(`/products/${targetDoc._id}/similar?limit=4`);
    assert(simRes.status === 200, "GET /api/products/:id/similar returns 200 OK");
    assert(simRes.data?.success === true, "Response has success: true format");
    assert(Array.isArray(simRes.data?.data?.products), "Returns array of products");

    const similarProds = simRes.data?.data?.products;

    // Test 8: Current product is excluded
    const hasCurrent = similarProds.some((p) => p._id.toString() === targetDoc._id.toString());
    assert(!hasCurrent, "Current product is strictly excluded from similar results");

    // Test 9: Inactive products are excluded
    const hasInactive = similarProds.some((p) => p.isActive === false);
    assert(!hasInactive, "Inactive or discontinued products are strictly excluded");

    // Test 10: Limit validation
    const limitRes = await client.request(`/products/${targetDoc._id}/similar?limit=3`);
    assert(limitRes.data?.data?.products?.length <= 3, "Limit parameter correctly bounds results");

    const invalidLimit = await client.request(`/products/${targetDoc._id}/similar?limit=999`);
    assert(invalidLimit.status === 400, "Excessive limit (> 20) is rejected with 400 validation error");

    const invalidId = await client.request("/products/not-a-mongo-id/similar");
    assert(invalidId.status === 400, "Malformed product ID is rejected with 400 validation error");

    // Test 11: Similar products do not expose raw embeddings
    const simHasVectors = similarProds.some((p) => p.embedding !== undefined);
    assert(!simHasVectors, "Similar products API does not return raw vector arrays");

    // ── Test 12: Admin Bulk Generation Security ──
    console.log("\n[Test Suite 8: Admin RBAC & Bulk Embedding Endpoints]");
    // Anonymous call must be rejected
    const unauthRes = await client.request("/admin/products/generate-embeddings", {
      method: "POST",
      body: { batchSize: 10 }
    });
    assert(unauthRes.status === 401, "Anonymous request to bulk generation is rejected (401 Unauthorized)");

    // Customer call must be rejected
    const custEmail = `shopper_${Date.now()}@aethera.com`;
    const custClient = makeClient();
    await custClient.request("/auth/register", {
      method: "POST",
      body: {
        name: "Regular Shopper",
        email: custEmail,
        password: "CustomerPassword123!"
      }
    });

    const custBulkRes = await custClient.request("/admin/products/generate-embeddings", {
      method: "POST",
      body: { batchSize: 10 }
    });
    assert(custBulkRes.status === 403, "Customer user is forbidden from bulk generation (403 Forbidden)");

    // Admin login and generation
    const adminClient = makeClient();
    const adminLogin = await adminClient.request("/auth/login", {
      method: "POST",
      body: {
        email: process.env.ADMIN_EMAIL || "admin@aethera.com",
        password: process.env.ADMIN_PASSWORD || "AdminPassword123!"
      }
    });

    assert(adminLogin.status === 200, "Admin authenticated successfully");

    const adminBulkRes = await adminClient.request("/admin/products/generate-embeddings", {
      method: "POST",
      body: { batchSize: 20, force: false }
    });
    assert(adminBulkRes.status === 200, "Admin bulk generation succeeds with 200 OK");
    assert(adminBulkRes.data?.data?.total > 0, "Bulk generation processed catalog products");
    assert(typeof adminBulkRes.data?.data?.skipped === "number", "Reports skipped (cached) count");

    // ── Test 13: Structured Fallback Strategy ──
    console.log("\n[Test Suite 9: Resilient Fallback Strategy]");
    const fallbackResults = await getStructuredFallback(targetDoc, 4);
    assert(Array.isArray(fallbackResults), "Structured fallback returns an array");
    assert(fallbackResults.length > 0, "Structured fallback successfully retrieved candidate items");
    const fallbackHasCurrent = fallbackResults.some((p) => p._id.toString() === targetDoc._id.toString());
    assert(!fallbackHasCurrent, "Fallback excludes the target product");
    assert(fallbackResults.every((p) => p.similarityScore !== undefined), "Fallback attaches heuristic similarityScore signal");

  } catch (err) {
    console.error(`\n❌ Test execution encountered unhandled error:`, err);
    testsFailed++;
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    console.log("\n=======================================================");
    console.log(`  TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
    console.log("=======================================================\n");

    if (testsFailed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runTests();
