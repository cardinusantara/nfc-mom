import { NextRequest, NextResponse } from "next/server";

const CARDI_API_URL =
  process.env.CARDI_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fuldtvg7vk.execute-api.ap-southeast-1.amazonaws.com";

export async function POST() {
  try {
    const res = await fetch(`${CARDI_API_URL}/auth/pair/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: "Gagal memulai sesi pairing", detail: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error pada /api/auth/pair/start:", err);
    return NextResponse.json(
      { error: "Kesalahan server saat membuat sesi pairing" },
      { status: 500 }
    );
  }
}

