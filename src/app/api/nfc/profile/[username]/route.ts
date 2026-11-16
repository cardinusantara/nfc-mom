import { NextRequest, NextResponse } from "next/server";
import { getCardProfileByUsername, upsertCardProfile } from "@/lib/server/db";

const CARDI_API_URL =
  process.env.CARDI_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fuldtvg7vk.execute-api.ap-southeast-1.amazonaws.com";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const cleanUser = String(username || "").toLowerCase().trim();

    // 1. Check local persistent SQLite database first
    const localProfile = getCardProfileByUsername(cleanUser);
    if (localProfile) {
      return NextResponse.json({
        success: true,
        profile: localProfile,
      });
    }

    // 2. Fallback to remote backend if accessible
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      const remoteRes = await fetch(`${CARDI_API_URL}/nfc/profile/${cleanUser}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (remoteRes.ok) {
        const data = await remoteRes.json();
        if (data?.profile) {
          // Cache to local database
          const cached = upsertCardProfile(data.profile);
          return NextResponse.json({
            success: true,
            profile: cached,
          });
        }
      }
    } catch {
      // Remote unavailable or error
    }

    // 3. User does not exist, return 404
    return NextResponse.json(
      {
        error: "Profile not found",
        username: cleanUser,
        notFound: true,
      },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Gagal mengambil data profil" },
      { status: 500 }
    );
  }
}
