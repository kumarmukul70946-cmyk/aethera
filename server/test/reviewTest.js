import mongoose from "mongoose";
import "dotenv/config";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
import Order from "../src/models/Order.js";
import Review from "../src/models/Review.js";
import ReviewHelpful from "../src/models/ReviewHelpful.js";

const BASE_URL = "http://localhost:5000/api";

const assert = (condition, message) => {
  if (!condition) {
    console.error(`  ✗ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
};

const makeClient = () => {
  let cookie = "";

  return {
    async request(endpoint, options = {}) {
      const url = `${BASE_URL}${endpoint}`;
      const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
      };

      if (cookie) {
        headers["Cookie"] = cookie;
      }

      const res = await fetch(url, {
        method: options.method || "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      const setCookie = res.headers.get("set-cookie");
      if (setCookie) {
        cookie = setCookie.split(";")[0];
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

async function runReviewTests() {
  console.log("\n=======================================================");
  console.log("   AETHERA COMMERCE — PART 7 REVIEWS & RATINGS TESTS   ");
  console.log("=======================================================\n");

  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aethera_commerce");

  const customerA = makeClient();
  const customerB = makeClient();
  const adminClient = makeClient();

  try {
    // ── Setup Users ──────────────────────────────────────────────────────────
    console.log("[Setup] Registering test users & authenticating admin...");

    const emailA = `reviewer_a_${Date.now()}@test.com`;
    const emailB = `reviewer_b_${Date.now()}@test.com`;

    const resA = await customerA.request("/auth/register", {
      method: "POST",
      body: { name: "Reviewer A", email: emailA, password: "Password123!" }
    });

    const resB = await customerB.request("/auth/register", {
      method: "POST",
      body: { name: "Reviewer B", email: emailB, password: "Password123!" }
    });

    const resAdmin = await adminClient.request("/auth/login", {
      method: "POST",
      body: { email: "admin@aethera.com", password: "AdminPassword123!" }
    });

    assert(
      resA.status === 201 && resB.status === 201 && resAdmin.status === 200,
      "Test users and admin successfully authenticated"
    );

    const userA = await User.findOne({ email: emailA });
    const userB = await User.findOne({ email: emailB });

    assert(Boolean(userA && userB), "Found created user documents in database");

    // Fetch active product for review testing
    const testProduct = await Product.findOne({ isActive: true });
    assert(Boolean(testProduct), "Found active product for review testing");
    const productId = testProduct._id.toString();

    // Clean up any old reviews for this product from previous test runs
    await Review.deleteMany({ product: testProduct._id });
    await ReviewHelpful.deleteMany({});
    await Product.findByIdAndUpdate(productId, { rating: 0, reviewCount: 0 });

    // ── 1. Empty Reviews & Summary ───────────────────────────────────────────
    console.log("\n[1. Initial Reviews & Summary Queries]");

    const emptyReviews = await customerA.request(`/products/${productId}/reviews`);
    assert(
      emptyReviews.status === 200 && emptyReviews.data.data.reviews.length === 0,
      "1. Get empty product reviews initially"
    );

    const initialSummary = await customerA.request(`/products/${productId}/reviews/summary`);
    assert(
      initialSummary.status === 200 &&
        initialSummary.data.data.summary.averageRating === 0 &&
        initialSummary.data.data.summary.totalReviews === 0,
      "2. Get initial review summary (0 reviews, 0.0 rating)"
    );

    // ── 2. Eligibility & Verification Rules ──────────────────────────────────
    console.log("\n[2. Purchase Verification & Eligibility Checks]");

    // 2.1 Customer without order attempts to review
    const unpurchasedAttempt = await customerA.request(`/products/${productId}/reviews`, {
      method: "POST",
      body: { rating: 5, comment: "I haven't bought this yet but it looks good!" }
    });
    assert(
      unpurchasedAttempt.status === 403,
      "3. Reject review from customer without purchase (403 Forbidden)"
    );

    // 2.2 Create order in PENDING status
    const pendingOrder = await Order.create({
      user: userA._id,
      orderNumber: `ORD-TEST-${Date.now()}-1`,
      items: [
        {
          product: testProduct._id,
          name: testProduct.name,
          price: testProduct.finalPrice,
          quantity: 1
        }
      ],
      shippingAddress: {
        fullName: "Reviewer A",
        phone: "+919876543210",
        addressLine: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001"
      },
      payment: { method: "COD", status: "PENDING" },
      subtotal: testProduct.finalPrice,
      total: testProduct.finalPrice,
      status: "PENDING"
    });

    const pendingAttempt = await customerA.request(`/products/${productId}/reviews`, {
      method: "POST",
      body: { rating: 5, comment: "Order is still pending!" }
    });
    assert(
      pendingAttempt.status === 403,
      "4. Reject review when order is not yet DELIVERED (403 Forbidden)"
    );

    // 2.3 Transition order to DELIVERED
    pendingOrder.status = "DELIVERED";
    await pendingOrder.save();

    // 2.4 Check eligibility endpoint
    const eligibilityRes = await customerA.request(`/products/${productId}/reviews/eligibility`);
    assert(
      eligibilityRes.status === 200 &&
        eligibilityRes.data.data.canReview === true &&
        eligibilityRes.data.data.hasDeliveredOrder === true,
      "5. Eligibility endpoint verifies delivered purchase (canReview: true)"
    );

    // ── 3. Create Verified Review ────────────────────────────────────────────
    console.log("\n[3. Verified Review Creation & Product Rating Sync]");

    const createRes = await customerA.request(`/products/${productId}/reviews`, {
      method: "POST",
      body: {
        rating: 5,
        comment: "Outstanding build quality and premium materials. Exceeded my expectations!",
        verifiedPurchase: false // Client attempting to tamper with verifiedPurchase flag
      }
    });

    assert(createRes.status === 201, "6. Customer with delivered order creates review (201 Created)");
    const createdReview = createRes.data.data.review;

    assert(
      createdReview.verifiedPurchase === true,
      "7. Server sets verifiedPurchase: true regardless of client body"
    );
    assert(
      createdReview.order.toString() === pendingOrder._id.toString(),
      "8. Review securely linked to delivered purchase order"
    );

    // 3.1 Verify Product rating synchronized
    const productAfterReview = await Product.findById(productId);
    assert(
      productAfterReview.rating === 5 && productAfterReview.reviewCount === 1,
      "9. Product.rating and reviewCount automatically synchronized (5.0, 1 review)"
    );

    // 3.2 Duplicate review attempt rejected
    const duplicateRes = await customerA.request(`/products/${productId}/reviews`, {
      method: "POST",
      body: { rating: 4, comment: "Trying to submit a second review for the same item!" }
    });
    assert(duplicateRes.status === 400, "10. Duplicate review for same product rejected (400)");

    // ── 4. Validation Rejections ─────────────────────────────────────────────
    console.log("\n[4. Input Validation & Edge Cases]");

    const lowRating = await customerA.request(`/products/${productId}/reviews`, {
      method: "POST",
      body: { rating: 0, comment: "Way too low rating" }
    });
    assert(lowRating.status === 400, "11. Rating below 1 rejected (400)");

    const highRating = await customerA.request(`/products/${productId}/reviews`, {
      method: "POST",
      body: { rating: 6, comment: "Way too high rating" }
    });
    assert(highRating.status === 400, "12. Rating above 5 rejected (400)");

    const shortComment = await customerA.request(`/products/${productId}/reviews`, {
      method: "POST",
      body: { rating: 4, comment: "bad" }
    });
    assert(shortComment.status === 400, "13. Comment under 5 characters rejected (400)");

    // ── 5. Update Review & Rating Recalculation ──────────────────────────────
    console.log("\n[5. Review Updates & Ownership Protection]");

    // 5.1 Customer B attempting to update Customer A's review rejected
    const crossUpdate = await customerB.request(`/reviews/${createdReview._id}`, {
      method: "PUT",
      body: { rating: 1, comment: "Hacked by User B!" }
    });
    assert(crossUpdate.status === 403, "14. Cross-user review update rejected (403 Forbidden)");

    // 5.2 Owner updates review rating to 4
    const updateRes = await customerA.request(`/reviews/${createdReview._id}`, {
      method: "PUT",
      body: { rating: 4, comment: "Updated review: very good after 2 weeks of daily usage." }
    });
    assert(updateRes.status === 200, "15. Owner updates review successfully (200 OK)");

    const productAfterUpdate = await Product.findById(productId);
    assert(
      productAfterUpdate.rating === 4 && productAfterUpdate.reviewCount === 1,
      "16. Product.rating recalculated after review update (4.0)"
    );

    // ── 6. Second Review & Aggregation Metrics ───────────────────────────────
    console.log("\n[6. Multi-Review Aggregation & Breakdown Distribution]");

    // Create delivered order for Customer B
    await Order.create({
      user: userB._id,
      orderNumber: `ORD-TEST-${Date.now()}-2`,
      items: [
        {
          product: testProduct._id,
          name: testProduct.name,
          price: testProduct.finalPrice,
          quantity: 1
        }
      ],
      shippingAddress: {
        fullName: "Reviewer B",
        phone: "+919876543211",
        addressLine: "456 Market St",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001"
      },
      payment: { method: "COD", status: "PENDING" },
      subtotal: testProduct.finalPrice,
      total: testProduct.finalPrice,
      status: "DELIVERED"
    });

    const createB = await customerB.request(`/products/${productId}/reviews`, {
      method: "POST",
      body: { rating: 5, comment: "Absolute perfection. Sleek finish and great design." }
    });
    assert(createB.status === 201, "17. Customer B submits 5-star review (201 Created)");

    // Average of 4 and 5 should be 4.5
    const summaryRes = await customerA.request(`/products/${productId}/reviews/summary`);
    assert(
      summaryRes.status === 200 &&
        summaryRes.data.data.summary.averageRating === 4.5 &&
        summaryRes.data.data.summary.totalReviews === 2 &&
        summaryRes.data.data.summary.distribution["5"] === 1 &&
        summaryRes.data.data.summary.distribution["4"] === 1,
      "18. Review summary accurately computes average 4.5 and distribution breakdown"
    );

    // ── 7. Filtering, Sorting & Pagination ────────────────────────────────────
    console.log("\n[7. Filtering, Sorting & Pagination]");

    // 7.1 Rating filter
    const fiveStarReviews = await customerA.request(`/products/${productId}/reviews?rating=5`);
    assert(
      fiveStarReviews.status === 200 &&
        fiveStarReviews.data.data.reviews.length === 1 &&
        fiveStarReviews.data.data.reviews[0].rating === 5,
      "19. Rating filter (?rating=5) returns only 5-star reviews"
    );

    // 7.2 Sorting by highest
    const highestReviews = await customerA.request(`/products/${productId}/reviews?sort=highest`);
    assert(
      highestReviews.data.data.reviews[0].rating >= highestReviews.data.data.reviews[1].rating,
      "20. Sorting by highest rated orders reviews correctly"
    );

    // ── 8. Helpful Voting ────────────────────────────────────────────────────
    console.log("\n[8. Helpful Review Voting]");

    const helpfulVote1 = await customerA.request(`/reviews/${createB.data.data.review._id}/helpful`, {
      method: "POST"
    });
    assert(
      helpfulVote1.status === 200 && helpfulVote1.data.data.helpfulCount === 1,
      "21. Customer marks review helpful (helpfulCount: 1)"
    );

    const duplicateHelpful = await customerA.request(`/reviews/${createB.data.data.review._id}/helpful`, {
      method: "POST"
    });
    assert(
      duplicateHelpful.status === 400,
      "22. Duplicate helpful vote from same customer rejected (400)"
    );

    // ── 9. Admin Moderation & Rating Impact ──────────────────────────────────
    console.log("\n[9. Admin Moderation & Visibility]");

    // Customer attempting moderation
    const custMod = await customerA.request(`/admin/reviews/${createB.data.data.review._id}/moderate`, {
      method: "PATCH",
      body: { isApproved: false }
    });
    assert(custMod.status === 403, "23. Customer rejected from admin moderation endpoint (403)");

    // Admin rejects Customer B's review
    const adminMod = await adminClient.request(`/admin/reviews/${createB.data.data.review._id}/moderate`, {
      method: "PATCH",
      body: { isApproved: false }
    });
    assert(adminMod.status === 200 && adminMod.data.data.review.isApproved === false, "24. Admin sets review isApproved: false");

    // Rejected review excluded from public rating and list
    const publicReviewsAfterMod = await customerA.request(`/products/${productId}/reviews`);
    assert(
      publicReviewsAfterMod.data.data.reviews.length === 1,
      "25. Rejected review excluded from public product reviews list"
    );

    const productAfterMod = await Product.findById(productId);
    assert(
      productAfterMod.rating === 4 && productAfterMod.reviewCount === 1,
      "26. Product rating immediately recalculates excluding unapproved review (4.0, 1 review)"
    );

    // Admin re-approves
    await adminClient.request(`/admin/reviews/${createB.data.data.review._id}/moderate`, {
      method: "PATCH",
      body: { isApproved: true }
    });

    // ── 10. Review Deletion & Cleanup ────────────────────────────────────────
    console.log("\n[10. Review Deletion & Recalculation]");

    // Customer B attempts to delete Customer A's review
    const crossDelete = await customerB.request(`/reviews/${createdReview._id}`, {
      method: "DELETE"
    });
    assert(crossDelete.status === 403, "27. Customer B rejected from deleting Customer A's review (403)");

    // Customer A deletes own review
    const ownDelete = await customerA.request(`/reviews/${createdReview._id}`, {
      method: "DELETE"
    });
    assert(ownDelete.status === 200, "28. Customer A deletes own review successfully (200)");

    // Only Customer B's review remains (5 stars)
    const productAfterDelete = await Product.findById(productId);
    assert(
      productAfterDelete.rating === 5 && productAfterDelete.reviewCount === 1,
      "29. Product rating synchronized after deletion (5.0, 1 review)"
    );

    // Admin deletes Customer B's review
    const adminDelete = await adminClient.request(`/admin/reviews/${createB.data.data.review._id}`, {
      method: "DELETE"
    });
    assert(adminDelete.status === 200, "30. Admin deletes review successfully (200)");

    const productFinal = await Product.findById(productId);
    assert(
      productFinal.rating === 0 && productFinal.reviewCount === 0,
      "31. Product rating and review count reset to 0 when all reviews deleted"
    );

    console.log("\n=======================================================");
    console.log("  ALL PART 7 REVIEW & RATING TESTS PASSED! (31/31)     ");
    console.log("=======================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("\n[Test Fatal Error]:", err);
    process.exit(1);
  }
}

runReviewTests();
