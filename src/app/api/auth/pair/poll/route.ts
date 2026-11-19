import { NextRequest, NextResponse } from "next/server";

const CARDI_API_URL =
  process.env.CARDI_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fuldtvg7vk.execute-api.ap-southeast-1.amazonaws.com";

export async function GET(req: NextRequest) {
  try {
    const pairingId = req.nextUrl.searchParams.get("pairingId");

    if (!pairingId) {
      return NextResponse.json(
        { error: "pairingId parameter wajib diisi" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${CARDI_API_URL}/auth/pair/poll?pairingId=${encodeURIComponent(pairingId)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: "Gagal polling status pairing", detail: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error pada /api/auth/pair/poll:", err);
    return NextResponse.json(
      { error: "Kesalahan server saat polling status pairing" },
      { status: 500 }
    );
  }
}
