import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import {
  listAllProfiles,
  updateCardProfile,
  deleteCardProfile,
} from "@/lib/server/db";

export async function GET(req: Request) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  const profiles = listAllProfiles();
  return NextResponse.json({
    success: true,
    count: profiles.length,
    profiles,
  });
}

export async function PATCH(req: Request) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await req.json();
    const { username, ...updates } = body;

    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json(
        { success: false, error: "Username wajib disertakan." },
        { status: 400 }
      );
    }

    const cleanUser = username.trim().toLowerCase();
    const updated = updateCardProfile(cleanUser, updates);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Profil kartu tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: updated,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Format request body tidak valid." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username || !username.trim()) {
    return NextResponse.json(
      { success: false, error: "Parameter username wajib disertakan." },
      { status: 400 }
    );
  }

  const cleanUser = username.trim().toLowerCase();
  const deleted = deleteCardProfile(cleanUser);

  if (!deleted) {
    return NextResponse.json(
      { success: false, error: "Profil kartu tidak ditemukan." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Profil kartu @${cleanUser} berhasil dihapus.`,
  });
}
