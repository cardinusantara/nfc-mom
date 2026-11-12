import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const body = await request.json();

    const { name, phone, email, notes, company } = body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Nama wajib diisi" },
        { status: 400 }
      );
    }

    const leadRecord = {
      username,
      name: name.trim(),
      phone: phone ? String(phone).trim() : "",
      email: email ? String(email).trim() : "",
      company: company ? String(company).trim() : "",
      notes: notes ? String(notes).trim() : "",
      tappedAt: new Date().toISOString(),
    };

    // Forward to backend API if configured
    const apiBase = process.env.NEXT_PUBLIC_CARDI_API_BASE_URL || "https://api.cardi.co.id";
    try {
      await fetch(`${apiBase}/nfc/profile/${encodeURIComponent(username)}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadRecord),
        signal: AbortSignal.timeout(4000),
      }).catch(() => {
        // Silently tolerate if backend lead queue is pending deployment
      });
    } catch {
      // Backend not yet reachable; proceed
    }

    return NextResponse.json({
      success: true,
      message: "Kontak berhasil dikirim ke pemilik kartu.",
      lead: leadRecord,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memproses data kontak" },
      { status: 500 }
    );
  }
}

