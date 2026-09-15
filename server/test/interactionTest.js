import "dotenv/config";
import mongoose from "mongoose";
import { User, Product, Address, Order, Review, Interaction, Cart, Wishlist } from "../src/models/index.js";
import interactionService from "../src/services/interactionService.js";

const BASE_URL = "http://localhost:5000/api";

let testsPassed = 0;
let testsFailed = 0;

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
        // empty response body
      }

      return {
        status: res.status,
        ok: res.ok,
        data,
        headers: res.headers
      };
    }
  };
};

async function runTests() {
  console.log("\n=======================================================");
  console.log("   AETHERA COMMERCE — PART 12 INTERACTION TRACKING TESTS   ");
  console.log("=======================================================\n");

  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aethera_commerce");

  try {
    // 0. Setup: Create test user and obtain a target product
    const timestamp = Date.now();
    const testUserEmail = `track_tester_${timestamp}@example.com`;
    const client = makeClient();

    const registerRes = await client.request("/auth/register", {
      method: "POST",
      body: {
        name: "Analytics Tester",
        email: testUserEmail,
        password: "Password123!"
      }
    });
    assert(registerRes.status === 201, `Setup: Created test user ${testUserEmail}`);
    const customerUser = await User.findOne({ email: testUserEmail });
    assert(Boolean(customerUser), "Setup: Found customer in MongoDB");

    const sampleProduct = await Product.findOne({ isActive: true });
    assert(Boolean(sampleProduct), `Setup: Found active product '${sampleProduct?.name}'`);

    const anonClient = makeClient();
    const anonSessionId = `anon_session_${timestamp}`;

    // Test 1: Anonymous VIEW event
    const anonViewRes = await anonClient.request("/interactions", {
      method: "POST",
      body: {
        type: "VIEW",
        productId: sampleProduct._id.toString(),
        sessionId: anonSessionId,
        metadata: {
          source: "product_page",
          category: sampleProduct.categorySlug
        }
      }
    });
    assert(anonViewRes.status === 201, "Test 1: Anonymous VIEW returns 201 Created");
    assert(anonViewRes.data?.success === true, "Test 1: Response has success=true");

    const anonDoc = await Interaction.findById(anonViewRes.data?.data?.interactionId);
    assert(anonDoc && anonDoc.user === null, "Test 1: Anonymous interaction has user=null in DB");
    assert(anonDoc?.sessionId === anonSessionId, "Test 1: Anonymous interaction matches sessionId");

    // Test 2: Authenticated VIEW event
    const authViewRes = await client.request("/interactions", {
      method: "POST",
      body: {
        type: "VIEW",
        productId: sampleProduct._id.toString(),
        metadata: {
          source: "homepage_featured",
          category: sampleProduct.categorySlug
        }
      }
    });
    assert(authViewRes.status === 201, "Test 2: Authenticated VIEW returns 201 Created");
    const authDoc = await Interaction.findById(authViewRes.data?.data?.interactionId);
    assert(
      authDoc && authDoc.user?.toString() === customerUser._id.toString(),
      "Test 2: Authenticated interaction correctly records user._id from JWT session"
    );

    // Test 3: SEARCH event with valid query
    const searchRes = await anonClient.request("/interactions", {
      method: "POST",
      body: {
        type: "SEARCH",
        sessionId: anonSessionId,
        metadata: {
          query: "spatial audio headphones",
          source: "navbar"
        }
      }
    });
    assert(searchRes.status === 201, "Test 3: SEARCH event with valid query returns 201 Created");
    const searchDoc = await Interaction.findById(searchRes.data?.data?.interactionId);
    assert(searchDoc?.metadata?.query === "spatial audio headphones", "Test 3: Stored query matches metadata");

    // Test 4: Empty SEARCH rejection
    const emptySearchRes = await anonClient.request("/interactions", {
      method: "POST",
      body: {
        type: "SEARCH",
        sessionId: anonSessionId,
        metadata: {
          query: "    "
        }
      }
    });
    assert(emptySearchRes.status === 400, "Test 4: Empty whitespace query for SEARCH is rejected with 400");

    // Test 5: Invalid interaction type rejection
    const invalidTypeRes = await anonClient.request("/interactions", {
      method: "POST",
      body: {
        type: "UNSUPPORTED_TYPE",
        productId: sampleProduct._id.toString()
      }
    });
    assert(invalidTypeRes.status === 400, "Test 5: Unsupported interaction type is rejected with 400");

    // Test 6: Client attempting to submit PURCHASE directly is rejected
    const clientPurchaseRes = await client.request("/interactions", {
      method: "POST",
      body: {
        type: "PURCHASE",
        productId: sampleProduct._id.toString(),
        metadata: { quantity: 1 }
      }
    });
    assert(clientPurchaseRes.status === 400, "Test 6: Direct client PURCHASE submission is rejected with 400");

    // Test 7: Client attempting to submit RATING directly is rejected
    const clientRatingRes = await client.request("/interactions", {
      method: "POST",
      body: {
        type: "RATING",
        productId: sampleProduct._id.toString(),
        metadata: { rating: 5 }
      }
    });
    assert(clientRatingRes.status === 400, "Test 7: Direct client RATING submission is rejected with 400");

    // Test 8: Client attempting to supply another user's userId is rejected
    const spoofId = new mongoose.Types.ObjectId().toString();
    const spoofRes = await anonClient.request("/interactions", {
      method: "POST",
      body: {
        type: "VIEW",
        productId: sampleProduct._id.toString(),
        userId: spoofId
      }
    });
    assert(spoofRes.status === 400, "Test 8: Client providing userId in payload is rejected with 400");

    // Test 9: Successful CART interaction via cartService
    const addToCartRes = await client.request("/cart/items", {
      method: "POST",
      body: {
        productId: sampleProduct._id.toString(),
        quantity: 2
      }
    });
    assert(addToCartRes.status === 200, "Test 9: Successfully added item to cart");
    const cartInteraction = await Interaction.findOne({
      user: customerUser._id,
      product: sampleProduct._id,
      type: "CART",
      "metadata.action": "add"
    }).sort({ createdAt: -1 });
    assert(Boolean(cartInteraction), "Test 9: Server-side CART interaction created in DB with action=add");
    assert(cartInteraction?.metadata?.quantity === 2, "Test 9: CART interaction has quantity=2");

    // Test 10: Successful WISHLIST interaction via wishlistService
    const addToWishlistRes = await client.request(`/wishlist/${sampleProduct._id}`, {
      method: "POST"
    });
    assert(addToWishlistRes.status === 200, "Test 10: Successfully added product to wishlist");
    const wishlistInteraction = await Interaction.findOne({
      user: customerUser._id,
      product: sampleProduct._id,
      type: "WISHLIST",
      "metadata.action": "add"
    }).sort({ createdAt: -1 });
    assert(Boolean(wishlistInteraction), "Test 10: Server-side WISHLIST interaction created in DB");

    // Test 11: Successful PURCHASE interaction after order creation
    // 11a: Create shipping address
    const addressRes = await client.request("/addresses", {
      method: "POST",
      body: {
        fullName: "Analytics Shopper",
        phone: "+1234567890",
        addressLine: "100 Innovation Way",
        city: "San Francisco",
        state: "CA",
        postalCode: "94105",
        country: "USA"
      }
    });
    assert(addressRes.status === 201, "Setup 11: Shipping address created");
    const addressId = addressRes.data?.data?.address?._id;

    // 11b: Complete checkout via POST /orders
    const checkoutRes = await client.request("/orders", {
      method: "POST",
      body: {
        shippingAddressId: addressId,
        paymentMethod: "COD"
      }
    });
    assert(checkoutRes.status === 201, "Test 11: Order placed successfully (201 Created)");
    const placedOrderId = checkoutRes.data?.data?.order?._id;

    const purchaseInteraction = await Interaction.findOne({
      user: customerUser._id,
      product: sampleProduct._id,
      type: "PURCHASE"
    }).sort({ createdAt: -1 });
    assert(Boolean(purchaseInteraction), "Test 11: Server-side PURCHASE interaction created in DB");
    assert(
      purchaseInteraction?.metadata?.orderId?.toString() === placedOrderId?.toString(),
      "Test 11: PURCHASE interaction contains verified orderId in metadata"
    );

    // Test 12: Failed checkout does NOT create PURCHASE interaction
    const purchaseCountBefore = await Interaction.countDocuments({ type: "PURCHASE" });
    // Attempt checkout with empty cart
    const failedCheckoutRes = await client.request("/orders", {
      method: "POST",
      body: {
        shippingAddressId: addressId,
        paymentMethod: "COD"
      }
    });
    assert(failedCheckoutRes.status === 400, "Test 12: Checkout with empty cart fails with 400");
    const purchaseCountAfter = await Interaction.countDocuments({ type: "PURCHASE" });
    assert(purchaseCountBefore === purchaseCountAfter, "Test 12: Failed checkout generated NO purchase interactions");

    // Test 13: Successful RATING interaction
    // Mark the placed order DELIVERED in DB so review can be verified
    await Order.findByIdAndUpdate(placedOrderId, { status: "DELIVERED" });
    const reviewRes = await client.request(`/products/${sampleProduct._id}/reviews`, {
      method: "POST",
      body: {
        rating: 5,
        comment: "Exceptional build quality and spatial audio depth!"
      }
    });
    assert(reviewRes.status === 201, "Test 13: Verified review submitted successfully (201 Created)");

    const ratingInteraction = await Interaction.findOne({
      user: customerUser._id,
      product: sampleProduct._id,
      type: "RATING"
    }).sort({ createdAt: -1 });
    assert(Boolean(ratingInteraction), "Test 13: Server-side RATING interaction created in DB");
    assert(ratingInteraction?.metadata?.rating === 5, "Test 13: RATING interaction records rating score=5");

    // Test 14: Analytics aggregation helper functions
    const mostViewed = await interactionService.getMostViewedProducts({ limit: 5 });
    assert(Array.isArray(mostViewed) && mostViewed.length > 0, "Test 14: getMostViewedProducts returns aggregated products");

    const mostSearched = await interactionService.getMostSearchedTerms({ limit: 5 });
    assert(Array.isArray(mostSearched) && mostSearched.length > 0, "Test 14: getMostSearchedTerms returns search aggregates");

    const engagement = await interactionService.getProductEngagement(sampleProduct._id.toString());
    assert(
      engagement && engagement.views >= 1 && engagement.purchases >= 1,
      "Test 14: getProductEngagement aggregates engagement counts per type"
    );

    const userHistory = await interactionService.getUserInteractions(customerUser._id.toString(), { limit: 10 });
    assert(userHistory.length >= 3, "Test 14: getUserInteractions returns chronological user timeline");

    // Test 15: Metadata size protection
    const oversizedString = "A".repeat(3000);
    const oversizeRes = await anonClient.request("/interactions", {
      method: "POST",
      body: {
        type: "VIEW",
        productId: sampleProduct._id.toString(),
        metadata: { payload: oversizedString }
      }
    });
    assert(oversizeRes.status === 400, "Test 15: Metadata exceeding 2KB is rejected with 400");
  } catch (error) {
    console.error("\n[Test Exception caught]:", error);
    testsFailed++;
  } finally {
    await mongoose.disconnect();
    console.log("\n=======================================================");
    console.log(`  PART 12 RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
    console.log("=======================================================\n");
    process.exit(testsFailed > 0 ? 1 : 0);
  }
}

runTests();
