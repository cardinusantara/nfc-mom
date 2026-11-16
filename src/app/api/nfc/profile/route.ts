import { NextRequest, NextResponse } from "next/server";
import { upsertCardProfile, getCardProfileByUsername } from "@/lib/server/db";

const CARDI_API_URL =
  process.env.CARDI_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fuldtvg7vk.execute-api.ap-southeast-1.amazonaws.com";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter is required" },
        { status: 400 }
      );
    }

    const localProfile = getCardProfileByUsername(username);
    if (localProfile) {
      return NextResponse.json({
        success: true,
        profile: localProfile,
      });
    }

    // Try remote backend if not found locally
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${CARDI_API_URL}/nfc/profile?username=${encodeURIComponent(username)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // Remote unavailable
    }

    return NextResponse.json(
      { error: "Profil tidak ditemukan" },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Gagal memuat profil" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const body = await req.json();

    if (!body || !body.username) {
      return NextResponse.json(
        { error: "Username is required to update profile" },
        { status: 400 }
      );
    }

    // Persist updates to local SQLite database
    const savedProfile = upsertCardProfile(body);

    // Forward to remote API if accessible
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authHeader) headers["Authorization"] = authHeader;

      const remoteRes = await fetch(`${CARDI_API_URL}/nfc/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (remoteRes.ok) {
        const data = await remoteRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Remote unavailable, return local saved profile
    }

    return NextResponse.json({
      success: true,
      profile: savedProfile,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
