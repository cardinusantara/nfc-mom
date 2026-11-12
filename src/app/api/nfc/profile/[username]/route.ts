import { NextRequest, NextResponse } from "next/server";
import { getProfileByUsername } from "@/lib/profiles";

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

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const remoteRes = await fetch(`${CARDI_API_URL}/nfc/profile/${cleanUser}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (remoteRes.ok) {
        const data = await remoteRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Remote unavailable, fallback to local registry
    }

    const localProfile = getProfileByUsername(cleanUser);
    return NextResponse.json({ profile: localProfile });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Gagal mengambil data profil" },
      { status: 500 }
    );
  }
}
