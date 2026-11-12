import { NextRequest, NextResponse } from "next/server";

const CARDI_API_URL =
  process.env.CARDI_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fuldtvg7vk.execute-api.ap-southeast-1.amazonaws.com";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header wajib disertakan" },
        { status: 401 }
      );
    }

    const since = req.nextUrl.searchParams.get("since");
    const query = since ? `?since=${encodeURIComponent(since)}` : "";

    const res = await fetch(`${CARDI_API_URL}/meetings${query}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error pada /api/meetings:", err);
    return NextResponse.json(
      { error: "Kesalahan server saat menyinkronkan data rapat" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header wajib disertakan" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const res = await fetch(`${CARDI_API_URL}/meetings`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error pada POST /api/meetings:", err);
    return NextResponse.json(
      { error: "Kesalahan server saat membuat data rapat" },
      { status: 500 }
    );
  }
}
