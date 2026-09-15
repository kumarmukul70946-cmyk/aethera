import "dotenv/config";
import mongoose from "mongoose";
import { Product, Coupon } from "../src/models/index.js";

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
  console.log("   AETHERA COMMERCE — PART 6 CHECKOUT & ORDER TESTS   ");
  console.log("=======================================================\n");

  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aethera_commerce");

  const clientA = makeClient();
  const clientB = makeClient();
  const adminClient = makeClient();

  try {
    // ── Setup Users ──────────────────────────────────────────────────────────
    console.log("[Setup] Registering test users & authenticating admin...");

    const emailA = `customer_a_${Date.now()}@test.com`;
    const emailB = `customer_b_${Date.now()}@test.com`;

    const resA = await clientA.request("/auth/register", {
      method: "POST",
      body: { name: "Customer A", email: emailA, password: "Password123!" }
    });

    const resB = await clientB.request("/auth/register", {
      method: "POST",
      body: { name: "Customer B", email: emailB, password: "Password123!" }
    });

    const resAdmin = await adminClient.request("/auth/login", {
      method: "POST",
      body: { email: "admin@aethera.com", password: "AdminPassword123!" }
    });

    assert(
      resA.status === 201 && resB.status === 201 && resAdmin.status === 200,
      "Test users & admin successfully authenticated"
    );

    // Fetch sample products for testing
    const products = await Product.find({ isActive: true, stock: { $gt: 5 } }).limit(2);
    const testProduct1 = products[0];
    const testProduct2 = products[1];

    assert(Boolean(testProduct1 && testProduct2), "Found active products for testing");

    // ── 1. Cart APIs ─────────────────────────────────────────────────────────
    console.log("\n[Cart Tests]");

    // 1.1 Empty cart initially
    const cartRes1 = await clientA.request("/cart");
    assert(cartRes1.data.success && cartRes1.data.data.cart.items.length === 0, "1. Get empty cart initially");

    // 1.2 Add product to cart
    const addRes1 = await clientA.request("/cart/items", {
      method: "POST",
      body: { productId: testProduct1._id.toString(), quantity: 2 }
    });
    assert(
      addRes1.data.data.cart.items.length === 1 && addRes1.data.data.cart.itemCount === 2,
      "2. Add product to cart (quantity: 2)"
    );

    // 1.3 Add same product again (increments quantity)
    const addRes2 = await clientA.request("/cart/items", {
      method: "POST",
      body: { productId: testProduct1._id.toString(), quantity: 1 }
    });
    assert(
      addRes2.data.data.cart.items[0].quantity === 3 && addRes2.data.data.cart.itemCount === 3,
      "3. Add same product increments existing item quantity (total: 3)"
    );

    // 1.4 Update cart item quantity
    const updateRes = await clientA.request(`/cart/items/${testProduct1._id}`, {
      method: "PUT",
      body: { quantity: 4 }
    });
    assert(
      updateRes.data.data.cart.items[0].quantity === 4,
      "4. Update cart item quantity to 4"
    );

    // 1.5 Quantity exceeding stock rejected
    const exceedRes = await clientA.request(`/cart/items/${testProduct1._id}`, {
      method: "PUT",
      body: { quantity: 99999 }
    });
    assert(exceedRes.status === 400, "5. Reject quantity exceeding stock (400)");

    // 1.6 Remove item from cart
    const removeRes = await clientA.request(`/cart/items/${testProduct1._id}`, {
      method: "DELETE"
    });
    assert(
      removeRes.data.data.cart.items.length === 0,
      "6. Remove item from cart"
    );

    // 1.7 Add multiple and Clear cart
    await clientA.request("/cart/items", { method: "POST", body: { productId: testProduct1._id, quantity: 1 } });
    await clientA.request("/cart/items", { method: "POST", body: { productId: testProduct2._id, quantity: 2 } });
    const clearRes = await clientA.request("/cart", { method: "DELETE" });
    assert(
      clearRes.data.data.cart.items.length === 0 && clearRes.data.data.cart.itemCount === 0,
      "7. Clear entire cart"
    );

    // ── 2. Wishlist APIs ─────────────────────────────────────────────────────
    console.log("\n[Wishlist Tests]");

    // 2.1 Add to wishlist
    const wishRes1 = await clientA.request(`/wishlist/${testProduct1._id}`, { method: "POST" });
    assert(
      wishRes1.data.data.wishlist.products.length === 1,
      "8. Add product to wishlist"
    );

    // 2.2 Duplicate wishlist add prevented
    const wishRes2 = await clientA.request(`/wishlist/${testProduct1._id}`, { method: "POST" });
    assert(
      wishRes2.data.data.wishlist.products.length === 1,
      "9. Duplicate product in wishlist prevented"
    );

    // 2.3 Move from wishlist to cart
    const moveRes = await clientA.request(`/wishlist/${testProduct1._id}/move-to-cart`, { method: "POST" });
    assert(
      moveRes.data.data.wishlist.products.length === 0 && moveRes.data.data.cart.items.length === 1,
      "10. Move item from wishlist to cart in unified action"
    );

    // 2.4 Wishlist remove
    await clientA.request(`/wishlist/${testProduct2._id}`, { method: "POST" });
    const wishRemove = await clientA.request(`/wishlist/${testProduct2._id}`, { method: "DELETE" });
    assert(
      wishRemove.data.data.wishlist.products.length === 0,
      "11. Remove product from wishlist"
    );

    // ── 3. Address APIs ──────────────────────────────────────────────────────
    console.log("\n[Address Tests]");

    // 3.1 Create address for user A
    const addrRes1 = await clientA.request("/addresses", {
      method: "POST",
      body: {
        fullName: "Customer A",
        phone: "+919876543210",
        addressLine: "404 Innovation Way, Cyber City",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560001",
        country: "India",
        isDefault: true
      }
    });
    const addressA1 = addrRes1.data.data.address;
    assert(addrRes1.status === 201 && addressA1.isDefault === true, "12. Create first address (auto-default)");

    // 3.2 Create second address and set as default
    const addrRes2 = await clientA.request("/addresses", {
      method: "POST",
      body: {
        fullName: "Customer A Alternate",
        phone: "+919876543210",
        addressLine: "12 Residency Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560025",
        isDefault: true
      }
    });
    const addressA2 = addrRes2.data.data.address;

    // Verify first address is no longer default
    const addressesA = await clientA.request("/addresses");
    const updatedA1 = addressesA.data.data.addresses.find((a) => a._id === addressA1._id);
    assert(
      addressA2.isDefault === true && updatedA1.isDefault === false,
      "13. Setting new default unset existing default address"
    );

    // 3.3 User B cannot access or modify User A's address
    const tamperAddr = await clientB.request(`/addresses/${addressA1._id}`, {
      method: "PUT",
      body: { fullName: "Hacker" }
    });
    assert(tamperAddr.status === 404, "14. Cross-user address access rejected (404)");

    // ── 4. Coupon APIs ───────────────────────────────────────────────────────
    console.log("\n[Coupon Tests]");

    // 4.1 Validate valid percentage coupon
    const validCouponRes = await clientA.request("/coupons/validate", {
      method: "POST",
      body: { code: "WELCOME10", subtotal: 5000 }
    });
    assert(
      validCouponRes.data.success && validCouponRes.data.data.discount === 500,
      "15. Validate percentage coupon (10% of 5000 = 500)"
    );

    // 4.2 Validate invalid coupon code
    const invalidCoupon = await clientA.request("/coupons/validate", {
      method: "POST",
      body: { code: "NONEXISTENT99" }
    });
    assert(invalidCoupon.status === 404, "16. Reject non-existent coupon (404)");

    // 4.3 Validate expired coupon
    const expiredCoupon = await clientA.request("/coupons/validate", {
      method: "POST",
      body: { code: "EXPIRED50" }
    });
    assert(expiredCoupon.status === 400, "17. Reject expired coupon (400)");

    // 4.4 Validate inactive coupon
    const inactiveCoupon = await clientA.request("/coupons/validate", {
      method: "POST",
      body: { code: "INACTIVE30" }
    });
    assert(inactiveCoupon.status === 400, "18. Reject inactive coupon (400)");

    // 4.5 Validate minimum order requirement
    const minOrderCoupon = await clientA.request("/coupons/validate", {
      method: "POST",
      body: { code: "AETHERA20", subtotal: 1000 }
    });
    assert(minOrderCoupon.status === 400, "19. Reject coupon when subtotal < minimum order amount (400)");

    // ── 5. Checkout & Order Creation ─────────────────────────────────────────
    console.log("\n[Checkout & Order Creation Tests]");

    // 5.1 Empty cart checkout rejected
    await clientB.request("/cart", { method: "DELETE" });
    const emptyCheckout = await clientB.request("/orders", {
      method: "POST",
      body: { shippingAddressId: addressA1._id }
    });
    assert(emptyCheckout.status === 400, "20. Reject checkout with empty cart (400)");

    // 5.2 Attempt checkout with another user's address rejected
    await clientB.request("/cart/items", {
      method: "POST",
      body: { productId: testProduct1._id, quantity: 1 }
    });
    const foreignAddrCheckout = await clientB.request("/orders", {
      method: "POST",
      body: { shippingAddressId: addressA1._id }
    });
    assert(
      foreignAddrCheckout.status === 404 || foreignAddrCheckout.status === 400,
      "21. Reject checkout with another user's shipping address (404/400)"
    );

    // 5.3 Attempt to supply client total / discount / userId (tamper test)
    await clientA.request("/cart", { method: "DELETE" });
    const testQty = 2;
    await clientA.request("/cart/items", {
      method: "POST",
      body: { productId: testProduct1._id, quantity: testQty }
    });

    const initialStock = testProduct1.stock;
    const initialSales = testProduct1.salesCount;
    const expectedItemPrice = testProduct1.finalPrice || testProduct1.price;
    const expectedSubtotal = expectedItemPrice * testQty;

    const initialCoupon = await Coupon.findOne({ code: "WELCOME10" });
    const initialUsage = initialCoupon.usedCount;

    // Customer places order, attempting to tamper total to 10
    const orderRes = await clientA.request("/orders", {
      method: "POST",
      body: {
        shippingAddressId: addressA1._id,
        couponCode: "WELCOME10",
        total: 10,
        subtotal: 10,
        discount: 9999,
        userId: "some-other-user-id"
      }
    });

    const createdOrder = orderRes.data.data.order;
    let expectedDiscount = Math.round(expectedSubtotal * 0.1);
    if (expectedDiscount > 2000) expectedDiscount = 2000; // WELCOME10 has maximumDiscount = 2000
    const expectedFinalTotal = expectedSubtotal - expectedDiscount;

    assert(orderRes.status === 201, "22. Order placed successfully (201)");
    assert(
      createdOrder.total === expectedFinalTotal && createdOrder.total !== 10,
      `23. Server ignored client total and calculated true total (₹${createdOrder.total})`
    );
    assert(
      createdOrder.items[0].price === expectedItemPrice,
      `24. Order stored purchase-time price snapshot (₹${expectedItemPrice})`
    );
    assert(
      createdOrder.shippingAddress.addressLine === addressA1.addressLine,
      "25. Order stored permanent shipping address snapshot"
    );

    // 5.4 Cart cleared after successful order
    const cartAfterOrder = await clientA.request("/cart");
    assert(
      cartAfterOrder.data.data.cart.items.length === 0,
      "26. Customer cart automatically cleared after order placement"
    );

    // 5.5 Stock decreased and salesCount increased in MongoDB
    const productAfterOrder = await Product.findById(testProduct1._id);
    assert(
      productAfterOrder.stock === initialStock - testQty,
      `27. Inventory atomically decreased: ${initialStock} -> ${productAfterOrder.stock}`
    );
    assert(
      productAfterOrder.salesCount === initialSales + testQty,
      `28. salesCount atomically incremented: ${initialSales} -> ${productAfterOrder.salesCount}`
    );

    // 5.6 Coupon usedCount incremented
    const couponAfterOrder = await Coupon.findOne({ code: "WELCOME10" });
    assert(
      couponAfterOrder.usedCount === initialUsage + 1,
      `29. Coupon usedCount incremented after order: ${initialUsage} -> ${couponAfterOrder.usedCount}`
    );

    // ── 6. Order History & Security ──────────────────────────────────────────
    console.log("\n[Order History & Ownership Security]");

    // 6.1 User A gets their orders
    const historyA = await clientA.request("/orders");
    assert(
      historyA.data.data.orders.length >= 1 && historyA.data.data.orders[0]._id === createdOrder._id,
      "30. Customer fetches own order history"
    );

    // 6.2 User B order list does not contain User A's order
    const historyB = await clientB.request("/orders");
    const hasAOrder = historyB.data.data.orders.some((o) => o._id === createdOrder._id);
    assert(!hasAOrder, "31. User B cannot see User A's orders in order history");

    // 6.3 User B attempts to access User A's order by ID
    const crossOrderAccess = await clientB.request(`/orders/${createdOrder._id}`);
    assert(crossOrderAccess.status === 404, "32. Cross-user order details access rejected (404)");

    // ── 7. Order Cancellation & Restocking ───────────────────────────────────
    console.log("\n[Order Cancellation & Restock Tests]");

    // 7.1 Customer cancels pending order
    const cancelRes = await clientA.request(`/orders/${createdOrder._id}/cancel`, { method: "PATCH" });
    assert(
      cancelRes.data.data.order.status === "CANCELLED",
      "33. Eligible order cancelled successfully"
    );

    // 7.2 Stock restored in MongoDB
    const productAfterCancel = await Product.findById(testProduct1._id);
    assert(
      productAfterCancel.stock === initialStock,
      `34. Inventory restored upon cancellation: ${productAfterCancel.stock} === ${initialStock}`
    );

    // 7.3 Attempt to cancel already cancelled order rejected
    const reCancel = await clientA.request(`/orders/${createdOrder._id}/cancel`, { method: "PATCH" });
    assert(reCancel.status === 400, "35. Re-cancelling already cancelled order rejected (400)");

    // ── 8. Admin Order APIs & Status Transitions ─────────────────────────────
    console.log("\n[Admin Order APIs & Lifecycle]");

    // 8.1 Admin lists all orders
    const adminOrders = await adminClient.request("/admin/orders");
    assert(
      adminOrders.data.data.orders.length >= 1,
      "36. Admin fetches all customer orders with pagination"
    );

    // Create a new order for admin status transition testing
    const addrB = await clientB.request("/addresses", {
      method: "POST",
      body: {
        fullName: "Customer B",
        phone: "+919876543211",
        addressLine: "100 Market St",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001"
      }
    });
    await clientB.request("/cart/items", {
      method: "POST",
      body: { productId: testProduct2._id, quantity: 1 }
    });
    const orderRes2 = await clientB.request("/orders", {
      method: "POST",
      body: { shippingAddressId: addrB.data.data.address._id }
    });
    const order2Id = orderRes2.data.data.order._id;

    // 8.2 Customer attempting admin status update rejected
    const customerAdminUpdate = await clientB.request(`/admin/orders/${order2Id}/status`, {
      method: "PATCH",
      body: { status: "DELIVERED" }
    });
    assert(customerAdminUpdate.status === 403, "37. Customer denied admin order update (403)");

    // 8.3 Admin updates status through valid transitions
    const status1 = await adminClient.request(`/admin/orders/${order2Id}/status`, {
      method: "PATCH",
      body: { status: "CONFIRMED" }
    });
    assert(status1.data.data.order.status === "CONFIRMED", "38. Admin updates status to CONFIRMED");

    const status2 = await adminClient.request(`/admin/orders/${order2Id}/status`, {
      method: "PATCH",
      body: { status: "PROCESSING" }
    });
    assert(status2.data.data.order.status === "PROCESSING", "39. Admin updates status to PROCESSING");

    // 8.4 Invalid status transition rejected (e.g. PROCESSING -> DELIVERED directly without shipping)
    const invalidTransition = await adminClient.request(`/admin/orders/${order2Id}/status`, {
      method: "PATCH",
      body: { status: "DELIVERED" }
    });
    assert(invalidTransition.status === 400, "40. Invalid status transition rejected (400)");

    console.log("\n=======================================================");
    console.log(`  Tests Passed: ${testsPassed}`);
    console.log(`  Tests Failed: ${testsFailed}`);
    console.log("=======================================================\n");

    await mongoose.disconnect();

    if (testsFailed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("[Test Fatal Error]:", error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

runTests();
