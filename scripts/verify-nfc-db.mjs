// Automated verification script for NFC Database operations and Card Activation
// Tests:
// 1. SQLite DB initialization and seed verification ('deo' profile with email cardinusantara@gmail.com)
// 2. Activating a card with custom username slug (tag CRD-NEW-999, username deo-partner)
// 3. Verifying getCardProfileByUsername('deo-partner') returns tagId CRD-NEW-999 and custom username
// 4. Verifying getCardProfileByTagId('CRD-NEW-999') returns username 'deo-partner'
// 5. Verifying duplicate tag activation returns conflict (409)
// 6. Verifying duplicate username activation returns conflict (409)
// 7. Verifying public profile endpoint lookup at /[username]
// 8. Static source code guards verification for all activation and admin routes
// 9. Admin token handling verification (2-part signed session tokens, 3-part JWTs, raw email rejection)
// 10. Zero em dash audit across src/ and scripts/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  getDb,
  getCardProfileByUsername,
  getCardProfileByTagId,
  upsertCardProfile,
  listAllProfiles,
  deleteCardProfile,
} from "../src/lib/server/db.ts";

import { verifyAdminRequest, isAdminEmail } from "../src/lib/adminAuth.ts";

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

// Card activation workflow simulation mirroring src/app/api/nfc/activate/route.ts
function executeCardActivation({
  tagId,
  username,
  email,
  fullName,
  headline,
  company,
  phone,
  bundleTier,
  cardDesign,
}) {
  if (!tagId || typeof tagId !== "string" || !tagId.trim()) {
    return {
      status: 400,
      data: { success: false, error: "Tag ID kartu NFC wajib diisi." },
    };
  }
  const cleanTag = tagId.trim().toUpperCase();

  if (!username || typeof username !== "string" || !username.trim()) {
    return {
      status: 400,
      data: { success: false, error: "Username wajib diisi." },
    };
  }
  const cleanUser = username.trim().toLowerCase();
  const usernameRegex = /^[a-z0-9_-]{3,30}$/;
  if (!usernameRegex.test(cleanUser)) {
    return {
      status: 400,
      data: {
        success: false,
        error:
          "Username harus terdiri dari 3-30 karakter alfanumerik (huruf kecil, angka, garis bawah, atau strip).",
      },
    };
  }

  // Conflict check: Tag ID already bound
  const existingTagProfile = getCardProfileByTagId(cleanTag);
  if (existingTagProfile) {
    return {
      status: 409,
      data: {
        success: false,
        error: `Tag ID ${cleanTag} sudah terdaftar dan terikat pada profil @${existingTagProfile.username}.`,
      },
    };
  }

  // Conflict check: Username already taken
  const existingUserProfile = getCardProfileByUsername(cleanUser);
  if (existingUserProfile) {
    return {
      status: 409,
      data: {
        success: false,
        error: `Username @${cleanUser} sudah digunakan. Silakan pilih username lain.`,
      },
    };
  }

  let coinsCredited = 50;
  if (bundleTier === "bulk") coinsCredited = 2500;
  else if (bundleTier === "quick") coinsCredited = 500;

  const userEmail =
    email && typeof email === "string" && email.trim()
      ? email.trim()
      : `${cleanUser}@cardi.co.id`;

  const profile = upsertCardProfile({
    username: cleanUser,
    tagId: cleanTag,
    fullName: fullName ? fullName.trim() : "Pengguna Cardi",
    headline: headline ? headline.trim() : "Professional & Business Leader",
    company: company ? company.trim() : "Cardi",
    phone: phone ? phone.trim() : "",
    email: userEmail,
    cardDesign: cardDesign || "black-gold",
    isActivated: true,
  });

  return {
    status: 200,
    data: {
      success: true,
      username: cleanUser,
      tagId: cleanTag,
      email: profile.email,
      coinsCredited,
      totalCoinsBalance: coinsCredited,
      profile,
    },
  };
}

// Public profile resolution simulation mirroring src/app/api/nfc/profile/[username]/route.ts
function resolvePublicProfile(username) {
  if (!username || typeof username !== "string" || !username.trim()) {
    return {
      status: 400,
      data: { success: false, error: "Username tidak valid" },
    };
  }
  const cleanUser = decodeURIComponent(username).toLowerCase().trim();
  const profile = getCardProfileByUsername(cleanUser);
  if (!profile) {
    return {
      status: 404,
      data: { success: false, error: "Profil kartu tidak ditemukan" },
    };
  }
  return {
    status: 200,
    data: { success: true, profile },
  };
}

async function run() {
  console.log("==================================================");
  console.log("NFC DATABASE AND ACTIVATION VERIFICATION SUITE");
  console.log("==================================================");

  // 1. Database initialization and seed check
  console.log("\n--- TEST 1: Database Initialization and Seed Profile ---");
  const db = getDb();
  assert(Boolean(db), "SQLite database initialized successfully");

  const seedProfile = getCardProfileByUsername("deo");
  assert(Boolean(seedProfile), "Seed profile 'deo' exists in SQLite database");
  assert(seedProfile?.username === "deo", "Seed profile has username 'deo'");
  assert(
    seedProfile?.email === "cardinusantara@gmail.com",
    "Seed profile has email 'cardinusantara@gmail.com'"
  );
  assert(seedProfile?.tagId === "CRD-DEO-001", "Seed profile has tagId 'CRD-DEO-001'");
  assert(seedProfile?.isActivated === true, "Seed profile is marked as activated");

  // Clean up any test records from prior runs to ensure idempotent execution
  deleteCardProfile("deo-partner");
  deleteCardProfile("another-partner");
  deleteCardProfile("test-custom-slug");

  // 2. Card activation with custom username slug
  console.log("\n--- TEST 2: Activating Card with Custom Username Slug ---");
  const activationResult = executeCardActivation({
    tagId: "CRD-NEW-999",
    username: "deo-partner",
    email: "partner@example.com",
    fullName: "Deo Strategic Partner",
    headline: "Managing Director",
    company: "Cardi Partner Network",
    phone: "+62 812-3456-7890",
    bundleTier: "quick",
    cardDesign: "royal-blue",
  });

  assert(
    activationResult.status === 200,
    `Activation returns status 200 (got ${activationResult.status})`
  );
  assert(
    activationResult.data.success === true,
    "Activation response success is true"
  );
  assert(
    activationResult.data.username === "deo-partner",
    "Activation returned custom username 'deo-partner'"
  );
  assert(
    activationResult.data.tagId === "CRD-NEW-999",
    "Activation returned tagId 'CRD-NEW-999'"
  );
  assert(
    activationResult.data.email === "partner@example.com",
    "Activation returned email 'partner@example.com'"
  );
  assert(
    activationResult.data.coinsCredited === 500,
    "Activation credited 500 coins for quick tier"
  );
  assert(
    activationResult.data.totalCoinsBalance === 500,
    "Activation total coins balance is 500"
  );
  assert(
    activationResult.data.profile?.company === "Cardi Partner Network",
    "Activation saved company name in database"
  );

  // 3. Verifying getCardProfileByUsername returns custom username and tagId
  console.log("\n--- TEST 3: Lookup by Custom Username Slug ---");
  const fetchedByUsername = getCardProfileByUsername("deo-partner");
  assert(Boolean(fetchedByUsername), "getCardProfileByUsername finds 'deo-partner'");
  assert(
    fetchedByUsername?.username === "deo-partner",
    "Profile username matches 'deo-partner'"
  );
  assert(
    fetchedByUsername?.tagId === "CRD-NEW-999",
    "Profile tagId matches 'CRD-NEW-999'"
  );
  assert(
    fetchedByUsername?.fullName === "Deo Strategic Partner",
    "Profile fullName is preserved"
  );
  assert(
    fetchedByUsername?.cardDesign === "royal-blue",
    "Profile cardDesign is 'royal-blue'"
  );
  assert(
    fetchedByUsername?.isActivated === true,
    "Profile is marked activated in database"
  );

  // Case-insensitivity check
  const fetchedMixedCase = getCardProfileByUsername("DeO-PaRtNeR");
  assert(
    Boolean(fetchedMixedCase),
    "getCardProfileByUsername handles mixed-case username"
  );
  assert(
    fetchedMixedCase?.username === "deo-partner",
    "Mixed case lookup resolves canonical username"
  );

  // 4. Verifying getCardProfileByTagId returns custom username
  console.log("\n--- TEST 4: Lookup by Physical NFC Tag ID ---");
  const fetchedByTag = getCardProfileByTagId("CRD-NEW-999");
  assert(
    Boolean(fetchedByTag),
    "getCardProfileByTagId finds profile for 'CRD-NEW-999'"
  );
  assert(
    fetchedByTag?.username === "deo-partner",
    "Tag lookup returns username 'deo-partner'"
  );
  assert(
    fetchedByTag?.email === "partner@example.com",
    "Tag lookup returns partner email"
  );

  // Tag case-insensitivity check
  const fetchedLowerTag = getCardProfileByTagId("crd-new-999");
  assert(
    Boolean(fetchedLowerTag),
    "getCardProfileByTagId handles lowercase tag ID input"
  );
  assert(
    fetchedLowerTag?.username === "deo-partner",
    "Lowercase tag lookup resolves profile"
  );

  // 5. Duplicate tag rejection
  console.log("\n--- TEST 5: Duplicate Tag ID Conflict Detection ---");
  const dupTagResult = executeCardActivation({
    tagId: "CRD-NEW-999",
    username: "another-partner",
    email: "another@example.com",
    fullName: "Another Partner",
  });
  assert(
    dupTagResult.status === 409,
    `Duplicate tag returns status 409 conflict (got ${dupTagResult.status})`
  );
  assert(
    dupTagResult.data.success === false,
    "Duplicate tag response success is false"
  );
  assert(
    Boolean(dupTagResult.data.error && dupTagResult.data.error.includes("CRD-NEW-999")),
    `Duplicate tag error message mentions tag: "${dupTagResult.data.error}"`
  );

  // 6. Duplicate username rejection
  console.log("\n--- TEST 6: Duplicate Username Conflict Detection ---");
  const dupUserResult = executeCardActivation({
    tagId: "CRD-BRAND-NEW-111",
    username: "deo-partner",
    email: "newperson@example.com",
    fullName: "New Person",
  });
  assert(
    dupUserResult.status === 409,
    `Duplicate username returns status 409 conflict (got ${dupUserResult.status})`
  );
  assert(
    dupUserResult.data.success === false,
    "Duplicate username response success is false"
  );
  assert(
    Boolean(dupUserResult.data.error && dupUserResult.data.error.includes("deo-partner")),
    `Duplicate username error message mentions username: "${dupUserResult.data.error}"`
  );

  // 7. Public profile resolution endpoint
  console.log("\n--- TEST 7: Public Profile Resolution Endpoint ---");
  const publicResult = resolvePublicProfile("deo-partner");
  assert(
    publicResult.status === 200,
    `Public profile lookup returns 200 (got ${publicResult.status})`
  );
  assert(
    publicResult.data.success === true,
    "Public profile lookup success is true"
  );
  assert(
    publicResult.data.profile?.username === "deo-partner",
    "Public profile has username 'deo-partner'"
  );
  assert(
    publicResult.data.profile?.tagId === "CRD-NEW-999",
    "Public profile has tagId 'CRD-NEW-999'"
  );

  // Non-existent profile resolution check
  const missingResult = resolvePublicProfile("definitely-not-found");
  assert(
    missingResult.status === 404,
    `Non-existent public profile returns 404 (got ${missingResult.status})`
  );
  assert(
    missingResult.data.success === false,
    "Non-existent profile lookup success is false"
  );

  // 8. Source Code Structure & Guards Validation
  console.log("\n--- TEST 8: Source Code Structure & Implementation Guards ---");
  const activateRoutePath = path.join(PROJECT_ROOT, "src/app/api/nfc/activate/route.ts");
  const profileRoutePath = path.join(
    PROJECT_ROOT,
    "src/app/api/nfc/profile/[username]/route.ts"
  );
  const adminRoutePath = path.join(PROJECT_ROOT, "src/app/api/admin/cards/route.ts");
  const activatePagePath = path.join(PROJECT_ROOT, "src/app/activate/page.tsx");
  const storePath = path.join(PROJECT_ROOT, "src/lib/store.ts");

  assert(fs.existsSync(activateRoutePath), "src/app/api/nfc/activate/route.ts exists");
  assert(
    fs.existsSync(profileRoutePath),
    "src/app/api/nfc/profile/[username]/route.ts exists"
  );
  assert(fs.existsSync(adminRoutePath), "src/app/api/admin/cards/route.ts exists");

  const activateRouteSrc = fs.readFileSync(activateRoutePath, "utf8");
  assert(
    activateRouteSrc.includes("getCardProfileByTagId"),
    "activate route checks duplicate tagId via getCardProfileByTagId"
  );
  assert(
    activateRouteSrc.includes("getCardProfileByUsername"),
    "activate route checks duplicate username via getCardProfileByUsername"
  );
  assert(
    activateRouteSrc.includes("upsertCardProfile"),
    "activate route persists profile via upsertCardProfile"
  );
  assert(
    activateRouteSrc.includes("status: 409"),
    "activate route returns 409 status on conflicts"
  );

  const profileRouteSrc = fs.readFileSync(profileRoutePath, "utf8");
  assert(
    profileRouteSrc.includes("getCardProfileByUsername"),
    "profile route queries SQLite via getCardProfileByUsername"
  );
  assert(
    profileRouteSrc.includes("status: 404"),
    "profile route returns 404 status when profile is not found"
  );

  const adminRouteSrc = fs.readFileSync(adminRoutePath, "utf8");
  assert(
    adminRouteSrc.includes("verifyAdminRequest"),
    "admin cards route enforces verifyAdminRequest"
  );
  assert(
    adminRouteSrc.includes("listAllProfiles"),
    "admin cards route lists profiles via listAllProfiles"
  );
  assert(
    adminRouteSrc.includes("updateCardProfile"),
    "admin cards route updates profiles via updateCardProfile"
  );
  assert(
    adminRouteSrc.includes("deleteCardProfile"),
    "admin cards route deletes profiles via deleteCardProfile"
  );

  const activatePageSrc = fs.readFileSync(activatePagePath, "utf8");
  assert(
    activatePageSrc.includes('id="username"'),
    'activate page contains id="username" on username input'
  );
  assert(
    activatePageSrc.includes('name="username"'),
    'activate page contains name="username" on username input'
  );
  assert(
    activatePageSrc.includes("isLoggedIn"),
    "activate page checks isLoggedIn state for session isolation"
  );

  const storeSrc = fs.readFileSync(storePath, "utf8");
  assert(
    storeSrc.includes("export function useAuthSession"),
    "store.ts exports useAuthSession hook"
  );
  assert(
    storeSrc.includes("hasHydrated") && storeSrc.includes("isAuthenticated"),
    "useAuthSession returns hasHydrated and isAuthenticated"
  );

  // 9. Admin Token Handling Verification
  console.log("\n--- TEST 9: Admin Token Handling (R1 Verification) ---");
  // 9a. 2-part opaque signed session token
  const unit2PartOpaque = verifyAdminRequest(
    new Request("http://localhost/api/admin/cards", {
      headers: {
        authorization: "Bearer sess_abc123.sig456",
        "x-admin-email": "cardinusantara@gmail.com",
      },
    })
  );
  assert(
    unit2PartOpaque.authorized === true && unit2PartOpaque.status === 200,
    "verifyAdminRequest returns 200 for 2-part opaque signed session token (sess_abc123.sig456)"
  );
  assert(
    unit2PartOpaque.email === "cardinusantara@gmail.com",
    "verifyAdminRequest resolves admin email from x-admin-email header"
  );

  // 9b. 2-part token with base64url JSON claims
  const nowSec = Math.floor(Date.now() / 1000);
  const jsonClaimPart = Buffer.from(
    JSON.stringify({ email: "dimasaldi428@gmail.com", exp: nowSec + 3600 })
  ).toString("base64url");
  const unit2PartJson = verifyAdminRequest(
    new Request("http://localhost/api/admin/cards", {
      headers: {
        authorization: `Bearer ${jsonClaimPart}.sig123`,
      },
    })
  );
  assert(
    unit2PartJson.authorized === true && unit2PartJson.status === 200,
    "verifyAdminRequest returns 200 for 2-part token with embedded JSON claims"
  );
  assert(
    unit2PartJson.email === "dimasaldi428@gmail.com",
    "verifyAdminRequest extracts email from 2-part JSON payload"
  );

  // 9c. 2-part token with non-admin email rejected with 403
  const unit2PartNonAdmin = verifyAdminRequest(
    new Request("http://localhost/api/admin/cards", {
      headers: {
        authorization: "Bearer sess_regular.sig000",
        "x-admin-email": "regularuser@gmail.com",
      },
    })
  );
  assert(
    unit2PartNonAdmin.authorized === false && unit2PartNonAdmin.status === 403,
    "verifyAdminRequest returns 403 for 2-part session token with non-admin email"
  );

  // 9d. 3-part malformed JWT must still return 401
  const unit3PartMalformed = verifyAdminRequest(
    new Request("http://localhost/api/admin/cards", {
      headers: {
        authorization: "Bearer header.notjson.sig",
        "x-admin-email": "cardinusantara@gmail.com",
      },
    })
  );
  assert(
    unit3PartMalformed.authorized === false && unit3PartMalformed.status === 401,
    "verifyAdminRequest returns 401 for malformed 3-part JWT"
  );

  // 9e. Raw email as Bearer token must still return 401
  const unitRawEmail = verifyAdminRequest(
    new Request("http://localhost/api/admin/cards", {
      headers: {
        authorization: "Bearer cardinusantara@gmail.com",
      },
    })
  );
  assert(
    unitRawEmail.authorized === false && unitRawEmail.status === 401,
    "verifyAdminRequest returns 401 when raw email is passed as Bearer token"
  );

  // 10. Zero Em Dash Audit
  console.log("\n--- TEST 10: Zero Em Dash (\u2014) Audit ---");
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
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".ts") ||
          entry.name.endsWith(".tsx") ||
          entry.name.endsWith(".js") ||
          entry.name.endsWith(".mjs"))
      ) {
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

  assert(
    emDashCount === 0,
    `ZERO em dash characters found across src/ and scripts/ (violations: ${emDashCount})`
  );
  if (violations.length > 0) {
    console.error("Files violating zero em dash constraint:", violations);
  }

  // Clean up test data
  deleteCardProfile("deo-partner");

  console.log("\n==================================================");
  console.log(
    `VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED out of ${testCount} tests`
  );
  console.log("==================================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Verification suite failed:", err);
  process.exit(1);
});
