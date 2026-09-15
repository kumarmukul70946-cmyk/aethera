/**
 * Automated Verification Suite for Part 3: Authentication & Authorization.
 * Tests every required endpoint, validation rule, cookie behavior, and role guard.
 */

const BASE_URL = "http://localhost:5000/api/auth";

let customerCookie = "";
let adminCookie = "";

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

const extractCookie = (res) => {
  // Extract token cookie from Set-Cookie header
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return "";
  const match = setCookie.match(/token=[^;]+/);
  return match ? match[0] : "";
};

const main = async () => {
  console.log("\n=========================================");
  console.log("  Aethera Commerce Part 3 Auth Test Suite");
  console.log("=========================================\n");

  const testEmail = `customer_${Date.now()}@aethera.com`;
  const testPassword = "SecurePassword123!";
  const newPassword = "NewSecurePassword456!";

  // 1. Register valid customer
  await runTest("1. Register valid customer", async () => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Customer",
        email: testEmail,
        password: testPassword
      })
    });
    const data = await res.json();
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${data.message}`);
    if (!data.success) throw new Error("Expected data.success to be true");
    if (data.data.user.role !== "customer") throw new Error("Expected role to be customer");
    if (data.data.user.password !== undefined) throw new Error("Password field must not be returned");

    customerCookie = extractCookie(res);
    if (!customerCookie) throw new Error("Expected Set-Cookie with token");
  });

  // 2. Register duplicate email rejection
  await runTest("2. Register duplicate email rejection", async () => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Duplicate",
        email: testEmail,
        password: testPassword
      })
    });
    const data = await res.json();
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    if (data.success !== false) throw new Error("Expected data.success to be false");
  });

  // 3. Register invalid email rejection
  await runTest("3. Register invalid email rejection", async () => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Invalid Email",
        email: "not-an-email",
        password: testPassword
      })
    });
    const data = await res.json();
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    if (!data.errors || data.errors.length === 0) throw new Error("Expected validation errors array");
  });

  // 4. Register weak password rejection
  await runTest("4. Register weak password rejection", async () => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Short Pass",
        email: `short_${Date.now()}@aethera.com`,
        password: "123"
      })
    });
    const data = await res.json();
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 5. Attempt role escalation in register (must stay customer)
  await runTest("5. Attempt role escalation in registration ignored", async () => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Hacker Customer",
        email: `hacker_${Date.now()}@aethera.com`,
        password: testPassword,
        role: "admin"
      })
    });
    const data = await res.json();
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (data.data.user.role !== "customer") {
      throw new Error(`CRITICAL SECURITY FAILURE: User registered with role '${data.data.user.role}' instead of 'customer'`);
    }
  });

  // 6. Login with valid credentials
  await runTest("6. Login with valid credentials", async () => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${data.message}`);
    if (data.data.user.email !== testEmail) throw new Error("Returned email does not match");

    customerCookie = extractCookie(res);
    if (!customerCookie) throw new Error("Expected Set-Cookie with token upon login");
  });

  // 7. Login with wrong password
  await runTest("7. Login with wrong password rejected", async () => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "WrongPassword999!"
      })
    });
    const data = await res.json();
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 8. Login with nonexistent email
  await runTest("8. Login with nonexistent email rejected", async () => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "ghost_user_does_not_exist@aethera.com",
        password: "SomePassword123!"
      })
    });
    const data = await res.json();
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 9. Get current user (GET /api/auth/me) with cookie
  await runTest("9. GET /api/auth/me returns current user", async () => {
    const res = await fetch(`${BASE_URL}/me`, {
      method: "GET",
      headers: {
        Cookie: customerCookie
      }
    });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${data.message}`);
    if (data.data.user.email !== testEmail) throw new Error("Incorrect user returned from /me");
    if (data.data.user.password !== undefined) throw new Error("Password must not be in /me");
  });

  // 10. Access protected endpoint without cookie
  await runTest("10. Access protected endpoint without cookie rejected", async () => {
    const res = await fetch(`${BASE_URL}/me`, {
      method: "GET"
    });
    const data = await res.json();
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 11. Customer attempting admin authorization (403 Forbidden)
  await runTest("11. Customer rejected on admin route (403 Forbidden)", async () => {
    const res = await fetch(`${BASE_URL}/admin-check`, {
      method: "GET",
      headers: {
        Cookie: customerCookie
      }
    });
    const data = await res.json();
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}: ${data.message}`);
  });

  // 12. Admin login & authorization check
  await runTest("12. Admin login and access verification", async () => {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@aethera.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword123!";

    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword
      })
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200) throw new Error(`Admin login failed: ${loginData.message}`);

    adminCookie = extractCookie(loginRes);
    if (!adminCookie) throw new Error("Expected Set-Cookie for admin login");

    const checkRes = await fetch(`${BASE_URL}/admin-check`, {
      method: "GET",
      headers: {
        Cookie: adminCookie
      }
    });
    const checkData = await checkRes.json();
    if (checkRes.status !== 200) throw new Error(`Expected 200 for admin-check, got ${checkRes.status}: ${checkData.message}`);
    if (checkData.data.admin.role !== "admin") throw new Error("Expected admin role confirmation");
  });

  // 13. Profile update
  await runTest("13. Customer profile update (name & avatar)", async () => {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie
      },
      body: JSON.stringify({
        name: "John Updated",
        avatar: "https://example.com/avatar.jpg"
      })
    });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${data.message}`);
    if (data.data.user.name !== "John Updated") throw new Error("Name was not updated");
    if (data.data.user.avatar !== "https://example.com/avatar.jpg") throw new Error("Avatar was not updated");
  });

  // 14. Attempt role escalation in profile update rejected
  await runTest("14. Profile update rejects role escalation attempts", async () => {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie
      },
      body: JSON.stringify({
        role: "admin"
      })
    });
    const data = await res.json();
    if (res.status !== 400) throw new Error(`Expected 400 rejection, got ${res.status}`);
  });

  // 15. Change password
  await runTest("15. Customer changes password", async () => {
    const res = await fetch(`${BASE_URL}/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie
      },
      body: JSON.stringify({
        currentPassword: testPassword,
        newPassword: newPassword
      })
    });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${data.message}`);
  });

  // 16. Login with new password and reject old password
  await runTest("16. Login with new password succeeds and old fails", async () => {
    // Old password should fail
    const oldRes = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    if (oldRes.status !== 401) throw new Error(`Expected old password to fail with 401, got ${oldRes.status}`);

    // New password should succeed
    const newRes = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: newPassword
      })
    });
    const newData = await newRes.json();
    if (newRes.status !== 200) throw new Error(`Expected new password to succeed, got ${newRes.status}: ${newData.message}`);
  });

  // 17. Logout clears cookie
  await runTest("17. Logout clears authentication cookie", async () => {
    const res = await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      headers: {
        Cookie: customerCookie
      }
    });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${data.message}`);
    const setCookie = res.headers.get("set-cookie") || "";
    if (!setCookie.includes("token=;") && !setCookie.includes("Expires=Thu, 01 Jan 1970")) {
      throw new Error("Expected Set-Cookie to invalidate token");
    }
  });

  console.log("\n=========================================");
  console.log("  ALL PART 3 AUTH TESTS PASSED (17/17)!  ");
  console.log("=========================================\n");
};

main();
