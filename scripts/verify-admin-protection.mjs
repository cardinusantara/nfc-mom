// Automated verification script for Admin Access Protection
// Tests:
// 1. verifyAdminRequest unit logic (401 on missing auth, 403 on unauthorized, 200 on authorized)
// 2. HTTP GET /api/admin/cards without auth -> 401
// 3. HTTP GET /api/admin/cards with non-admin email -> 403
// 4. HTTP GET /api/admin/cards with admin email cardinusantara@gmail.com -> 200
// 5. HTTP PATCH /api/admin/cards without auth -> 401
// 6. HTTP PATCH /api/admin/cards with non-admin email -> 403
// 7. HTTP PATCH /api/admin/cards with admin email cardinusantara@gmail.com -> 200
// 8. HTTP DELETE /api/admin/cards without auth -> 401
// 9. HTTP DELETE /api/admin/cards with non-admin email -> 403
// 10. HTTP DELETE /api/admin/cards with admin email cardinusantara@gmail.com -> 200 or 404
// 11. Zero em-dash audit

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { isAdminEmail, verifyAdminRequest } from "../src/lib/adminAuth.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

let testCount = 0;
let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`[PASS] ${message}`);
  } else {
    failCount++;
    console.error(`[FAIL] ${message}`);
  }
}

async function run() {
  console.log("==================================================");
  console.log("ADMIN ACCESS PROTECTION VERIFICATION SUITE");
  console.log("==================================================");

  // 1. Static and source code validation
  console.log("\n--- TEST 1: Source Code Structure & Guards ---");
  const navbarSrc = fs.readFileSync(path.join(PROJECT_ROOT, "src/components/Navbar.tsx"), "utf8");
  const cardDashSrc = fs.readFileSync(path.join(PROJECT_ROOT, "src/app/dashboard/card/page.tsx"), "utf8");
  const adminPageSrc = fs.readFileSync(path.join(PROJECT_ROOT, "src/app/dashboard/admin/page.tsx"), "utf8");
  const adminRouteSrc = fs.readFileSync(path.join(PROJECT_ROOT, "src/app/api/admin/cards/route.ts"), "utf8");
  const adminAuthSrc = fs.readFileSync(path.join(PROJECT_ROOT, "src/lib/adminAuth.ts"), "utf8");

  assert(adminAuthSrc.includes("cardinusantara@gmail.com"), "ADMIN_EMAIL is set to cardinusantara@gmail.com");
  assert(navbarSrc.includes("isAdmin"), "Navbar.tsx defines and uses isAdmin guard");
  assert(navbarSrc.includes("{isAdmin && ("), "Navbar.tsx wraps desktop and mobile admin navigation in isAdmin");
  assert(cardDashSrc.includes("{isAdmin && ("), "dashboard/card/page.tsx wraps admin link in isAdmin");
  assert(adminPageSrc.includes("isAdmin"), "dashboard/admin/page.tsx verifies isAdmin");
  assert(adminPageSrc.includes("403 Forbidden"), "dashboard/admin/page.tsx blocks unauthorized users with 403 state");
  assert(adminRouteSrc.includes("verifyAdminRequest"), "api/admin/cards/route.ts enforces verifyAdminRequest");

  // 1b. Unit tests for isAdminEmail helper
  console.log("\n--- TEST 1b: Unit Tests for isAdminEmail ---");
  assert(isAdminEmail("cardinusantara@gmail.com") === true, "isAdminEmail matches exact email");
  assert(isAdminEmail("CARDINUSANTARA@GMAIL.COM") === true, "isAdminEmail matches uppercase email");
  assert(isAdminEmail("  cardinusantara@gmail.com  ") === true, "isAdminEmail handles surrounding whitespace");
  assert(isAdminEmail("CardiNusantara@Gmail.Com") === true, "isAdminEmail matches mixed case email");
  assert(isAdminEmail("other@gmail.com") === false, "isAdminEmail rejects other valid emails");
  assert(isAdminEmail("cardinusantara@gmail.com.attacker.com") === false, "isAdminEmail rejects domain spoof suffix");
  assert(isAdminEmail("cardinusantara+attacker@gmail.com") === false, "isAdminEmail rejects subaddressed plus aliases");
  assert(isAdminEmail("\t cardinusantara@gmail.com\r\n ") === true, "isAdminEmail handles surrounding tabs and newlines");
  assert(isAdminEmail("") === false, "isAdminEmail rejects empty string");
  assert(isAdminEmail("   ") === false, "isAdminEmail rejects whitespace-only string");
  assert(isAdminEmail(null) === false, "isAdminEmail rejects null");
  assert(isAdminEmail(undefined) === false, "isAdminEmail rejects undefined");

  // 1c. Unit tests for verifyAdminRequest helper
  console.log("\n--- TEST 1c: Unit Tests for verifyAdminRequest ---");
  const unitMissingAuth = verifyAdminRequest(new Request("http://localhost/api/admin/cards"));
  assert(unitMissingAuth.authorized === false && unitMissingAuth.status === 401, "verifyAdminRequest returns 401 when Authorization header is missing");

  const unitBearerOnly = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: "Bearer" },
  }));
  assert(unitBearerOnly.authorized === false && unitBearerOnly.status === 401, "verifyAdminRequest returns 401 for Bearer without token");

  const unitBearerWhitespace = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: "Bearer    " },
  }));
  assert(unitBearerWhitespace.authorized === false && unitBearerWhitespace.status === 401, "verifyAdminRequest returns 401 for whitespace Bearer token");

  const unitNonBearer = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: "Basic dXNlcjpwYXNz", "x-admin-email": "cardinusantara@gmail.com" },
  }));
  assert(unitNonBearer.authorized === false && unitNonBearer.status === 401, "verifyAdminRequest returns 401 for non-Bearer authorization scheme");

  const unitMalformedJwt = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: "Bearer header.notjson.signature", "x-admin-email": "cardinusantara@gmail.com" },
  }));
  assert(unitMalformedJwt.authorized === false && unitMalformedJwt.status === 401, "verifyAdminRequest returns 401 for malformed JWT");

  const unitObjectToken = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: "Bearer [object Object]", "x-admin-email": "cardinusantara@gmail.com" },
  }));
  assert(unitObjectToken.authorized === false && unitObjectToken.status === 401, "verifyAdminRequest returns 401 for [object Object] token");

  const unitFalseToken = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: "Bearer false", "x-admin-email": "cardinusantara@gmail.com" },
  }));
  assert(unitFalseToken.authorized === false && unitFalseToken.status === 401, "verifyAdminRequest returns 401 for boolean false token");

  const unitNanToken = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: "Bearer NaN", "x-admin-email": "cardinusantara@gmail.com" },
  }));
  assert(unitNanToken.authorized === false && unitNanToken.status === 401, "verifyAdminRequest returns 401 for NaN token");

  const unitQuotedEmptyToken = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: 'Bearer ""', "x-admin-email": "cardinusantara@gmail.com" },
  }));
  assert(unitQuotedEmptyToken.authorized === false && unitQuotedEmptyToken.status === 401, "verifyAdminRequest returns 401 for quoted empty string token");

  const unitVoidToken = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: "Bearer void 0", "x-admin-email": "cardinusantara@gmail.com" },
  }));
  assert(unitVoidToken.authorized === false && unitVoidToken.status === 401, "verifyAdminRequest returns 401 for void 0 token");

  const unitQuotedNullToken = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: 'Bearer "null"', "x-admin-email": "cardinusantara@gmail.com" },
  }));
  assert(unitQuotedNullToken.authorized === false && unitQuotedNullToken.status === 401, "verifyAdminRequest returns 401 for quoted null string token");

  const unitQuotedUndefinedToken = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: "Bearer 'undefined'", "x-admin-email": "cardinusantara@gmail.com" },
  }));
  assert(unitQuotedUndefinedToken.authorized === false && unitQuotedUndefinedToken.status === 401, "verifyAdminRequest returns 401 for single-quoted undefined token");

  const nowSecUnit = Math.floor(Date.now() / 1000);
  const createUnitTestJwt = (payload) => {
    const h = Buffer.from(JSON.stringify({ alg: "HS256" })).toString("base64url");
    const p = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${h}.${p}.sig`;
  };

  const unitNeverExpJwt = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: `Bearer ${createUnitTestJwt({ email: "cardinusantara@gmail.com", exp: "never" })}` },
  }));
  assert(unitNeverExpJwt.authorized === false && unitNeverExpJwt.status === 401, "verifyAdminRequest returns 401 for non-numeric exp='never' claim");

  const unitBoolExpJwt = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: `Bearer ${createUnitTestJwt({ email: "cardinusantara@gmail.com", exp: false })}` },
  }));
  assert(unitBoolExpJwt.authorized === false && unitBoolExpJwt.status === 401, "verifyAdminRequest returns 401 for boolean exp=false claim");

  const unitExpiredMsJwt = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: `Bearer ${createUnitTestJwt({ email: "cardinusantara@gmail.com", exp: 1600000000000 })}` },
  }));
  assert(unitExpiredMsJwt.authorized === false && unitExpiredMsJwt.status === 401, "verifyAdminRequest returns 401 for expired millisecond exp claim");

  const unitNegativeExpJwt = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: `Bearer ${createUnitTestJwt({ email: "cardinusantara@gmail.com", exp: -100 })}` },
  }));
  assert(unitNegativeExpJwt.authorized === false && unitNegativeExpJwt.status === 401, "verifyAdminRequest returns 401 for negative exp claim");

  const unitZeroExpJwt = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: `Bearer ${createUnitTestJwt({ email: "cardinusantara@gmail.com", exp: 0 })}` },
  }));
  assert(unitZeroExpJwt.authorized === false && unitZeroExpJwt.status === 401, "verifyAdminRequest returns 401 for zero exp claim");

  const unitPlusEmailJwt = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: `Bearer ${createUnitTestJwt({ email: "cardinusantara+attacker@gmail.com", exp: nowSecUnit + 3600 })}` },
  }));
  assert(unitPlusEmailJwt.authorized === false && unitPlusEmailJwt.status === 403, "verifyAdminRequest returns 403 for plus-aliased email JWT");

  const unitCaseMatchJwt = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: {
      authorization: `Bearer ${createUnitTestJwt({ email: "CardiNusantara@Gmail.Com", exp: nowSecUnit + 3600 })}`,
      "x-admin-email": "cardinusantara@gmail.com",
    },
  }));
  assert(unitCaseMatchJwt.authorized === true && unitCaseMatchJwt.status === 200, "verifyAdminRequest returns 200 for case-insensitive matching JWT and header");

  const unitValidMsJwt = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: `Bearer ${createUnitTestJwt({ email: "cardinusantara@gmail.com", exp: (nowSecUnit + 3600) * 1000 })}` },
  }));
  assert(unitValidMsJwt.authorized === true && unitValidMsJwt.status === 200, "verifyAdminRequest returns 200 for valid future millisecond exp claim");

  const unitRawEmailToken = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: "Bearer cardinusantara@gmail.com" },
  }));
  assert(unitRawEmailToken.authorized === false && unitRawEmailToken.status === 401, "verifyAdminRequest returns 401 when raw email is passed as Bearer token");

  const unitNonAdmin = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: "Bearer mock_regular_token", "x-admin-email": "user@test.com" },
  }));
  assert(unitNonAdmin.authorized === false && unitNonAdmin.status === 403, "verifyAdminRequest returns 403 for non-admin email");

  const unitAdmin = verifyAdminRequest(new Request("http://localhost/api/admin/cards", {
    headers: { authorization: "Bearer mock_valid_session_token", "x-admin-email": "cardinusantara@gmail.com" },
  }));
  assert(unitAdmin.authorized === true && unitAdmin.status === 200, "verifyAdminRequest returns 200 for valid admin request");

  // 1d. Client State & Session Hydration Matrix Simulation
  console.log("\n--- TEST 1d: Client Session Hydration Matrix Simulation ---");
  const simulateClientGuards = ({ hasHydrated, sessionToken, accountEmail }) => {
    const isAuthenticated = Boolean(
      hasHydrated &&
      sessionToken &&
      sessionToken.trim().length > 0 &&
      accountEmail &&
      accountEmail.trim().length > 0
    );
    const isAdmin = Boolean(
      hasHydrated &&
      isAuthenticated &&
      accountEmail &&
      isAdminEmail(accountEmail)
    );
    const navIsAdmin = Boolean(
      sessionToken &&
      sessionToken.trim().length > 0 &&
      accountEmail &&
      isAdminEmail(accountEmail)
    );
    return { isAuthenticated, isAdmin, navIsAdmin };
  };

  const preHydration = simulateClientGuards({
    hasHydrated: false,
    sessionToken: "admin_token",
    accountEmail: "cardinusantara@gmail.com",
  });
  assert(preHydration.isAdmin === false, "Admin page guard remains false before client hydration completes");

  const unauthenticatedVisitor = simulateClientGuards({
    hasHydrated: true,
    sessionToken: null,
    accountEmail: null,
  });
  assert(unauthenticatedVisitor.isAdmin === false, "Unauthenticated visitor cannot access admin view");
  assert(unauthenticatedVisitor.navIsAdmin === false, "Unauthenticated visitor has no admin nav buttons");

  const whitespaceTokenVisitor = simulateClientGuards({
    hasHydrated: true,
    sessionToken: "   ",
    accountEmail: "cardinusantara@gmail.com",
  });
  assert(whitespaceTokenVisitor.isAuthenticated === false, "Whitespace sessionToken is treated as unauthenticated");
  assert(whitespaceTokenVisitor.isAdmin === false, "Whitespace sessionToken cannot access admin view");
  assert(whitespaceTokenVisitor.navIsAdmin === false, "Whitespace sessionToken has no admin nav buttons");

  const regularUserSession = simulateClientGuards({
    hasHydrated: true,
    sessionToken: "valid_session_token_123",
    accountEmail: "regularuser@gmail.com",
  });
  assert(regularUserSession.isAuthenticated === true, "Regular user is authenticated");
  assert(regularUserSession.isAdmin === false, "Regular user is blocked from admin dashboard");
  assert(regularUserSession.navIsAdmin === false, "Regular user has no admin nav buttons");

  const adminOwnerSession = simulateClientGuards({
    hasHydrated: true,
    sessionToken: "valid_session_token_456",
    accountEmail: "cardinusantara@gmail.com",
  });
  assert(adminOwnerSession.isAuthenticated === true, "Admin owner is authenticated");
  assert(adminOwnerSession.isAdmin === true, "Admin owner is granted access to admin dashboard");
  assert(adminOwnerSession.navIsAdmin === true, "Admin owner sees admin navigation buttons");

  // 2. HTTP Route Testing on live Next.js server
  console.log("\n--- STARTING NEXT.JS SERVER FOR ADMIN HTTP TESTS ---");
  const testPort = 3848;
  const serverProcess = spawn(
    "node",
    ["./node_modules/next/dist/bin/next", "start", "-p", String(testPort)],
    { cwd: PROJECT_ROOT, stdio: "pipe" }
  );

  let serverStarted = false;
  serverProcess.stdout.on("data", (data) => {
    const text = data.toString();
    if (text.includes("Ready") || text.includes("started") || text.includes(String(testPort))) {
      serverStarted = true;
    }
  });

  const maxWaitMs = 15000;
  const startTime = Date.now();
  while (!serverStarted && Date.now() - startTime < maxWaitMs) {
    try {
      const probe = await fetch(`http://localhost:${testPort}/api/nfc/profile/deo`);
      if (probe.status === 200) {
        serverStarted = true;
        break;
      }
    } catch {
      // Retry
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  assert(serverStarted, `Next.js server started on port ${testPort}`);

  try {
    // Test 2: GET /api/admin/cards without auth -> 401
    console.log("\n--- TEST 2: Unauthenticated GET /api/admin/cards ---");
    const unauthGetRes = await fetch(`http://localhost:${testPort}/api/admin/cards`);
    assert(unauthGetRes.status === 401, `GET without auth returns 401 (got ${unauthGetRes.status})`);
    const unauthGetJson = await unauthGetRes.json();
    assert(unauthGetJson.success === false, "unauth GET success is false");
    assert(Boolean(unauthGetJson.error), `unauth GET error message returned: "${unauthGetJson.error}"`);

    // Test 3: GET /api/admin/cards with unauthorized non-admin user -> 403
    console.log("\n--- TEST 3: Unauthorized (Non-Admin) GET /api/admin/cards ---");
    const forbiddenGetRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: {
        Authorization: "Bearer mock_regular_user_token_123",
        "x-admin-email": "regularuser@gmail.com",
      },
    });
    assert(forbiddenGetRes.status === 403, `GET with regular user returns 403 Forbidden (got ${forbiddenGetRes.status})`);
    const forbiddenGetJson = await forbiddenGetRes.json();
    assert(forbiddenGetJson.success === false, "forbidden GET success is false");

    // Test 4: GET /api/admin/cards with admin owner cardinusantara@gmail.com -> 200
    console.log("\n--- TEST 4: Authorized Admin GET /api/admin/cards ---");
    const adminGetRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: {
        Authorization: "Bearer mock_valid_session_token_xyz",
        "x-admin-email": "cardinusantara@gmail.com",
      },
    });
    assert(adminGetRes.status === 200, `GET with admin email returns 200 OK (got ${adminGetRes.status})`);
    const adminGetJson = await adminGetRes.json();
    assert(adminGetJson.success === true, "admin GET success is true");
    assert(Array.isArray(adminGetJson.profiles), "admin GET returns profiles array");
    assert(adminGetJson.count >= 1, `admin GET returned profiles count: ${adminGetJson.count}`);

    // Test 4b: Case-insensitive email match
    const adminUpperGetRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: {
        Authorization: "Bearer mock_valid_session_token_xyz",
        "x-admin-email": "CARDINUSANTARA@GMAIL.COM",
      },
    });
    assert(adminUpperGetRes.status === 200, `GET with uppercase admin email returns 200 OK (got ${adminUpperGetRes.status})`);

    // Test 5: PATCH /api/admin/cards without auth -> 401
    console.log("\n--- TEST 5: Unauthenticated PATCH /api/admin/cards ---");
    const unauthPatchRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "deo", isActivated: true }),
    });
    assert(unauthPatchRes.status === 401, `PATCH without auth returns 401 (got ${unauthPatchRes.status})`);

    // Test 6: PATCH /api/admin/cards with unauthorized non-admin user -> 403
    console.log("\n--- TEST 6: Unauthorized (Non-Admin) PATCH /api/admin/cards ---");
    const forbiddenPatchRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer regular_token",
        "x-admin-email": "hacker@evil.com",
      },
      body: JSON.stringify({ username: "deo", isActivated: false }),
    });
    assert(forbiddenPatchRes.status === 403, `PATCH with non-admin returns 403 Forbidden (got ${forbiddenPatchRes.status})`);

    // Test 7: PATCH /api/admin/cards with authorized admin -> 200
    console.log("\n--- TEST 7: Authorized Admin PATCH /api/admin/cards ---");
    const adminPatchRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer mock_valid_session_token_xyz",
        "x-admin-email": "cardinusantara@gmail.com",
      },
      body: JSON.stringify({ username: "deo", headline: "Founder & CEO" }),
    });
    assert(adminPatchRes.status === 200, `PATCH with admin email returns 200 OK (got ${adminPatchRes.status})`);
    const adminPatchJson = await adminPatchRes.json();
    assert(adminPatchJson.success === true, "PATCH response success is true");
    assert(adminPatchJson.profile?.headline === "Founder & CEO", "Card headline was successfully updated");

    // Test 8: DELETE /api/admin/cards without auth -> 401
    console.log("\n--- TEST 8: Unauthenticated DELETE /api/admin/cards ---");
    const unauthDeleteRes = await fetch(`http://localhost:${testPort}/api/admin/cards?username=dummy_user`, {
      method: "DELETE",
    });
    assert(unauthDeleteRes.status === 401, `DELETE without auth returns 401 (got ${unauthDeleteRes.status})`);

    // Test 9: DELETE /api/admin/cards with unauthorized non-admin user -> 403
    console.log("\n--- TEST 9: Unauthorized (Non-Admin) DELETE /api/admin/cards ---");
    const forbiddenDeleteRes = await fetch(`http://localhost:${testPort}/api/admin/cards?username=dummy_user`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer token_abc",
        "x-admin-email": "user@not-admin.com",
      },
    });
    assert(forbiddenDeleteRes.status === 403, `DELETE with non-admin returns 403 Forbidden (got ${forbiddenDeleteRes.status})`);

    // Test 10: DELETE /api/admin/cards with authorized admin on non-existent card -> 404
    console.log("\n--- TEST 10: Authorized Admin DELETE /api/admin/cards (Card Not Found check) ---");
    const adminDeleteNotFoundRes = await fetch(`http://localhost:${testPort}/api/admin/cards?username=definitely_non_existent_card`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer admin_valid_session",
        "x-admin-email": "cardinusantara@gmail.com",
      },
    });
    assert(adminDeleteNotFoundRes.status === 404, `DELETE non-existent card returns 404 (got ${adminDeleteNotFoundRes.status})`);

    // Test 11: JWT Token validation & edge cases
    console.log("\n--- TEST 11: JWT Token Parsing, Expiration, and Identity Spoofing Protection ---");
    const nowSec = Math.floor(Date.now() / 1000);
    const createJwt = (payload) => {
      const h = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
      const p = Buffer.from(JSON.stringify(payload)).toString("base64url");
      return `${h}.${p}.signature`;
    };

    // Valid admin JWT
    const adminJwt = createJwt({ email: "cardinusantara@gmail.com", exp: nowSec + 3600 });
    const adminJwtRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: `Bearer ${adminJwt}` },
    });
    assert(adminJwtRes.status === 200, `GET with valid admin JWT returns 200 OK (got ${adminJwtRes.status})`);

    // Valid regular user JWT -> 403
    const userJwt = createJwt({ email: "user@example.com", exp: nowSec + 3600 });
    const userJwtRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: `Bearer ${userJwt}` },
    });
    assert(userJwtRes.status === 403, `GET with regular user JWT returns 403 Forbidden (got ${userJwtRes.status})`);

    // Conflicting identity attack: user JWT with forged x-admin-email header -> 403
    const spoofJwtRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: {
        Authorization: `Bearer ${userJwt}`,
        "x-admin-email": "cardinusantara@gmail.com",
      },
    });
    assert(spoofJwtRes.status === 403, `GET with conflicting user JWT + forged x-admin-email returns 403 (got ${spoofJwtRes.status})`);

    // JWT missing email claim attack: JWT without email claim + forged x-admin-email -> 403
    const noEmailJwt = createJwt({ sub: "attacker_user_999", exp: nowSec + 3600 });
    const noEmailJwtRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: {
        Authorization: `Bearer ${noEmailJwt}`,
        "x-admin-email": "cardinusantara@gmail.com",
      },
    });
    assert(noEmailJwtRes.status === 403, `GET with JWT lacking email claim returns 403 Forbidden (got ${noEmailJwtRes.status})`);

    // Malformed JWT token attack: corrupt token structure -> 401
    const malformedJwtRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: {
        Authorization: "Bearer header.not_json_payload.signature",
        "x-admin-email": "cardinusantara@gmail.com",
      },
    });
    assert(malformedJwtRes.status === 401, `GET with malformed JWT returns 401 Unauthorized (got ${malformedJwtRes.status})`);

    // Unsupported scheme attack: Basic auth -> 401
    const basicAuthRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: {
        Authorization: "Basic dXNlcjpwYXNz",
        "x-admin-email": "cardinusantara@gmail.com",
      },
    });
    assert(basicAuthRes.status === 401, `GET with non-Bearer Basic scheme returns 401 Unauthorized (got ${basicAuthRes.status})`);

    // Expired admin JWT -> 401
    const expiredAdminJwt = createJwt({ email: "cardinusantara@gmail.com", exp: nowSec - 300 });
    const expiredRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: `Bearer ${expiredAdminJwt}` },
    });
    assert(expiredRes.status === 401, `GET with expired admin JWT returns 401 (got ${expiredRes.status})`);

    // Bearer token boundary edge cases
    const bearerOnlyRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: "Bearer" },
    });
    assert(bearerOnlyRes.status === 401, `GET with Authorization 'Bearer' without space returns 401 (got ${bearerOnlyRes.status})`);

    const bearerUndefinedRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: "Bearer undefined" },
    });
    assert(bearerUndefinedRes.status === 401, `GET with Authorization 'Bearer undefined' returns 401 (got ${bearerUndefinedRes.status})`);

    const bearerNullRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: "Bearer null" },
    });
    assert(bearerNullRes.status === 401, `GET with Authorization 'Bearer null' returns 401 (got ${bearerNullRes.status})`);

    const bearerObjectRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: "Bearer [object Object]", "x-admin-email": "cardinusantara@gmail.com" },
    });
    assert(bearerObjectRes.status === 401, `GET with Authorization 'Bearer [object Object]' returns 401 (got ${bearerObjectRes.status})`);

    const bearerFalseRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: "Bearer false", "x-admin-email": "cardinusantara@gmail.com" },
    });
    assert(bearerFalseRes.status === 401, `GET with Authorization 'Bearer false' returns 401 (got ${bearerFalseRes.status})`);

    const bearerNanRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: "Bearer NaN", "x-admin-email": "cardinusantara@gmail.com" },
    });
    assert(bearerNanRes.status === 401, `GET with Authorization 'Bearer NaN' returns 401 (got ${bearerNanRes.status})`);

    const bearerQuotedEmptyRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: 'Bearer ""', "x-admin-email": "cardinusantara@gmail.com" },
    });
    assert(bearerQuotedEmptyRes.status === 401, `GET with Authorization 'Bearer \"\"' returns 401 (got ${bearerQuotedEmptyRes.status})`);

    const bearerVoidRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: "Bearer void 0", "x-admin-email": "cardinusantara@gmail.com" },
    });
    assert(bearerVoidRes.status === 401, `GET with Authorization 'Bearer void 0' returns 401 (got ${bearerVoidRes.status})`);

    const bearerQuotedNullRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: 'Bearer "null"', "x-admin-email": "cardinusantara@gmail.com" },
    });
    assert(bearerQuotedNullRes.status === 401, `GET with Authorization 'Bearer \"null\"' returns 401 (got ${bearerQuotedNullRes.status})`);

    const bearerQuotedUndefinedRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: "Bearer 'undefined'", "x-admin-email": "cardinusantara@gmail.com" },
    });
    assert(bearerQuotedUndefinedRes.status === 401, `GET with Authorization 'Bearer \\'undefined\\'' returns 401 (got ${bearerQuotedUndefinedRes.status})`);

    const stringExpJwt = createJwt({ email: "cardinusantara@gmail.com", exp: String(nowSec - 600) });
    const stringExpRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: `Bearer ${stringExpJwt}` },
    });
    assert(stringExpRes.status === 401, `GET with expired string numeric exp JWT returns 401 (got ${stringExpRes.status})`);

    const neverExpJwt = createJwt({ email: "cardinusantara@gmail.com", exp: "never" });
    const neverExpRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: `Bearer ${neverExpJwt}` },
    });
    assert(neverExpRes.status === 401, `GET with non-numeric exp='never' JWT returns 401 (got ${neverExpRes.status})`);

    const expiredMsJwt = createJwt({ email: "cardinusantara@gmail.com", exp: 1600000000000 });
    const expiredMsRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: `Bearer ${expiredMsJwt}` },
    });
    assert(expiredMsRes.status === 401, `GET with expired millisecond exp JWT returns 401 (got ${expiredMsRes.status})`);

    const negativeExpJwt = createJwt({ email: "cardinusantara@gmail.com", exp: -100 });
    const negativeExpRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: `Bearer ${negativeExpJwt}` },
    });
    assert(negativeExpRes.status === 401, `GET with negative exp JWT returns 401 (got ${negativeExpRes.status})`);

    const zeroExpJwt = createJwt({ email: "cardinusantara@gmail.com", exp: 0 });
    const zeroExpRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: `Bearer ${zeroExpJwt}` },
    });
    assert(zeroExpRes.status === 401, `GET with zero exp JWT returns 401 (got ${zeroExpRes.status})`);

    const plusAddressJwt = createJwt({ email: "cardinusantara+attack@gmail.com", exp: nowSec + 3600 });
    const plusAddressRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: `Bearer ${plusAddressJwt}` },
    });
    assert(plusAddressRes.status === 403, `GET with plus-address alias JWT returns 403 (got ${plusAddressRes.status})`);

    const validMsJwt = createJwt({ email: "cardinusantara@gmail.com", exp: (nowSec + 3600) * 1000 });
    const validMsRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: `Bearer ${validMsJwt}` },
    });
    assert(validMsRes.status === 200, `GET with valid future millisecond exp JWT returns 200 OK (got ${validMsRes.status})`);

    const rawEmailTokenRes = await fetch(`http://localhost:${testPort}/api/admin/cards`, {
      headers: { Authorization: "Bearer cardinusantara@gmail.com" },
    });
    assert(rawEmailTokenRes.status === 401, `GET with raw email as Bearer token returns 401 (got ${rawEmailTokenRes.status})`);

    // Test 12: Public & Unauthenticated UI Visibility via SSR
    console.log("\n--- TEST 12: Public & Regular User UI Visibility Audits ---");
    const homeHtml = await (await fetch(`http://localhost:${testPort}/`)).text();
    assert(!homeHtml.includes("Admin: Kelola Kartu"), "Public SSR homepage does not render 'Admin: Kelola Kartu'");

    const cardDashHtml = await (await fetch(`http://localhost:${testPort}/dashboard/card`)).text();
    assert(!cardDashHtml.includes("Kelola Semua Kartu"), "Public SSR card dashboard does not render 'Kelola Semua Kartu'");
    assert(!cardDashHtml.includes("Admin: Kelola Kartu"), "Public SSR card dashboard does not render Navbar admin link");

    const adminPageHtml = await (await fetch(`http://localhost:${testPort}/dashboard/admin`)).text();
    assert(!adminPageHtml.includes("Export CSV"), "Public SSR admin page does not leak 'Export CSV' button");
    assert(!adminPageHtml.includes("Aktivasi Kartu Baru"), "Public SSR admin page does not leak admin activation button");
  } finally {
    serverProcess.kill();
  }

  // 13. Zero Em Dash Check
  console.log("\n--- TEST 13: Zero Em Dash (\u2014) Audit ---");
  const scanDirs = ["src", "scripts"];
  let emDashCount = 0;
  const violations = [];

  function scanFolder(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        scanFolder(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") || entry.name.endsWith(".js") || entry.name.endsWith(".mjs"))) {
        const content = fs.readFileSync(fullPath, "utf8");
        if (content.includes("\u2014")) {
          emDashCount++;
          violations.push(fullPath);
        }
      }
    }
  }

  for (const dir of scanDirs) {
    scanFolder(path.join(PROJECT_ROOT, dir));
  }

  assert(emDashCount === 0, `ZERO em dash characters found across src/ and scripts/ (violations: ${emDashCount})`);
  if (violations.length > 0) {
    console.error("Violating files:", violations);
  }

  console.log("\n==================================================");
  console.log(`VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED out of ${testCount} tests`);
  console.log("==================================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Verification suite failed:", err);
  process.exit(1);
});
