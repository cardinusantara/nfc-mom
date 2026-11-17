import { NextRequest, NextResponse } from "next/server";
import { listAllProfiles, updateCardProfile, deleteCardProfile } from "@/lib/server/db";
import { verifyAdminRequest } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAdminRequest(request);
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil data kartu";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const { username, ...updates } = body;

    if (!username) {
      return NextResponse.json(
        { success: false, error: "Username wajib diisi" },
        { status: 400 }
      );
    }

    const updated = updateCardProfile(username, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Kartu tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui status kartu";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    let username = searchParams.get("username");

    if (!username) {
      const body = await request.json().catch(() => null);
      username = body?.username;
    }

    if (!username) {
      return NextResponse.json(
        { success: false, error: "Username kartu wajib disertakan" },
        { status: 400 }
      );
    }

    const success = deleteCardProfile(username);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Kartu tidak ditemukan atau gagal dihapus" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Kartu ${username} berhasil dihapus`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus kartu";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
