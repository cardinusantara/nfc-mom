import { NextRequest, NextResponse } from "next/server";
import { recordTapEvent } from "@/lib/server/db";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const cleanUser = String(username || "").toLowerCase().trim();
    const result = recordTapEvent(cleanUser);

    return NextResponse.json({
      success: result.success,
      totalTaps: result.totalTaps,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mencatat tap kartu";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
