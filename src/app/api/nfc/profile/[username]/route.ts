import { NextResponse } from "next/server";
import { getCardProfileByUsername } from "@/lib/server/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json(
        { success: false, error: "Username tidak valid" },
        { status: 400 }
      );
    }

    const cleanUser = decodeURIComponent(username).toLowerCase().trim();
    const profile = getCardProfileByUsername(cleanUser);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profil kartu tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Terjadi kesalahan saat memuat profil kartu.",
      },
      { status: 500 }
    );
  }
}
