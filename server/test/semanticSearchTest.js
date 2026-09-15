import "dotenv/config";
import mongoose from "mongoose";
import { User, Product, Category, Interaction } from "../src/models/index.js";
import {
  normalizeQuery,
  buildStructuredFilters,
  searchSemantic
} from "../src/services/semanticSearchService.js";
import { generateEmbedding } from "../src/services/embeddingService.js";
import app from "../src/app.js";

const TEST_PORT = 5003;
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
  console.log("   AETHERA COMMERCE — PART 15 SEMANTIC SEARCH TESTS    ");
  console.log("=======================================================\n");

  try {
    // 1. Connect Mongoose to MongoDB
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

    const client = makeClient();

    // ── Test 1: Query Normalization ──
    console.log("\n[Test Suite 1: Query Normalization & Input Sanitization]");
    const rawQuery = "   lightweight   running   shoes   with   cushioning   ";
    const normalized = normalizeQuery(rawQuery);
    assert(normalized === "lightweight running shoes with cushioning", "Collapses multiple spaces and trims outer whitespace");

    const controlCharQuery = "shoes\x00for\x07marathon\x1F";
    const cleaned = normalizeQuery(controlCharQuery);
    assert(cleaned === "shoes for marathon", "Strips non-printable ASCII control characters");

    // ── Test 2: Validation of Empty & Excessively Long Queries ──
    console.log("\n[Test Suite 2: Query Validation]");
    const emptyRes = await client.request("/search/semantic?q=");
    assert(emptyRes.status === 400, "Empty query 'q=' is rejected with 400 Bad Request");

    const whitespaceRes = await client.request("/search/semantic?q=%20%20%20");
    assert(whitespaceRes.status === 400, "Whitespace-only query is rejected with 400 Bad Request");

    const longQuery = "a".repeat(305);
    const longRes = await client.request(`/search/semantic?q=${longQuery}`);
    assert(longRes.status === 400, "Excessively long query (> 300 chars) is rejected with 400 Bad Request");

    // ── Test 3: Pagination Validation ──
    console.log("\n[Test Suite 3: Pagination Parameters Validation]");
    const invalidPage = await client.request("/search/semantic?q=shoes&page=0");
    assert(invalidPage.status === 400, "page < 1 is rejected with 400 Bad Request");

    const invalidLimitZero = await client.request("/search/semantic?q=shoes&limit=0");
    assert(invalidLimitZero.status === 400, "limit < 1 is rejected with 400 Bad Request");

    const invalidLimitExcessive = await client.request("/search/semantic?q=shoes&limit=999");
    assert(invalidLimitExcessive.status === 400, "limit > 50 is rejected with 400 Bad Request");

    // ── Test 4: Price & Rating Validation ──
    console.log("\n[Test Suite 4: Filter Boundaries & Range Validation]");
    const negativePrice = await client.request("/search/semantic?q=shoes&minPrice=-10");
    assert(negativePrice.status === 400, "Negative minPrice is rejected with 400 Bad Request");

    const invertedPrice = await client.request("/search/semantic?q=shoes&minPrice=5000&maxPrice=1000");
    assert(invertedPrice.status === 400, "minPrice > maxPrice is rejected with 400 Bad Request");

    const invalidRating = await client.request("/search/semantic?q=shoes&rating=6");
    assert(invalidRating.status === 400, "Rating > 5 is rejected with 400 Bad Request");

    // ── Test 5: MongoDB Operator Injection Prevention ──
    console.log("\n[Test Suite 5: Injection Protection]");
    const injectionQuery = await client.request("/search/semantic?q[$ne]=test");
    assert(injectionQuery.status === 400, "Nested MongoDB operators in query parameters are rejected");

    // ── Test 6: Query Embedding Generation ──
    console.log("\n[Test Suite 6: Query Embedding Model Consistency]");
    const queryVector = await generateEmbedding("comfortable running shoes");
    assert(Array.isArray(queryVector) && queryVector.length === 1536, "Query embedding matches product embedding dimensions (1536)");

    // ── Test 7: Valid Semantic Search Execution ──
    console.log("\n[Test Suite 7: Semantic Search Execution & Response Shape]");
    const validSearch = await client.request("/search/semantic?q=running%20shoes&page=1&limit=6");
    assert(validSearch.status === 200, "GET /api/search/semantic returns 200 OK");
    assert(validSearch.data?.success === true, "Response has success: true envelope");
    assert(validSearch.data?.data?.query === "running shoes", "Returns normalized query echo");
    assert(Array.isArray(validSearch.data?.data?.products), "Returns array of products");
    assert(typeof validSearch.data?.data?.searchMode === "string", "Specifies searchMode ('semantic' or 'keyword_fallback')");

    const searchData = validSearch.data.data;
    assert(searchData.pagination?.page === 1, "Pagination includes current page");
    assert(searchData.pagination?.limit === 6, "Pagination includes limit");
    assert(typeof searchData.pagination?.total === "number", "Pagination includes total count");
    assert(typeof searchData.pagination?.totalPages === "number", "Pagination includes totalPages");

    // ── Test 8: Security — Raw Embeddings are Never Returned ──
    console.log("\n[Test Suite 8: Security & Secret Protection]");
    const returnedProds = searchData.products || [];
    const hasEmbeddingField = returnedProds.some((p) => p.embedding !== undefined || p.embeddingSourceHash !== undefined);
    assert(!hasEmbeddingField, "Search response strictly excludes raw vector embeddings and internal hashes");

    // ── Test 9: Active & Available Product Filtering ──
    console.log("\n[Test Suite 9: Catalog Availability Rules]");
    const hasInactive = returnedProds.some((p) => p.isActive === false);
    assert(!hasInactive, "Inactive products are never returned in search results");

    const hasZeroStock = returnedProds.some((p) => p.stock <= 0);
    assert(!hasZeroStock, "Out-of-stock products are omitted by default");

    // ── Test 10: Brand & Category Filtering ──
    console.log("\n[Test Suite 10: Structured Metadata Filtering]");
    const sampleCategory = await Category.findOne().lean();
    if (sampleCategory) {
      const catRes = await client.request(`/search/semantic?q=shoes&category=${sampleCategory.slug}`);
      assert(catRes.status === 200, "Search with category slug filter returns 200 OK");
      const allMatchCat = (catRes.data?.data?.products || []).every(
        (p) => String(p.category?._id || p.category) === String(sampleCategory._id)
      );
      assert(allMatchCat, "Category filter strictly confines results to requested category");
    }

    const brandRes = await client.request("/search/semantic?q=shoes&brand=Aether");
    assert(brandRes.status === 200, "Search with brand filter returns 200 OK");
    const allMatchBrand = (brandRes.data?.data?.products || []).every(
      (p) => p.brand?.toLowerCase() === "aether"
    );
    assert(allMatchBrand, "Brand filter strictly confines results to requested brand");

    // ── Test 11: Price Range & Rating Filtering ──
    const priceRes = await client.request("/search/semantic?q=shoes&minPrice=1000&maxPrice=60000");
    assert(priceRes.status === 200, "Search with min/max price returns 200 OK");
    const allWithinPrice = (priceRes.data?.data?.products || []).every(
      (p) => p.finalPrice >= 1000 && p.finalPrice <= 60000
    );
    assert(allWithinPrice, "Price filter strictly enforces price range bounds");

    // ── Test 12: Empty Results Handling ──
    console.log("\n[Test Suite 11: Empty Results & Non-Hallucination]");
    const emptyMatchRes = await client.request("/search/semantic?q=shoes&brand=NonExistentBrandXYZ12345");
    assert(emptyMatchRes.status === 200, "Unmatched query returns 200 OK with clean empty array");
    assert(emptyMatchRes.data?.data?.products?.length === 0, "Does not hallucinate or invent fake products");

    // ── Test 13: Authenticated Search Interaction Tracking ──
    console.log("\n[Test Suite 12: Interaction Tracking Integration]");
    const shopperEmail = `searcher_${Date.now()}@aethera.com`;
    const shopperClient = makeClient();
    const regRes = await shopperClient.request("/auth/register", {
      method: "POST",
      body: {
        name: "Search Shopper",
        email: shopperEmail,
        password: "CustomerPassword123!"
      }
    });
    assert(regRes.status === 201, "Registered shopper customer");

    const trackQuery = `trail running shoes ${Date.now()}`;
    const authSearchRes = await shopperClient.request(`/search/semantic?q=${encodeURIComponent(trackQuery)}`);
    assert(authSearchRes.status === 200, "Authenticated semantic search executes successfully");

    // Wait for background interaction persistence
    await new Promise((r) => setTimeout(r, 400));

    const shopperUser = await User.findOne({ email: shopperEmail }).lean();
    const searchInteraction = await Interaction.findOne({
      user: shopperUser._id,
      type: "SEARCH"
    }).lean();

    assert(searchInteraction !== null, "Authenticated search generates an Interaction record of type 'SEARCH'");
    assert(searchInteraction?.metadata?.query === trackQuery, "Interaction metadata stores clean search query");
    assert(searchInteraction?.metadata?.source === "semantic_search", "Interaction records semantic_search source");

    // ── Test 14: Direct Service Layer Execution & Fallback Resilience ──
    console.log("\n[Test Suite 13: Service Layer & Resilient Fallback]");
    const directResult = await searchSemantic({
      q: "lightweight ergonomic headphones",
      limit: 4
    });
    assert(Array.isArray(directResult.products), "Direct service call returns products array");
    assert(typeof directResult.searchMode === "string", "Direct result includes searchMode indicator");
    assert(directResult.pagination?.limit === 4, "Direct result respects custom limit");

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
