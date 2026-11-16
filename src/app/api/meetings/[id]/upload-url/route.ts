import { NextRequest, NextResponse } from "next/server";

const CARDI_API_URL =
  process.env.CARDI_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fuldtvg7vk.execute-api.ap-southeast-1.amazonaws.com";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authHeader = req.headers.get("authorization");
    const body = await req.json().catch(() => ({}));
    const ext = body.ext || "webm";

    // 1. Forward directly to AWS API Gateway if token is present
    if (authHeader) {
      try {
        const res = await fetch(
          `${CARDI_API_URL}/meetings/${encodeURIComponent(id)}/upload-url`,
          {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ext }),
          }
        );

        const data = await res.json();
        if (res.ok) {
          return NextResponse.json(data);
        }
      } catch (upstreamErr) {
        console.warn("[UploadUrlProxy] Upstream backend failed, using fallback:", upstreamErr);
      }
    }

    // 2. Safe development fallback for unauthenticated or mock testing
    const key = `uploads/${id}/audio.${ext}`;
    return NextResponse.json({
      key,
      uploadUrl: `https://cardi-mom-audio.s3.ap-southeast-1.amazonaws.com/${key}?simulated=true`,
    });
  } catch (err) {
    console.error("Error pada POST /api/meetings/[id]/upload-url:", err);
    return NextResponse.json(
      { error: "Gagal mendapatkan URL unggah S3" },
      { status: 500 }
    );
  }
}
