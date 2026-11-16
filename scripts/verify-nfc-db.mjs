// Standalone verification script for NFC Card Profile Persistent Database
// Tests DDL schema (all 17 columns), seed data, API activation, profile retrieval, 404, and em dash audit.

import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const REQUIRED_COLUMNS = [
  "username",
  "tagId",
  "fullName",
  "headline",
  "company",
  "phone",
  "email",
  "website",
  "location",
  "bio",
  "avatarUrl",
  "socials",
  "cardDesign",
  "isActivated",
  "metrics",
  "createdAt",
  "updatedAt",
];

const DB_PATH = path.join(process.cwd(), "data", "cardi_nfc.db");

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
  console.log("NFC CARD DATABASE AND API VERIFICATION SUITE");
  console.log("==================================================");

  // 1. Database schema and column verification
  console.log("\n--- TEST 1: Database Schema and 17 Required Columns ---");
  assert(fs.existsSync(DB_PATH), `Database file exists at ${DB_PATH}`);

  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA busy_timeout = 5000;");

  const tableInfo = db.prepare("PRAGMA table_info(card_profiles)").all();
  const existingCols = tableInfo.map((c) => c.name);

  console.log(`Discovered columns (${existingCols.length}): ${existingCols.join(", ")}`);

  assert(
    existingCols.length === REQUIRED_COLUMNS.length,
    `Column count matches exactly ${REQUIRED_COLUMNS.length} (found ${existingCols.length})`
  );

  for (const col of REQUIRED_COLUMNS) {
    assert(existingCols.includes(col), `Column '${col}' is present in card_profiles`);
  }

  // 2. Initial seed data verification for user 'deo'
  console.log("\n--- TEST 2: Initial Seed Data for User 'deo' ---");
  const deoRow = db.prepare("SELECT * FROM card_profiles WHERE username = ?").get("deo");
  assert(Boolean(deoRow), "User 'deo' exists in database");

  if (deoRow) {
    assert(deoRow.username === "deo", "deo username matches 'deo'");
    assert(deoRow.tagId === "CRD-DEO-001", `deo tagId matches 'CRD-DEO-001' (got '${deoRow.tagId}')`);
    assert(deoRow.fullName === "Founder & CEO", `deo fullName matches 'Founder & CEO' (got '${deoRow.fullName}')`);
    assert(deoRow.headline === "Founder & CEO", `deo headline matches 'Founder & CEO' (got '${deoRow.headline}')`);
    assert(deoRow.company === "cardi.co.id", `deo company matches 'cardi.co.id' (got '${deoRow.company}')`);
    assert(deoRow.phone === "+62 812-8989-5646", `deo phone matches '+62 812-8989-5646' (got '${deoRow.phone}')`);
    assert(deoRow.email === "cardinusantara@gmail.com", `deo email matches 'cardinusantara@gmail.com' (got '${deoRow.email}')`);
    assert(deoRow.cardDesign === "black-gold", `deo cardDesign matches 'black-gold' (got '${deoRow.cardDesign}')`);
    assert(Number(deoRow.isActivated) === 1, "deo isActivated equals 1");

    let socials = {};
    try {
      socials = JSON.parse(deoRow.socials);
    } catch {
      socials = {};
    }
    assert(Boolean(socials.whatsapp), "deo socials contains whatsapp link");
    assert(Boolean(socials.linkedin), "deo socials contains linkedin link");

    let metrics = {};
    try {
      metrics = JSON.parse(deoRow.metrics);
    } catch {
      metrics = {};
    }
    assert(typeof metrics.totalTaps === "number", "deo metrics contains totalTaps");
    assert(typeof metrics.contactsSaved === "number", "deo metrics contains contactsSaved");
    assert(typeof metrics.momInitiated === "number", "deo metrics contains momInitiated");
    assert(Boolean(deoRow.createdAt), "deo createdAt timestamp is set");
    assert(Boolean(deoRow.updatedAt), "deo updatedAt timestamp is set");
  }

  // 3. HTTP Server verification (real Next.js server)
  console.log("\n--- STARTING NEXT.JS SERVER FOR HTTP ROUTE TESTS ---");
  const testPort = 3847;
  const serverProcess = spawn(
    "node",
    ["./node_modules/next/dist/bin/next", "start", "-p", String(testPort)],
    { stdio: "pipe" }
  );

  let serverStarted = false;
  serverProcess.stdout.on("data", (data) => {
    const text = data.toString();
    if (text.includes("Ready") || text.includes("started") || text.includes(String(testPort))) {
      serverStarted = true;
    }
  });

  // Wait for server to become ready
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
      // Wait a moment
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  assert(serverStarted, `Next.js server started successfully on port ${testPort}`);

  try {
    // 3.1 Profile retrieval via GET /api/nfc/profile/deo
    console.log("\n--- TEST 3: GET /api/nfc/profile/deo over HTTP ---");
    const getDeoRes = await fetch(`http://localhost:${testPort}/api/nfc/profile/deo`);
    assert(getDeoRes.status === 200, `GET /api/nfc/profile/deo returned HTTP 200 (status ${getDeoRes.status})`);
    const getDeoJson = await getDeoRes.json();
    assert(Boolean(getDeoJson.profile), "Response contains profile object");
    assert(getDeoJson.profile.username === "deo", "Profile username is 'deo'");
    assert(getDeoJson.profile.tagId === "CRD-DEO-001", "Profile tagId is 'CRD-DEO-001'");
    assert(getDeoJson.profile.email === "cardinusantara@gmail.com", "Profile email is 'cardinusantara@gmail.com'");
    assert(getDeoJson.profile.isActivated === true, "Profile isActivated is true");

    // 3.2 Activation persistence via POST /api/nfc/activate
    console.log("\n--- TEST 4: POST /api/nfc/activate Persistence over HTTP ---");
    const testUsername = "pilot_test_" + Date.now();
    const testTagId = "CRD-TEST-" + Math.floor(Math.random() * 10000);
    const activatePayload = {
      tagId: testTagId,
      username: testUsername,
      email: `${testUsername}@cardi.co.id`,
      fullName: "Test Pilot Engineer",
      headline: "Chief Testing Officer",
      company: "Cardi Nusantara",
      phone: "+62 811-9876-5432",
      bundleTier: "bulk",
      cardDesign: "royal-blue",
      website: "https://cardi.co.id",
      location: "Bandung, Indonesia",
      bio: "Automated test profile persistence verification.",
    };

    const activateRes = await fetch(`http://localhost:${testPort}/api/nfc/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activatePayload),
    });

    assert(activateRes.status === 200, `POST /api/nfc/activate returned HTTP 200 (status ${activateRes.status})`);
    const activateJson = await activateRes.json();
    assert(activateJson.success === true, "Activation response success is true");
    assert(activateJson.username === testUsername, `Activation response username matches '${testUsername}'`);
    assert(activateJson.coinsCredited === 2500, "Activation bulk tier credited 2500 coins");
    assert(Boolean(activateJson.profile), "Activation response contains saved profile");

    // Verify row was written to SQLite database
    const directDbRow = db.prepare("SELECT * FROM card_profiles WHERE username = ?").get(testUsername);
    assert(Boolean(directDbRow), "Profile successfully persisted in SQLite card_profiles table");
    if (directDbRow) {
      assert(directDbRow.tagId === testTagId, `SQLite tagId matches '${testTagId}'`);
      assert(directDbRow.fullName === "Test Pilot Engineer", "SQLite fullName matches payload");
      assert(directDbRow.cardDesign === "royal-blue", "SQLite cardDesign matches 'royal-blue'");
    }

    // 3.3 Retrieve the newly activated user via GET /api/nfc/profile/[username]
    console.log("\n--- TEST 5: GET /api/nfc/profile/[new_user] over HTTP ---");
    const getNewUserRes = await fetch(`http://localhost:${testPort}/api/nfc/profile/${testUsername}`);
    assert(getNewUserRes.status === 200, `GET /api/nfc/profile/${testUsername} returned HTTP 200`);
    const getNewUserJson = await getNewUserRes.json();
    assert(getNewUserJson.profile.username === testUsername, "Retrieved username matches newly activated user");
    assert(getNewUserJson.profile.tagId === testTagId, "Retrieved tagId matches newly activated user");
    assert(getNewUserJson.profile.fullName === "Test Pilot Engineer", "Retrieved fullName matches");

    // 3.4 Verify 404 for non-existent user
    console.log("\n--- TEST 6: GET /api/nfc/profile/[non_existent] 404 Behavior ---");
    const nonExistentUser = "nonexistent_user_99999_xyz";
    const getNotFoundRes = await fetch(`http://localhost:${testPort}/api/nfc/profile/${nonExistentUser}`);
    assert(getNotFoundRes.status === 404, `GET non-existent user returned HTTP 404 (status ${getNotFoundRes.status})`);
    const getNotFoundJson = await getNotFoundRes.json();
    assert(Boolean(getNotFoundJson.error), "404 response contains error message");

    // Clean up test user
    db.prepare("DELETE FROM card_profiles WHERE username = ?").run(testUsername);
  } finally {
    serverProcess.kill();
  }

  // 4. Character Constraint: ZERO Em Dash (\u2014) Audit
  console.log("\n--- TEST 7: ZERO Em Dash (\\u2014) Constraint Audit ---");
  const scanDirs = ["src", "scripts"];
  let emDashCount = 0;
  const violatedFiles = [];

  function scanFolder(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        scanFolder(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") || entry.name.endsWith(".js") || entry.name.endsWith(".mjs") || entry.name.endsWith(".sql") || entry.name.endsWith(".json") || entry.name.endsWith(".md"))) {
        const content = fs.readFileSync(fullPath, "utf8");
        if (content.includes("\u2014")) {
          emDashCount++;
          violatedFiles.push(fullPath);
        }
      }
    }
  }

  for (const dir of scanDirs) {
    scanFolder(path.join(process.cwd(), dir));
  }

  assert(emDashCount === 0, `ZERO em dash characters found across src/ and scripts/ (violations: ${emDashCount})`);
  if (violatedFiles.length > 0) {
    console.error("Files containing em dash:", violatedFiles);
  }

  console.log("\n==================================================");
  console.log(`VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED out of ${testCount} tests`);
  console.log("==================================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Verification suite failed unexpectedly:", err);
  process.exit(1);
});
