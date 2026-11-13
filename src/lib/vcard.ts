import type { CardProfile } from "./types";

/**
 * Normalizes user-input social media handles or URLs into full HTTPS URLs.
 * Handles bare handles (e.g. "@johndoe", "johndoe"), domain-prefixed inputs,
 * and phone numbers for WhatsApp.
 */
export function normalizeSocialUrl(platform: string, input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (!trimmed) return "";

  const cleanHandle = trimmed.replace(/^@+/, "");
  const lower = platform.toLowerCase();

  if (lower === "whatsapp") {
    // If it is already a full wa.me or whatsapp link
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed.replace(/^http:\/\//i, "https://");
    }
    if (/^wa\.me\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    // Clean phone number digits
    let digits = trimmed.replace(/[^0-9+]/g, "");
    if (digits.startsWith("+")) {
      digits = digits.slice(1);
    } else if (digits.startsWith("08")) {
      digits = "62" + digits.slice(1);
    }
    return `https://wa.me/${digits}`;
  }

  if (lower === "linkedin") {
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed.replace(/^http:\/\//i, "https://");
    }
    if (/^(www\.)?linkedin\.com\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    if (cleanHandle.startsWith("in/")) {
      return `https://linkedin.com/${cleanHandle}`;
    }
    return `https://linkedin.com/in/${cleanHandle}`;
  }

  if (lower === "instagram") {
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed.replace(/^http:\/\//i, "https://");
    }
    if (/^(www\.)?instagram\.com\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return `https://instagram.com/${cleanHandle}`;
  }

  if (lower === "github") {
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed.replace(/^http:\/\//i, "https://");
    }
    if (/^(www\.)?github\.com\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return `https://github.com/${cleanHandle}`;
  }

  if (lower === "twitter" || lower === "x") {
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed.replace(/^http:\/\//i, "https://");
    }
    if (/^(www\.)?(twitter\.com|x\.com)\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return `https://x.com/${cleanHandle}`;
  }

  // Generic fallback
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Returns a sanitized filename for the vCard download (e.g. "Deo_Cardi.vcf").
 */
export function getVCardFileName(
  profile: Partial<CardProfile> | { fullName?: string; username?: string }
): string {
  const base = profile.fullName || profile.username || "Cardi_Contact";
  const sanitized = base.trim().replace(/[^a-zA-Z0-9_\-]/g, "_");
  return `${sanitized || "contact"}.vcf`;
}

/**
 * Generates an RFC 3.0 compliant vCard string.
 * Strictly uses CRLF (\r\n) line terminators, supports X-SOCIALPROFILE,
 * and cleanly encodes multi-line notes.
 */
export function generateVCard(profile: CardProfile): string {
  const fullName = (profile.fullName || profile.username || "Cardi User").trim();
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || fullName;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  const cleanPhone = profile.phone ? profile.phone.replace(/[^0-9+]/g, "") : "";
  const headline = (profile.headline || "").trim();
  const company = (profile.company || "").trim();
  const email = (profile.email || "").trim();
  const website = (profile.website || "").trim();
  const location = (profile.location || "").trim();
  const username = (profile.username || "").trim();

  // Multi-line note assembly
  const noteLines: string[] = [];
  if (headline) noteLines.push(`Jabatan: ${headline}`);
  if (company) noteLines.push(`Perusahaan: ${company}`);
  if (cleanPhone) {
    const waDigits = cleanPhone.replace(/^\+/, "");
    noteLines.push(`WhatsApp: https://wa.me/${waDigits}`);
  }
  if (username) {
    noteLines.push(`Profil Digital: https://nfc.cardi.co.id/${username}`);
  }
  noteLines.push("Tersimpan langsung via Cardi Smart NFC & AI MoM");

  const vCardLines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${fullName}`,
    `N:${lastName};${firstName};;;`,
  ];

  if (company) vCardLines.push(`ORG:${company}`);
  if (headline) vCardLines.push(`TITLE:${headline}`);
  if (cleanPhone) vCardLines.push(`TEL;TYPE=CELL,VOICE,PREF:${cleanPhone}`);
  if (email) vCardLines.push(`EMAIL;TYPE=WORK,INTERNET:${email}`);
  if (website) vCardLines.push(`URL;TYPE=WORK:${website}`);
  if (username) {
    vCardLines.push(`URL;TYPE=Cardi Profile:https://nfc.cardi.co.id/${username}`);
  }
  if (location) vCardLines.push(`ADR;TYPE=WORK:;;${location};;;;`);

  // Social profile extensions (X-SOCIALPROFILE standard)
  if (profile.socials?.linkedin) {
    const linkedinUrl = normalizeSocialUrl("linkedin", profile.socials.linkedin);
    vCardLines.push(`X-SOCIALPROFILE;TYPE=linkedin:${linkedinUrl}`);
  }
  if (profile.socials?.instagram) {
    const instagramUrl = normalizeSocialUrl("instagram", profile.socials.instagram);
    vCardLines.push(`X-SOCIALPROFILE;TYPE=instagram:${instagramUrl}`);
  }
  if (profile.socials?.github) {
    const githubUrl = normalizeSocialUrl("github", profile.socials.github);
    vCardLines.push(`X-SOCIALPROFILE;TYPE=github:${githubUrl}`);
  }
  if (profile.socials?.twitter) {
    const twitterUrl = normalizeSocialUrl("twitter", profile.socials.twitter);
    vCardLines.push(`X-SOCIALPROFILE;TYPE=twitter:${twitterUrl}`);
  }
  if (profile.socials?.whatsapp) {
    const waUrl = normalizeSocialUrl("whatsapp", profile.socials.whatsapp);
    vCardLines.push(`X-SOCIALPROFILE;TYPE=whatsapp:${waUrl}`);
  }

  // Include avatar URI if present and not an oversized data URL
  if (profile.avatarUrl && /^https?:\/\//i.test(profile.avatarUrl)) {
    vCardLines.push(`PHOTO;VALUE=URI:${profile.avatarUrl}`);
  }

  if (noteLines.length > 0) {
    // Escape literal semicolons and commas in note if needed; vCard 3.0 uses \n for newline
    const escapedNote = noteLines.join("\\n");
    vCardLines.push(`NOTE:${escapedNote}`);
  }

  vCardLines.push(`REV:${new Date().toISOString()}`);
  vCardLines.push("END:VCARD");

  // Strictly RFC compliant CRLF endings
  return vCardLines.join("\r\n") + "\r\n";
}
