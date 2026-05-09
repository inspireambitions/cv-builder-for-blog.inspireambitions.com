import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.warn("cv-builder-client-error", {
      event: payload?.event,
      details: payload?.details,
      path: payload?.path,
      userAgent: payload?.userAgent,
    });
  } catch {
    // Ignore malformed telemetry.
  }

  return NextResponse.json({ ok: true });
}
