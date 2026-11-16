import { NextRequest, NextResponse } from "next/server";
import { recordContactSaveEvent } from "@/lib/server/db";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const cleanUser = String(username || "").toLowerCase().trim();
    const result = recordContactSaveEvent(cleanUser);

    return NextResponse.json({
      success: result.success,
      contactsSaved: result.contactsSaved,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mencatat simpan kontak";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
