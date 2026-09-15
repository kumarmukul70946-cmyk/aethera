import "dotenv/config";
import mongoose from "mongoose";
import { User, Product, Cart } from "../src/models/index.js";

const BASE_URL = "http://127.0.0.1:5000/api";

const TEST_CUSTOMER = {
  name: "Customizer Tester",
  email: `customizer_${Date.now()}@example.com`,
  password: "Password123!"
};

let cookie = "";
let testProduct = null;

const request = async (endpoint, options = {}) => {
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

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/token=[^;]+/);
    if (match) cookie = match[0];
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  return { status: res.status, headers: res.headers, data };
};

async function runTests() {
  console.log("\n=======================================================");
  console.log("  AETHERA COMMERCE — PART 10 3D CUSTOMIZATION TESTS   ");
  console.log("=======================================================\n");

  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aethera_commerce");

    // 1. Setup & Authentication
    console.log("[1. Setup & User Authentication]");
    const regRes = await request("/auth/register", {
      method: "POST",
      body: TEST_CUSTOMER
    });

    if (regRes.status !== 201) {
      throw new Error(`Registration failed with status ${regRes.status}: ${JSON.stringify(regRes.data)}`);
    }
    console.log("  ✓ Customer successfully registered and authenticated via HTTP-only cookie");

    testProduct = await Product.findOne({ "customization.enabled": true, isActive: true });
    if (!testProduct) {
      throw new Error("No active product found with customization.enabled === true");
    }
    console.log(`  ✓ Found customizable test product: '${testProduct.name}' (${testProduct._id})`);

    // 2. Reject Invalid Customization Area
    console.log("\n[2. Server-Side Customization Validation]");
    const invalidAreaRes = await request("/cart/items", {
      method: "POST",
      body: {
        productId: testProduct._id.toString(),
        quantity: 1,
        customization: {
          custom3D: {
            invalid_area: { name: "Fake", color: "#ffffff" }
          }
        }
      }
    });

    if (invalidAreaRes.status === 400) {
      console.log("  ✓ Rejected unknown customization area with 400 Bad Request");
    } else {
      throw new Error(`Expected invalid customization area to fail with 400, got ${invalidAreaRes.status}`);
    }

    // 3. Reject Invalid Option in Valid Area
    const invalidOptRes = await request("/cart/items", {
      method: "POST",
      body: {
        productId: testProduct._id.toString(),
        quantity: 1,
        customization: {
          custom3D: {
            body: { id: "fake_color", name: "Injected Color", color: "#123456" }
          }
        }
      }
    });

    if (invalidOptRes.status === 400) {
      console.log("  ✓ Rejected invalid customization option for area with 400 Bad Request");
    } else {
      throw new Error(`Expected invalid customization option to fail with 400, got ${invalidOptRes.status}`);
    }

    // 4. Add Valid Customized Product to Cart
    console.log("\n[3. Cart Customization Integration]");
    const validCustomizationA = {
      custom3D: {
        body: { id: "lunar_white", name: "Lunar White", color: "#f8fafc" },
        trim: { id: "cyber_cyan", name: "Cyber Cyan", color: "#06b6d4" }
      }
    };

    const addResA = await request("/cart/items", {
      method: "POST",
      body: {
        productId: testProduct._id.toString(),
        quantity: 1,
        customization: validCustomizationA
      }
    });

    if (addResA.status === 200 || addResA.status === 201) {
      console.log("  ✓ Added customized product to cart successfully (200/201)");
    } else {
      throw new Error(`Failed to add customized product to cart: ${addResA.status} - ${JSON.stringify(addResA.data)}`);
    }

    // 5. Verify Cart Item Contains Customization Metadata
    const cartRes = await request("/cart");
    const cartItems = cartRes.data.data?.cart?.items || cartRes.data.data?.items || [];
    const itemA = cartItems.find(
      (i) => (i.product?._id || i.product)?.toString() === testProduct._id.toString()
    );

    if (itemA?.customization?.custom3D?.body?.name === "Lunar White") {
      console.log("  ✓ Cart item accurately stored custom3D metadata (Lunar White, Cyber Cyan)");
    } else {
      throw new Error(`Cart item missing or malformed custom3D metadata: ${JSON.stringify(itemA)}`);
    }

    // 6. Distinct Line Items for Different Customizations
    const validCustomizationB = {
      custom3D: {
        body: { id: "champagne_gold", name: "Champagne Gold", color: "#d97706" },
        trim: { id: "solar_gold", name: "Solar Gold", color: "#f59e0b" }
      }
    };

    const addResB = await request("/cart/items", {
      method: "POST",
      body: {
        productId: testProduct._id.toString(),
        quantity: 1,
        customization: validCustomizationB
      }
    });

    if (addResB.status !== 200 && addResB.status !== 201) {
      throw new Error(`Failed to add second customized item: ${addResB.status}`);
    }

    const cartRes2 = await request("/cart");
    const cartItems2 = cartRes2.data.data?.cart?.items || cartRes2.data.data?.items || [];
    const matchingProducts = cartItems2.filter(
      (i) => (i.product?._id || i.product)?.toString() === testProduct._id.toString()
    );

    if (matchingProducts.length === 2) {
      console.log("  ✓ Created separate line items for distinct 3D customizations (length: 2)");
    } else {
      throw new Error(`Expected 2 distinct cart line items, found ${matchingProducts.length}`);
    }

    // 7. Quantity Increment for Identical Customization
    const addResC = await request("/cart/items", {
      method: "POST",
      body: {
        productId: testProduct._id.toString(),
        quantity: 2,
        customization: validCustomizationA
      }
    });

    if (addResC.status !== 200 && addResC.status !== 201) {
      throw new Error(`Failed to increment identical customized item: ${addResC.status}`);
    }

    const cartRes3 = await request("/cart");
    const cartItems3 = cartRes3.data.data?.cart?.items || cartRes3.data.data?.items || [];
    const itemAUpdated = cartItems3.find(
      (i) =>
        (i.product?._id || i.product)?.toString() === testProduct._id.toString() &&
        i.customization?.custom3D?.body?.id === "lunar_white"
    );

    if (itemAUpdated?.quantity === 3) {
      console.log("  ✓ Incremented quantity (1 + 2 = 3) for identical 3D customization");
    } else {
      throw new Error(`Expected item quantity 3, found ${itemAUpdated?.quantity}`);
    }

    console.log("\n=======================================================");
    console.log("  ALL PART 10 3D CUSTOMIZATION TESTS PASSED! (7/7)    ");
    console.log("=======================================================\n");
  } catch (err) {
    console.error("\n❌ Test Suite Failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
