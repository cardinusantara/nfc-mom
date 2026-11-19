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
}

function decodeJwtPayload(token: string): GoogleTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonPayload) as GoogleTokenPayload;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, deviceId } = body;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "idToken Google wajib disertakan." },
        { status: 400 }
      );
    }

    const decoded = decodeJwtPayload(idToken);
    if (!decoded || !decoded.email || !decoded.sub) {
      return NextResponse.json(
        { error: "Format token Google tidak valid." },
        { status: 400 }
      );
    }

    const resolvedDeviceId =
      typeof deviceId === "string" && deviceId.trim().length > 0
        ? deviceId.trim()
        : `web_${decoded.sub.slice(0, 12)}`;

    const backendRes = await fetch(`${CARDI_API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken,
        deviceId: resolvedDeviceId,
      }),
    });

    if (!backendRes.ok) {
      const errText = await backendRes.text().catch(() => "");
      let message = `Backend menolak autentikasi Google (${backendRes.status})`;
      try {
        const parsed = JSON.parse(errText);
        if (typeof parsed?.message === "string" && parsed.message.length > 0) {
          message = parsed.message;
        } else if (typeof parsed?.error === "string" && parsed.error.length > 0) {
          message = parsed.error;
        }
      } catch {
        // Keep default message if response is not JSON
      }

      return NextResponse.json(
        { error: message },
        { status: backendRes.status }
      );
    }

    const backendData = await backendRes.json();
    const displayName =
      decoded.name || backendData.account?.name || decoded.email.split("@")[0];

    return NextResponse.json({
      sessionToken: backendData.sessionToken,
      account: {
        ...backendData.account,
        email: backendData.account?.email || decoded.email,
        name: displayName,
        avatarUrl: decoded.picture || backendData.account?.avatarUrl || "",
        coinBalance: backendData.account?.coinsBalance ?? 0,
      },
    });
  } catch (error) {
    console.error("Error /api/auth/google:", error);
    return NextResponse.json(
      { error: "Gagal terhubung ke server autentikasi Cardi." },
      { status: 502 }
    );
  }
}
