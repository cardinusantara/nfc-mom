import { getCardProfileByUsername, getCardProfileByTagId, upsertCardProfile } from "./src/lib/server/db.ts";
import { DatabaseSync } from "node:sqlite";

let passed = 0;
let total = 0;
function check(condition, desc) {
  total++;
  if (condition) {
    passed++;
    console.log("[PASS]: " + desc);
  } else {
    console.error("[FAIL]: " + desc);
    process.exitCode = 1;
  }
}

// 1. Case-insensitivity check
const deoUpper = getCardProfileByUsername("DEO");
check(deoUpper !== null && deoUpper.username === "deo", "Username lookup is case-insensitive (DEO -> deo)");
const deoMixed = getCardProfileByUsername("dEo");
check(deoMixed !== null && deoMixed.username === "deo", "Username lookup is case-insensitive (dEo -> deo)");

// 2. Tag ID lookup
const deoTag = getCardProfileByTagId("crd-deo-001");
check(deoTag !== null && deoTag.username === "deo", "TagId lookup is case-insensitive (crd-deo-001 -> deo)");

// 3. Upsert new profile
const testUser = "auditor_test_" + Date.now();
const testTag = "TAG-AUDIT-" + Math.floor(Math.random() * 10000);
const created = upsertCardProfile({
  username: testUser,
  tagId: testTag,
  fullName: "Auditor Test User",
  company: "Audit Corp",
  email: "audit@example.com",
  cardDesign: "royal-blue",
  isActivated: true,
});
check(created.username === testUser, "Created new profile with correct username");
check(created.tagId === testTag, "Created new profile with correct tagId");
check(created.createdAt !== undefined, "Created profile has createdAt timestamp");

// 4. Retrieve newly created profile
const retrieved = getCardProfileByUsername(testUser);
check(retrieved !== null && retrieved.fullName === "Auditor Test User", "Retrieved newly created profile");

// 5. Update existing profile
const updated = upsertCardProfile({
  username: testUser,
  headline: "Senior Lead Auditor",
  bio: "Verified persistence and real-time updates.",
});
check(updated.headline === "Senior Lead Auditor", "Updated profile headline successfully");
check(updated.fullName === "Auditor Test User", "Preserved unmodified fields during update");

// 6. SQL injection resistance
const sqlInjResult = getCardProfileByUsername("' OR 1=1 --");
check(sqlInjResult === null, "SQL injection string in username safely returns null");

// 7. TagId uniqueness
const db = new DatabaseSync("data/cardi_nfc.db");
let duplicateThrew = false;
try {
  db.prepare("INSERT INTO card_profiles (username, tagId) VALUES (?, ?)").run("another_user_xyz", testTag);
} catch (err) {
  duplicateThrew = true;
}
check(duplicateThrew, "Duplicate tagId violates UNIQUE constraint as expected");

// Clean up test records
db.prepare("DELETE FROM card_profiles WHERE username = ?").run(testUser);
check(getCardProfileByUsername(testUser) === null, "Test profile successfully cleaned up");

console.log("SUMMARY: " + passed + "/" + total + " checks passed.");
