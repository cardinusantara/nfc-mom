import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const { searchParams } = new URL(request.url);
  const fullName = searchParams.get("name") || "Deo Cardi Nathanael";
  const headline = searchParams.get("title") || "Founder & CEO";
  const company = searchParams.get("company") || "Cardi Nusantara";
  const phone = searchParams.get("phone") || "+6281283625471";
  const email = searchParams.get("email") || "deo@cardi.co.id";
  const website = searchParams.get("website") || "https://www.cardi.co.id";
  const address = searchParams.get("address") || "Jakarta Selatan, Indonesia";

  const profile = {
    fullName,
    headline,
    company,
    phone,
    email,
    website,
    address,
  };

  const vCardContent = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.fullName}`,
    `N:Nathanael;Deo Cardi;;;`,
    `ORG:${profile.company}`,
    `TITLE:${profile.headline}`,
    `TEL;TYPE=CELL,VOICE:${profile.phone}`,
    `EMAIL;TYPE=WORK,INTERNET:${profile.email}`,
    `URL:${profile.website}`,
    `ADR;TYPE=WORK:;;${profile.address};;;;`,
    `NOTE:Disimpan dari kartu bisnis Cardi NFC (Username: ${username})`,
    "END:VCARD",
  ].join("\r\n");

  return new NextResponse(vCardContent, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${username}-contact.vcf"`,
    },
  });
}
