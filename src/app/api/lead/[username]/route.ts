import { NextRequest, NextResponse } from "next/server";
import { saveLead, getLeadsByUsername } from "@/lib/server/db";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const cleanUser = String(username || "").toLowerCase().trim();
    const leads = getLeadsByUsername(cleanUser);

    return NextResponse.json({
      success: true,
      username: cleanUser,
      leads,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil daftar kontak lead" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const body = await request.json();

    const { name, phone, email, notes, company, status } = body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Nama wajib diisi" },
        { status: 400 }
      );
    }

    const cleanUser = String(username || "").toLowerCase().trim();

    // 1. Save directly into local persistent SQLite database
    const savedLead = saveLead({
      cardUsername: cleanUser,
      name: name.trim(),
      phone: phone ? String(phone).trim() : "",
      email: email ? String(email).trim() : "",
      company: company ? String(company).trim() : "",
      notes: notes ? String(notes).trim() : "",
      status: status || "warm",
    });

    // 2. Forward to remote backend API if configured
    const apiBase = process.env.NEXT_PUBLIC_CARDI_API_BASE_URL || "https://api.cardi.co.id";
    try {
      await fetch(`${apiBase}/nfc/profile/${encodeURIComponent(cleanUser)}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savedLead),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});
    } catch {
      // Backend not yet reachable; proceed
    }

    return NextResponse.json({
      success: true,
      message: "Kontak berhasil disimpan.",
      lead: savedLead,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memproses data kontak" },
      { status: 500 }
    );
  }
}

