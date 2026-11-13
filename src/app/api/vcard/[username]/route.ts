import { NextRequest, NextResponse } from "next/server";
import { cardiApi } from "@/lib/api";
import { getProfileByUsername } from "@/lib/profiles";
import { normalizeSocialUrl } from "@/lib/vcard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const { searchParams } = new URL(request.url);

  // Try fetching live profile from AWS DynamoDB backend first
  let fullName = searchParams.get("name");
  let headline = searchParams.get("title");
  let company = searchParams.get("company");
  let phone = searchParams.get("phone");
  let email = searchParams.get("email");
  let website = searchParams.get("website");
  let address = searchParams.get("address") || "Jakarta, Indonesia";
  let socials: Record<string, string | undefined> = {};

  const liveProfile = await cardiApi.fetchPublicProfile(username);
  if (liveProfile) {
    if (!fullName) fullName = liveProfile.fullName;
    if (!headline) headline = liveProfile.headline;
    if (!company) company = liveProfile.company;
    if (!phone) phone = liveProfile.phone;
    if (!email) email = liveProfile.email;
    if (!website) website = liveProfile.website;
    if (!searchParams.get("address")) address = liveProfile.location || address;
    if (liveProfile.socials) socials = liveProfile.socials;
  } else {
    const fallback = getProfileByUsername(username);
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

  const finalName = (fullName || username).trim();
  const nameParts = finalName.split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : finalName;

  const cleanPhone = phone ? phone.replace(/[^0-9+]/g, "") : "";
  const safeFilename = finalName.replace(/[^a-zA-Z0-9_\-]/g, "_") || username;

  const noteLines = [
    headline ? `Jabatan: ${headline}` : "",
    company ? `Perusahaan: ${company}` : "",
    cleanPhone ? `WhatsApp: https://wa.me/${cleanPhone.replace(/^\+/, "")}` : "",
    `Profil Digital: https://nfc.cardi.co.id/${username}`,
    "Tersimpan langsung via Cardi Smart NFC & AI MoM"
  ].filter(Boolean);

  const vCardLines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${finalName}`,
    `N:${lastName};${firstName};;;`,
    company ? `ORG:${company}` : "",
    headline ? `TITLE:${headline}` : "",
    cleanPhone ? `TEL;TYPE=CELL,VOICE,PREF:${cleanPhone}` : "",
    email ? `EMAIL;TYPE=WORK,INTERNET:${email}` : "",
    website ? `URL;TYPE=WORK:${website}` : "",
    `URL;TYPE=Cardi Profile:https://nfc.cardi.co.id/${username}`,
    address ? `ADR;TYPE=WORK:;;${address};;;;` : "",
    socials.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin:${normalizeSocialUrl("linkedin", socials.linkedin)}` : "",
    socials.instagram ? `X-SOCIALPROFILE;TYPE=instagram:${normalizeSocialUrl("instagram", socials.instagram)}` : "",
    socials.github ? `X-SOCIALPROFILE;TYPE=github:${normalizeSocialUrl("github", socials.github)}` : "",
    socials.twitter ? `X-SOCIALPROFILE;TYPE=twitter:${normalizeSocialUrl("twitter", socials.twitter)}` : "",
    socials.whatsapp ? `X-SOCIALPROFILE;TYPE=whatsapp:${normalizeSocialUrl("whatsapp", socials.whatsapp)}` : "",
    noteLines.length ? `NOTE:${noteLines.join("\\n")}` : "",
    `REV:${new Date().toISOString()}`,
    "END:VCARD",
  ].filter(Boolean);

  const vCardContent = vCardLines.join("\r\n") + "\r\n";

  return new NextResponse(vCardContent, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeFilename}.vcf"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}

