import { NextRequest, NextResponse } from "next/server";

const CARDI_API_URL =
  process.env.CARDI_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fuldtvg7vk.execute-api.ap-southeast-1.amazonaws.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${CARDI_API_URL}/auth/email/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error pada /api/auth/email/send-code:", err);
    return NextResponse.json(
      { error: "Kesalahan server saat mengirim kode email" },
      { status: 500 }
    );
  }
}

