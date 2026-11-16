import { NextRequest, NextResponse } from "next/server";
import { getCardProfileByUsername } from "@/lib/server/db";
import { cardiApi } from "@/lib/api";
import { getProfileByUsername } from "@/lib/profiles";
import { normalizeSocialUrl } from "@/lib/vcard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const { searchParams } = new URL(request.url);
  const cleanUser = String(username || "").toLowerCase().trim();

  let fullName = searchParams.get("name");
  let headline = searchParams.get("title");
  let company = searchParams.get("company");
  let phone = searchParams.get("phone");
  let email = searchParams.get("email");
  let website = searchParams.get("website");
  let address = searchParams.get("address") || "Jakarta, Indonesia";
  let socials: Record<string, string | undefined> = {};

  // 1. Check local persistent SQLite database first
  const localProfile = getCardProfileByUsername(cleanUser);
  if (localProfile) {
    if (!fullName) fullName = localProfile.fullName;
    if (!headline) headline = localProfile.headline;
    if (!company) company = localProfile.company;
    if (!phone) phone = localProfile.phone;
    if (!email) email = localProfile.email;
    if (!website) website = localProfile.website;
    if (!searchParams.get("address")) address = localProfile.location || address;
    if (localProfile.socials) socials = localProfile.socials;
  } else {
    // 2. Fallback to remote API
    try {
      const liveProfile = await cardiApi.fetchPublicProfile(cleanUser);
      if (liveProfile) {
        if (!fullName) fullName = liveProfile.fullName;
        if (!headline) headline = liveProfile.headline;
        if (!company) company = liveProfile.company;
        if (!phone) phone = liveProfile.phone;
        if (!email) email = liveProfile.email;
        if (!website) website = liveProfile.website;
        if (!searchParams.get("address")) address = liveProfile.location || address;
        if (liveProfile.socials) socials = liveProfile.socials;
      }
    } catch {
      // ignore
    }

    if (!fullName) {
      const fallback = getProfileByUsername(cleanUser);
      if (fallback) {
        if (!fullName) fullName = fallback.fullName;
        if (!headline) headline = fallback.headline;
        if (!company) company = fallback.company;
        if (!phone) phone = fallback.phone;
        if (!email) email = fallback.email;
        if (!website) website = fallback.website;
        if (!searchParams.get("address")) address = fallback.location || address;
        if (fallback.socials) socials = fallback.socials;
      }
    }
  }

  const finalName = (fullName || cleanUser).trim();
  const nameParts = finalName.split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : finalName;

  const cleanPhone = phone ? phone.replace(/[^0-9+]/g, "") : "";
  const safeFilename = finalName.replace(/[^a-zA-Z0-9_\-]/g, "_") || cleanUser;

  const noteLines = [
    headline ? `Jabatan: ${headline}` : "",
    company ? `Perusahaan: ${company}` : "",
    cleanPhone ? `WhatsApp: https://wa.me/${cleanPhone.replace(/^\+/, "")}` : "",
    `Profil Digital: https://nfc.cardi.co.id/${cleanUser}`,
    "Tersimpan langsung via Cardi Smart NFC & AI MoM"
  ].filter(Boolean);

  const vCardLines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${finalName}`,
    `N:${lastName};${firstName};;;`,
  ];

  if (company) vCardLines.push(`ORG:${company}`);
  if (headline) vCardLines.push(`TITLE:${headline}`);
  if (cleanPhone) vCardLines.push(`TEL;TYPE=CELL,VOICE,PREF:${cleanPhone}`);
  if (email) vCardLines.push(`EMAIL;TYPE=WORK,INTERNET:${email}`);
  if (website) vCardLines.push(`URL;TYPE=WORK:${website}`);
  vCardLines.push(`URL;TYPE=Cardi Profile:https://nfc.cardi.co.id/${cleanUser}`);
  if (address) vCardLines.push(`ADR;TYPE=WORK:;;${address};;;;`);

  // Social profiles (X-SOCIALPROFILE standard)
  const knownKeys = [
    "whatsapp",
    "linkedin",
    "instagram",
    "github",
    "twitter",
    "tiktok",
    "youtube",
    "telegram",
    "threads",
    "facebook",
  ];

  for (const key of knownKeys) {
    const val = socials[key];
    if (val) {
      vCardLines.push(`X-SOCIALPROFILE;TYPE=${key}:${normalizeSocialUrl(key, val)}`);
    }
  }

  for (const [key, val] of Object.entries(socials)) {
    if (!knownKeys.includes(key) && val) {
      vCardLines.push(`X-SOCIALPROFILE;TYPE=${key}:${normalizeSocialUrl(key, val)}`);
    }
  }

  if (noteLines.length > 0) {
    vCardLines.push(`NOTE:${noteLines.join("\\n")}`);
  }

  vCardLines.push(`REV:${new Date().toISOString()}`);
  vCardLines.push("END:VCARD");

  const vCardContent = vCardLines.join("\r\n") + "\r\n";
  const isDownload = searchParams.get("download") === "1";
  const disposition = isDownload ? "attachment" : "inline";

  return new NextResponse(vCardContent, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `${disposition}; filename="${safeFilename}.vcf"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}

