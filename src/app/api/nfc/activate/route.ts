import { NextRequest, NextResponse } from "next/server";
import { CardProfile } from "@/lib/types";

const CARDI_API_URL =
  process.env.CARDI_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fuldtvg7vk.execute-api.ap-southeast-1.amazonaws.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tagId = "CRD-89421",
      username = "user",
      email = "user@cardi.co.id",
      fullName = "Pengguna Cardi",
      headline = "Professional & Business Leader",
      company = "Cardi",
      phone = "",
      bundleTier = "quick",
      cardDesign = "black-gold",
      website = "https://www.cardi.co.id",
      location = "Indonesia",
      bio = "Pengguna kartu bisnis pintar Cardi Smart NFC Card dan AI MoM.",
    } = body;

    const cleanUsername = String(username).toLowerCase().replace(/[^a-z0-9_-]/g, "") || "user";

    let coinsCredited = 0;
    if (bundleTier === "bulk") coinsCredited = 2500;
    else if (bundleTier === "quick") coinsCredited = 500;

    const profile: CardProfile = {
      username: cleanUsername,
      fullName: String(fullName).trim(),
      headline: String(headline).trim(),
      company: String(company).trim(),
      phone: String(phone).trim(),
      email: String(email).trim().toLowerCase(),
      website: String(website).trim(),
      location: String(location).trim(),
      bio: String(bio).trim(),
      avatarUrl: "",
      cardDesign: cardDesign as "black-gold" | "royal-blue" | "silver-minimal",
      socials: {
        ...(phone ? { whatsapp: `https://wa.me/${phone.replace(/[^0-9]/g, "")}` } : {}),
      },
      metrics: {
        totalTaps: 1,
        contactsSaved: 0,
        momInitiated: 0,
      },
    };

    // Forward to remote API if accessible, with 4 second timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const remoteRes = await fetch(`${CARDI_API_URL}/nfc/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        return NextResponse.json(remoteData);
      }
    } catch {
      // Remote backend offline or unconfigured, fallback to local activation response
    }

    return NextResponse.json({
      success: true,
      username: cleanUsername,
      tagId: String(tagId).trim().toUpperCase(),
      email: String(email).trim().toLowerCase(),
      coinsCredited,
      totalCoinsBalance: coinsCredited,
      profile,
    });
  } catch (err: any) {
    console.error("Error pada /api/nfc/activate:", err);
    return NextResponse.json(
      { error: err?.message || "Gagal mengaktifkan kartu" },
      { status: 500 }
    );
  }
}
