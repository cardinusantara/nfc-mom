import { NextResponse } from "next/server";
import {
  getCardProfileByTagId,
  getCardProfileByUsername,
  upsertCardProfile,
} from "@/lib/server/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      tagId,
      username,
      email,
      fullName,
      headline,
      company,
      phone,
      website,
      location,
      bio,
      bundleTier,
      cardDesign,
    } = body;

    // Validate tagId
    if (!tagId || typeof tagId !== "string" || !tagId.trim()) {
      return NextResponse.json(
        { success: false, error: "Tag ID kartu NFC wajib diisi." },
        { status: 400 }
      );
    }
    const cleanTag = tagId.trim().toUpperCase();

    // Validate username format (3 to 30 characters, a-z, 0-9, _, -)
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { success: false, error: "Username wajib diisi." },
        { status: 400 }
      );
    }
    const cleanUser = username.trim().toLowerCase();
    const usernameRegex = /^[a-z0-9_-]{3,30}$/;
    if (!usernameRegex.test(cleanUser)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Username harus terdiri dari 3-30 karakter alfanumerik (huruf kecil, angka, garis bawah, atau strip).",
        },
        { status: 400 }
      );
    }

    // Check if tagId is already bound to another card profile in database
    const existingTagProfile = getCardProfileByTagId(cleanTag);
    if (existingTagProfile) {
      return NextResponse.json(
        {
          success: false,
          error: `Tag ID ${cleanTag} sudah terdaftar dan terikat pada profil @${existingTagProfile.username}.`,
        },
        { status: 409 }
      );
    }

    // Check if username is already taken by another profile in database
    const existingUserProfile = getCardProfileByUsername(cleanUser);
    if (existingUserProfile) {
      return NextResponse.json(
        {
          success: false,
          error: `Username @${cleanUser} sudah digunakan. Silakan pilih username lain.`,
        },
        { status: 409 }
      );
    }

    // Determine coin bonus based on bundleTier
    let coinsCredited = 50;
    if (bundleTier === "bulk") {
      coinsCredited = 2500;
    } else if (bundleTier === "quick") {
      coinsCredited = 500;
    } else if (bundleTier === "card_only" || bundleTier === "none") {
      coinsCredited = 50;
    }
    const totalCoinsBalance = coinsCredited;

    const userEmail =
      email && typeof email === "string" && email.trim()
        ? email.trim()
        : `${cleanUser}@cardi.co.id`;

    const userFullName =
      fullName && typeof fullName === "string" && fullName.trim()
        ? fullName.trim()
        : "Pengguna Cardi";

    // Persist card profile to SQLite
    const profile = upsertCardProfile({
      username: cleanUser,
      tagId: cleanTag,
      fullName: userFullName,
      headline:
        headline && typeof headline === "string" && headline.trim()
          ? headline.trim()
          : "Professional & Business Leader",
      company:
        company && typeof company === "string" && company.trim()
          ? company.trim()
          : "Cardi",
      phone: phone && typeof phone === "string" ? phone.trim() : "",
      email: userEmail,
      website:
        website && typeof website === "string" && website.trim()
          ? website.trim()
          : "https://www.cardi.co.id",
      location:
        location && typeof location === "string" && location.trim()
          ? location.trim()
          : "Indonesia",
      bio:
        bio && typeof bio === "string" && bio.trim()
          ? bio.trim()
          : "Pengguna kartu bisnis pintar Cardi Smart NFC Card dan AI MoM.",
      cardDesign: cardDesign || "black-gold",
      isActivated: true,
      socials: {
        ...(phone ? { whatsapp: `https://wa.me/${phone.replace(/[^0-9]/g, "")}` } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      username: cleanUser,
      tagId: cleanTag,
      email: profile.email,
      coinsCredited,
      totalCoinsBalance,
      profile,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Terjadi kesalahan internal saat aktivasi kartu.",
      },
      { status: 500 }
    );
  }
}
