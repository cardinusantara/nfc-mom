import { NextRequest, NextResponse } from "next/server";

const CARDI_API_URL =
  process.env.CARDI_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fuldtvg7vk.execute-api.ap-southeast-1.amazonaws.com";

interface GoogleTokenPayload {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  exp?: number;
}

function decodeJwtPayload(token: string): GoogleTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonPayload) as GoogleTokenPayload;
  } catch (err) {
    console.error("Gagal mendekode Google JWT:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, deviceId } = body;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "idToken wajib diisi" },
        { status: 400 }
      );
    }

    const decoded = decodeJwtPayload(idToken);
    if (!decoded || !decoded.email) {
      return NextResponse.json(
        { error: "Token Google tidak valid" },
        { status: 400 }
      );
    }

    const effectiveDeviceId =
      typeof deviceId === "string" && deviceId.trim().length > 0
        ? deviceId.trim()
        : "web_nfc_portal";

    const backendRes = await fetch(`${CARDI_API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken,
        deviceId: effectiveDeviceId,
      }),
    });

    if (!backendRes.ok) {
      let errorMessage = `Autentikasi Google gagal (${backendRes.status})`;
      try {
        const errJson = await backendRes.json();
        errorMessage = errJson.message || errJson.error || errorMessage;
      } catch {
        // use default message
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: backendRes.status }
      );
    }

    const backendData = await backendRes.json();

    const account = {
      ...backendData.account,
      name:
        decoded.name ||
        backendData.account?.name ||
        decoded.email.split("@")[0],
      avatarUrl: decoded.picture || backendData.account?.avatarUrl || "",
    };

    return NextResponse.json({
      sessionToken: backendData.sessionToken,
      account,
    });
  } catch (error) {
    console.error("Error pada /api/auth/google:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada otentikasi Google" },
      { status: 500 }
    );
  }
}
