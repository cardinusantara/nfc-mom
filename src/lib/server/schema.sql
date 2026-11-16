-- SQLite Schema for Cardi NFC Card Profiles
-- Persistent table storing 17 core profile fields

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
