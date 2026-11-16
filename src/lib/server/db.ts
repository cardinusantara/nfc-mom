import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import type { CardProfile } from "@/lib/types";

const DB_FILE_PATH =
  process.env.DATABASE_PATH ||
  path.join(process.cwd(), "data", "cardi_nfc.db");

interface DbRow {
  username: string;
  tagId: string | null;
  fullName: string;
  headline: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  location: string;
  bio: string;
  avatarUrl: string;
  socials: string;
  cardDesign: string;
  isActivated: number;
  metrics: string;
  createdAt: string;
  updatedAt: string;
}

const globalForDb = globalThis as unknown as {
  __cardi_db?: DatabaseSync;
};

function initSchemaAndSeed(db: DatabaseSync): void {
  // Ensure tables and indexes exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS card_profiles (
      username TEXT PRIMARY KEY COLLATE NOCASE,
      tagId TEXT UNIQUE,
      fullName TEXT NOT NULL DEFAULT '',
      headline TEXT NOT NULL DEFAULT '',
      company TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      website TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      avatarUrl TEXT NOT NULL DEFAULT '',
      socials TEXT NOT NULL DEFAULT '{}',
      cardDesign TEXT NOT NULL DEFAULT 'black-gold',
      isActivated INTEGER NOT NULL DEFAULT 1,
      metrics TEXT NOT NULL DEFAULT '{"totalTaps":0,"contactsSaved":0,"momInitiated":0}',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_card_profiles_tagId ON card_profiles(tagId);
    CREATE INDEX IF NOT EXISTS idx_card_profiles_email ON card_profiles(email);
  `);

  // Check if seed user 'deo' exists
  const checkStmt = db.prepare("SELECT COUNT(*) as count FROM card_profiles WHERE username = ?");
  const result = checkStmt.get("deo") as { count: number } | undefined;

  if (!result || Number(result.count) === 0) {
    const insertSeed = db.prepare(`
      INSERT INTO card_profiles (
        username,
        tagId,
        fullName,
        headline,
        company,
        phone,
        email,
        website,
        location,
        bio,
        avatarUrl,
        socials,
        cardDesign,
        isActivated,
        metrics,
        createdAt,
        updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const nowIso = new Date().toISOString();
    insertSeed.run(
      "deo",
      "CRD-DEO-001",
      "Founder & CEO",
      "Founder & CEO",
      "cardi.co.id",
      "+62 812-8989-5646",
      "cardinusantara@gmail.com",
      "https://www.cardi.co.id",
      "Jakarta, Indonesia",
      "Membangun solusi AI Meeting Intelligence dan Smart NFC Networking untuk efisiensi bisnis.",
      "",
      JSON.stringify({
        whatsapp: "https://wa.me/6281289895646",
        linkedin: "https://linkedin.com/in/deocardi",
      }),
      "black-gold",
      1,
      JSON.stringify({
        totalTaps: 0,
        contactsSaved: 0,
        momInitiated: 0,
      }),
      nowIso,
      nowIso
    );
  }
}

export function getDb(): DatabaseSync {
  if (!globalForDb.__cardi_db) {
    const dbDir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const db = new DatabaseSync(DB_FILE_PATH);
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA busy_timeout = 5000;");
    db.exec("PRAGMA synchronous = NORMAL;");

    initSchemaAndSeed(db);
    globalForDb.__cardi_db = db;
  }

  return globalForDb.__cardi_db;
}

export function rowToProfile(row: DbRow): CardProfile {
  let socials: CardProfile["socials"] = {};
  let metrics: CardProfile["metrics"] = {
    totalTaps: 0,
    contactsSaved: 0,
    momInitiated: 0,
  };

  try {
    if (row.socials) {
      socials = typeof row.socials === "string" ? JSON.parse(row.socials) : row.socials;
    }
  } catch {
    socials = {};
  }

  try {
    if (row.metrics) {
      metrics = typeof row.metrics === "string" ? JSON.parse(row.metrics) : row.metrics;
    }
  } catch {
    metrics = { totalTaps: 0, contactsSaved: 0, momInitiated: 0 };
  }

  return {
    username: row.username,
    tagId: row.tagId || undefined,
    fullName: row.fullName || "",
    headline: row.headline || "",
    company: row.company || "",
    phone: row.phone || "",
    email: row.email || "",
    website: row.website || "",
    location: row.location || "",
    bio: row.bio || "",
    avatarUrl: row.avatarUrl || "",
    socials,
    cardDesign: (row.cardDesign || "black-gold") as CardProfile["cardDesign"],
    isActivated: Boolean(row.isActivated),
    metrics,
    createdAt: row.createdAt || undefined,
    updatedAt: row.updatedAt || undefined,
  };
}

export function getCardProfileByUsername(username: string): CardProfile | null {
  const db = getDb();
  const cleanUser = String(username || "").toLowerCase().trim();
  const stmt = db.prepare("SELECT * FROM card_profiles WHERE username = ?");
  const row = stmt.get(cleanUser) as DbRow | undefined;
  if (!row) return null;
  return rowToProfile(row);
}

export function getCardProfileByTagId(tagId: string): CardProfile | null {
  const db = getDb();
  const cleanTag = String(tagId || "").toUpperCase().trim();
  const stmt = db.prepare("SELECT * FROM card_profiles WHERE tagId = ?");
  const row = stmt.get(cleanTag) as DbRow | undefined;
  if (!row) return null;
  return rowToProfile(row);
}

export function upsertCardProfile(
  profile: Partial<CardProfile> & { username: string }
): CardProfile {
  const db = getDb();
  const cleanUser = String(profile.username).toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const existing = getCardProfileByUsername(cleanUser);
  const nowIso = new Date().toISOString();

  if (existing) {
    const updated: CardProfile = {
      ...existing,
      ...profile,
      username: cleanUser,
      tagId: profile.tagId !== undefined ? profile.tagId : existing.tagId,
      socials: profile.socials ? { ...existing.socials, ...profile.socials } : existing.socials,
      metrics: profile.metrics ? { ...existing.metrics, ...profile.metrics } : existing.metrics,
      createdAt: existing.createdAt || nowIso,
      updatedAt: nowIso,
    };

    const updateStmt = db.prepare(`
      UPDATE card_profiles SET
        tagId = ?,
        fullName = ?,
        headline = ?,
        company = ?,
        phone = ?,
        email = ?,
        website = ?,
        location = ?,
        bio = ?,
        avatarUrl = ?,
        socials = ?,
        cardDesign = ?,
        isActivated = ?,
        metrics = ?,
        updatedAt = ?
      WHERE username = ?
    `);

    updateStmt.run(
      updated.tagId || null,
      updated.fullName || "",
      updated.headline || "",
      updated.company || "",
      updated.phone || "",
      updated.email || "",
      updated.website || "",
      updated.location || "",
      updated.bio || "",
      updated.avatarUrl || "",
      JSON.stringify(updated.socials || {}),
      updated.cardDesign || "black-gold",
      updated.isActivated !== false ? 1 : 0,
      JSON.stringify(updated.metrics || { totalTaps: 0, contactsSaved: 0, momInitiated: 0 }),
      nowIso,
      cleanUser
    );

    return updated;
  }

  // Insert new
  const insertStmt = db.prepare(`
    INSERT INTO card_profiles (
      username,
      tagId,
      fullName,
      headline,
      company,
      phone,
      email,
      website,
      location,
      bio,
      avatarUrl,
      socials,
      cardDesign,
      isActivated,
      metrics,
      createdAt,
      updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const created: CardProfile = {
    username: cleanUser,
    tagId: profile.tagId || undefined,
    fullName: profile.fullName || "",
    headline: profile.headline || "",
    company: profile.company || "",
    phone: profile.phone || "",
    email: profile.email || "",
    website: profile.website || "",
    location: profile.location || "",
    bio: profile.bio || "",
    avatarUrl: profile.avatarUrl || "",
    socials: profile.socials || {},
    cardDesign: (profile.cardDesign || "black-gold") as CardProfile["cardDesign"],
    isActivated: profile.isActivated !== false,
    metrics: profile.metrics || { totalTaps: 1, contactsSaved: 0, momInitiated: 0 },
    createdAt: profile.createdAt || nowIso,
    updatedAt: profile.updatedAt || nowIso,
  };

  insertStmt.run(
    created.username,
    created.tagId || null,
    created.fullName,
    created.headline,
    created.company,
    created.phone,
    created.email,
    created.website,
    created.location,
    created.bio,
    created.avatarUrl || "",
    JSON.stringify(created.socials),
    created.cardDesign,
    created.isActivated ? 1 : 0,
    JSON.stringify(created.metrics),
    created.createdAt,
    created.updatedAt
  );

  return created;
}

export function updateCardProfile(
  username: string,
  updates: Partial<CardProfile>
): CardProfile | null {
  const cleanUser = String(username || "").toLowerCase().trim();
  const existing = getCardProfileByUsername(cleanUser);
  if (!existing) return null;
  return upsertCardProfile({ ...updates, username: cleanUser });
}

export function listAllProfiles(): CardProfile[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM card_profiles ORDER BY createdAt DESC").all() as DbRow[];
  return rows.map(rowToProfile);
}

// Aliases for compatibility
export const getProfileByUsername = getCardProfileByUsername;
export const getProfileByTagId = getCardProfileByTagId;
