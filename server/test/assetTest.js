import "dotenv/config";
import mongoose from "mongoose";
import http from "http";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import { User, Asset, Product, Category } from "../src/models/index.js";

const TEST_PORT = 5009;
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
      const isFormData = options.body instanceof FormData;
      const headers = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(cookie ? { Cookie: cookie } : {}),
        ...(options.headers || {})
      };

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        body: isFormData
          ? options.body
          : options.body
          ? JSON.stringify(options.body)
          : undefined
      });

      let json = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      return { status: res.status, headers: res.headers, body: json };
    }
  };
};

async function runTests() {
  console.log("\n=======================================================");
  console.log("   PART 22: MEDIA & 3D ASSET MANAGEMENT TEST SUITE");
  console.log("=======================================================\n");

  try {
    // 1. Connect MongoDB and start test HTTP server
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGO_URI || "mongodb://127.0.0.1:27017/aethera_commerce"
      );
    }

    serverInstance = http.createServer(app);
    await new Promise((resolve) => serverInstance.listen(TEST_PORT, resolve));
    console.log(`Test HTTP server listening on port ${TEST_PORT}\n`);

    // Clean up test assets
    await Asset.deleteMany({ originalName: { $regex: /^test_/i } });

    // 2. Setup test users: Admin and Customer
    const adminEmail = `asset_admin_${Date.now()}@aethera.com`;
    const customerEmail = `asset_cust_${Date.now()}@aethera.com`;
    const password = "Password123!";
    const hashedPassword = await bcrypt.hash(password, 10);

    const [adminUser, custUser] = await User.create([
      { name: "Asset Admin", email: adminEmail, password: hashedPassword, role: "admin" },
      { name: "Asset Customer", email: customerEmail, password: hashedPassword, role: "customer" }
    ]);

    const adminClient = makeClient();
    const customerClient = makeClient();
    const unauthClient = makeClient();

    // Login Admin
    const adminLoginRes = await adminClient.request("/auth/login", {
      method: "POST",
      body: { email: adminEmail, password }
    });
    adminClient.setCookie(extractCookie(adminLoginRes));

    // Login Customer
    const custLoginRes = await customerClient.request("/auth/login", {
      method: "POST",
      body: { email: customerEmail, password }
    });
    customerClient.setCookie(extractCookie(custLoginRes));

    // Setup a test Category and Product for association tests
    let category = await Category.findOne();
    if (!category) {
      category = await Category.create({
        name: "Test Category",
        slug: `test-cat-${Date.now()}`,
        description: "Test category"
      });
    }

    const testProduct = await Product.create({
      name: "Test Asset Product",
      slug: `test-asset-product-${Date.now()}`,
      description: "A product used for asset management tests",
      category: category._id,
      brand: "Aethera",
      price: 9999,
      finalPrice: 9999,
      stock: 50,
      images: []
    });

    // Helper to generate sample file blobs
    const samplePngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
      0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06,
      0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89
    ]);

    const sampleGlbBuffer = Buffer.from([
      0x67, 0x6c, 0x54, 0x46, 0x02, 0x00, 0x00, 0x00, 0x24, 0x00, 0x00, 0x00, 0x0c,
      0x00, 0x00, 0x00, 0x4a, 0x53, 0x4f, 0x4e, 0x7b, 0x22, 0x61, 0x73, 0x73, 0x65,
      0x74, 0x22, 0x3a, 0x7b, 0x22, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x22,
      0x3a, 0x22, 0x32, 0x2e, 0x30, 0x22, 0x7d, 0x7d
    ]);

    const spoofedExeBuffer = Buffer.from([
      0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0xff,
      0xff, 0x00, 0x00
    ]);

    // ========================================================
    // TEST 1 & 2: Unauthenticated & Customer upload blocked
    // ========================================================
    console.log("TEST 1 & 2: Authentication & Admin RBAC enforcement on upload");
    const unauthForm = new FormData();
    unauthForm.append("file", new Blob([samplePngBuffer], { type: "image/png" }), "test_unauth.png");
    unauthForm.append("assetType", "PRODUCT_IMAGE");

    const unauthRes = await unauthClient.request("/admin/assets", {
      method: "POST",
      body: unauthForm
    });
    assert(unauthRes.status === 401, "Unauthenticated upload returns 401");

    const custForm = new FormData();
    custForm.append("file", new Blob([samplePngBuffer], { type: "image/png" }), "test_cust.png");
    custForm.append("assetType", "PRODUCT_IMAGE");

    const custRes = await customerClient.request("/admin/assets", {
      method: "POST",
      body: custForm
    });
    assert(custRes.status === 403, "Customer role upload returns 403 Forbidden");

    // ========================================================
    // TEST 3: Admin can upload product image
    // ========================================================
    console.log("\nTEST 3: Admin can upload product image");
    const adminImgForm = new FormData();
    adminImgForm.append("file", new Blob([samplePngBuffer], { type: "image/png" }), "test_shoe.png");
    adminImgForm.append("assetType", "PRODUCT_IMAGE");
    adminImgForm.append("productId", testProduct._id.toString());

    const adminImgRes = await adminClient.request("/admin/assets", {
      method: "POST",
      body: adminImgForm
    });
    assert(adminImgRes.status === 201, "Admin upload image returns 201 Created");
    assert(adminImgRes.body?.success === true, "Response reports success = true");
    assert(adminImgRes.body?.data?.assetType === "PRODUCT_IMAGE", "Asset type is PRODUCT_IMAGE");
    assert(adminImgRes.body?.data?.format === "png", "Format is png");
    assert(typeof adminImgRes.body?.data?.secureUrl === "string", "Returns secureUrl");
    const uploadedImageId = adminImgRes.body?.data?._id;

    // ========================================================
    // TEST 4: Admin can upload GLB 3D model
    // ========================================================
    console.log("\nTEST 4: Admin can upload GLB 3D model");
    const adminGlbForm = new FormData();
    adminGlbForm.append("file", new Blob([sampleGlbBuffer], { type: "model/gltf-binary" }), "test_runner.glb");
    adminGlbForm.append("assetType", "MODEL_3D");
    adminGlbForm.append("productId", testProduct._id.toString());

    const adminGlbRes = await adminClient.request("/admin/assets", {
      method: "POST",
      body: adminGlbForm
    });
    assert(adminGlbRes.status === 201, "Admin upload GLB returns 201 Created");
    assert(adminGlbRes.body?.data?.assetType === "MODEL_3D", "Asset type is MODEL_3D");
    assert(adminGlbRes.body?.data?.resourceType === "raw", "Resource type for 3D is raw");
    assert(adminGlbRes.body?.data?.format === "glb", "Format is glb");
    const uploadedGlbId = adminGlbRes.body?.data?._id;

    // ========================================================
    // TEST 5: Unsupported extension rejected
    // ========================================================
    console.log("\nTEST 5: Unsupported extension rejected");
    const badExtForm = new FormData();
    badExtForm.append("file", new Blob(["arbitrary text"], { type: "text/plain" }), "test_doc.txt");
    badExtForm.append("assetType", "PRODUCT_IMAGE");

    const badExtRes = await adminClient.request("/admin/assets", {
      method: "POST",
      body: badExtForm
    });
    assert(badExtRes.status === 400, "Unsupported extension returns 400");
    assert(badExtRes.body?.message?.includes("Unsupported"), "Error explains unsupported format");

    // ========================================================
    // TEST 6: Oversized file rejected
    // ========================================================
    console.log("\nTEST 6: Oversized file rejected");
    // Generate a 6MB dummy buffer exceeding the default 5MB image limit
    const bigBuffer = Buffer.alloc(6 * 1024 * 1024);
    // Add PNG magic header so it passes signature check and fails size check
    samplePngBuffer.copy(bigBuffer, 0, 0, samplePngBuffer.length);

    const bigForm = new FormData();
    bigForm.append("file", new Blob([bigBuffer], { type: "image/png" }), "test_oversized.png");
    bigForm.append("assetType", "PRODUCT_IMAGE");

    const bigRes = await adminClient.request("/admin/assets", {
      method: "POST",
      body: bigForm
    });
    assert(bigRes.status === 400, "Oversized file returns 400 Bad Request");
    assert(bigRes.body?.message?.includes("exceeds"), "Error mentions file size limit");

    // ========================================================
    // TEST 7: Spoofed executable disguised as GLB rejected via magic bytes
    // ========================================================
    console.log("\nTEST 7: Magic-byte verification catches disguised executable");
    const spoofForm = new FormData();
    spoofForm.append("file", new Blob([spoofedExeBuffer], { type: "model/gltf-binary" }), "test_trojan.glb");
    spoofForm.append("assetType", "MODEL_3D");

    const spoofRes = await adminClient.request("/admin/assets", {
      method: "POST",
      body: spoofForm
    });
    assert(spoofRes.status === 400, "Disguised executable rejected with 400");
    assert(
      spoofRes.body?.message?.includes("signature mismatch"),
      "Error indicates file signature mismatch"
    );

    // ========================================================
    // TEST 8: Invalid product reference rejected
    // ========================================================
    console.log("\nTEST 8: Non-existent product ID rejected");
    const fakeId = new mongoose.Types.ObjectId().toString();
    const fakeProductForm = new FormData();
    fakeProductForm.append("file", new Blob([samplePngBuffer], { type: "image/png" }), "test_valid.png");
    fakeProductForm.append("assetType", "PRODUCT_IMAGE");
    fakeProductForm.append("productId", fakeId);

    const fakeProdRes = await adminClient.request("/admin/assets", {
      method: "POST",
      body: fakeProductForm
    });
    assert(fakeProdRes.status === 404, "Non-existent product ID returns 404");

    // ========================================================
    // TEST 9: Asset metadata saved in MongoDB
    // ========================================================
    console.log("\nTEST 9: Asset metadata persistence in MongoDB");
    const foundDoc = await Asset.findById(uploadedImageId);
    assert(foundDoc !== null, "Asset document exists in MongoDB");
    assert(foundDoc.originalName === "test_shoe.png", "Preserves originalName");
    assert(foundDoc.uploadedBy.toString() === adminUser._id.toString(), "Tracks uploadedBy admin");
    assert(foundDoc.status === "ACTIVE", "Status is ACTIVE");

    // ========================================================
    // TEST 10: Product association updated on upload
    // ========================================================
    console.log("\nTEST 10: Product association updated on upload");
    const updatedProd = await Product.findById(testProduct._id);
    assert(
      updatedProd.model3D?.toString() === uploadedGlbId.toString(),
      "Product.model3D updated with 3D model asset ID"
    );
    assert(
      updatedProd.images.length > 0,
      "Product.images array contains uploaded image"
    );

    // ========================================================
    // TEST 11: Asset listing pagination works
    // ========================================================
    console.log("\nTEST 11: Asset listing pagination");
    const listRes = await adminClient.request("/admin/assets?page=1&limit=1");
    assert(listRes.status === 200, "GET /admin/assets returns 200");
    assert(Array.isArray(listRes.body?.data), "Data is array");
    assert(listRes.body?.data.length === 1, "Limit=1 restricts to 1 asset");
    assert(listRes.body?.pagination?.page === 1, "Page is 1");

    // ========================================================
    // TEST 12: Asset filtering works
    // ========================================================
    console.log("\nTEST 12: Asset filtering by assetType");
    const filterRes = await adminClient.request("/admin/assets?assetType=MODEL_3D");
    assert(filterRes.status === 200, "Filter request returns 200");
    const all3D = filterRes.body?.data.every((a) => a.assetType === "MODEL_3D");
    assert(all3D === true, "All filtered items have assetType=MODEL_3D");

    // ========================================================
    // TEST 13: Single asset details returned
    // ========================================================
    console.log("\nTEST 13: Get single asset metadata");
    const singleRes = await adminClient.request(`/admin/assets/${uploadedGlbId}`);
    assert(singleRes.status === 200, "GET /admin/assets/:id returns 200");
    assert(singleRes.body?.data?.format === "glb", "Asset detail returns correct format");
    assert(Boolean(singleRes.body?.data?.secureUrl), "Asset detail includes secureUrl");

    // ========================================================
    // TEST 14: Replacement preserves old asset if new file fails validation
    // ========================================================
    console.log("\nTEST 14: Replacement preserves old asset on failed validation");
    const badReplaceForm = new FormData();
    badReplaceForm.append("file", new Blob([spoofedExeBuffer], { type: "model/gltf-binary" }), "test_bad.glb");

    const failedReplaceRes = await adminClient.request(`/admin/assets/${uploadedGlbId}`, {
      method: "PATCH",
      body: badReplaceForm
    });
    assert(failedReplaceRes.status === 400, "Invalid replacement rejected with 400");
    const stillExistingGlb = await Asset.findById(uploadedGlbId);
    assert(stillExistingGlb !== null, "Original asset preserved and intact after failed replacement");

    // ========================================================
    // TEST 15: Successful replacement updates asset and product
    // ========================================================
    console.log("\nTEST 15: Successful replacement updates asset and product reference");
    const goodReplaceForm = new FormData();
    goodReplaceForm.append("file", new Blob([sampleGlbBuffer], { type: "model/gltf-binary" }), "test_runner_v2.glb");

    const goodReplaceRes = await adminClient.request(`/admin/assets/${uploadedGlbId}`, {
      method: "PATCH",
      body: goodReplaceForm
    });
    assert(goodReplaceRes.status === 200, "Valid replacement returns 200 OK");
    assert(
      goodReplaceRes.body?.data?.originalName === "test_runner_v2.glb",
      "Asset record updated with new filename"
    );

    // ========================================================
    // TEST 16: Product asset association endpoint works
    // ========================================================
    console.log("\nTEST 16: PATCH /api/admin/products/:productId/assets");
    const associateRes = await adminClient.request(`/admin/products/${testProduct._id}/assets`, {
      method: "PATCH",
      body: { assetId: uploadedImageId, role: "primary" }
    });
    assert(associateRes.status === 200, "Associate product assets returns 200 OK");
    assert(associateRes.body?.success === true, "Association reports success");

    // ========================================================
    // TEST 17: Customer cannot delete assets
    // ========================================================
    console.log("\nTEST 17: Customer cannot delete assets (403)");
    const custDeleteRes = await customerClient.request(`/admin/assets/${uploadedImageId}`, {
      method: "DELETE"
    });
    assert(custDeleteRes.status === 403, "Customer delete returns 403 Forbidden");

    // ========================================================
    // TEST 18: Admin can delete asset and cleans product reference
    // ========================================================
    console.log("\nTEST 18: Admin deletes asset and cleans up product references");
    const adminDeleteRes = await adminClient.request(`/admin/assets/${uploadedGlbId}`, {
      method: "DELETE"
    });
    assert(adminDeleteRes.status === 200, "Admin delete returns 200 OK");
    const checkProductAfterDelete = await Product.findById(testProduct._id);
    assert(
      checkProductAfterDelete.model3D === null,
      "Product.model3D cleared after asset deletion"
    );

    // ========================================================
    // TEST 19: Orphan assets can be identified
    // ========================================================
    console.log("\nTEST 19: Orphan assets filtering");
    // Create an unlinked asset
    const orphanForm = new FormData();
    orphanForm.append("file", new Blob([samplePngBuffer], { type: "image/png" }), "test_orphan.png");
    orphanForm.append("assetType", "PRODUCT_IMAGE");

    const orphanUploadRes = await adminClient.request("/admin/assets", {
      method: "POST",
      body: orphanForm
    });
    const orphanAssetId = orphanUploadRes.body?.data?._id;

    const orphanListRes = await adminClient.request("/admin/assets?status=ORPHANED");
    assert(orphanListRes.status === 200, "Querying orphaned assets returns 200");
    const hasOrphan = orphanListRes.body?.data.some((a) => a._id === orphanAssetId);
    assert(hasOrphan === true, "Unassociated asset correctly identified as ORPHANED");

    // ========================================================
    // TEST 20: Cloudinary secrets never exposed in API responses
    // ========================================================
    console.log("\nTEST 20: No secrets or sensitive credentials in API payload");
    const payloadString = JSON.stringify(orphanUploadRes.body);
    assert(!payloadString.includes("CLOUDINARY_API_SECRET"), "Secret key name not exposed");
    assert(!payloadString.includes("api_secret"), "api_secret field not exposed");

    console.log("\n=======================================================");
    console.log(`TEST RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
    console.log("=======================================================\n");

    if (testsFailed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  } finally {
    if (serverInstance) {
      await new Promise((resolve) => serverInstance.close(resolve));
    }
    await mongoose.disconnect();
  }
}

runTests();
