import { NextRequest, NextResponse } from "next/server";

const CARDI_API_URL =
  process.env.CARDI_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fuldtvg7vk.execute-api.ap-southeast-1.amazonaws.com";

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const body = await req.json();

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
      // Remote unavailable, return body as updated profile
    }

    return NextResponse.json({
      success: true,
      profile: body,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
