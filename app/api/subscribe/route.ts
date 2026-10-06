import { NextResponse } from "next/server";
import { sendCVConfirmation, verifyCVEmailBridge } from "@/lib/transactional-email";

export const runtime = "nodejs";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

async function resend(path: string, body?: unknown, idempotencyKey?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const apiBase = process.env.RESEND_API_BASE || "https://api.resend.com";
  return fetch(`${apiBase}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
}

export async function GET() {
  try {
    await verifyCVEmailBridge();
    const response = await resend('/contacts?limit=1');
    if (!response.ok) throw new Error('Subscriber service check failed');

    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(
      "Email service health check failed",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { ok: false },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(req: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: "We could not read the email request. Please try again." },
      { status: 400 }
    );
  }

  const email = String(payload.email || "").toLowerCase().trim();
  const firstName = String(payload.firstName || "").trim().slice(0, 80);
  if (!isEmail(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  let contactSaved = false;
  let emailSent = false;

  try {
    const segmentId = process.env.RESEND_CV_SEGMENT_ID;
    const contact = await resend("/contacts", {
      email,
      firstName,
      unsubscribed: false,
      ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
    });
    if (!contact.ok && contact.status !== 409) {
      throw new Error(await contact.text());
    }
    contactSaved = true;
  } catch (error) {
    console.error(
      "Resend contact capture failed",
      error instanceof Error ? error.message : error
    );
  }

  try {
    await sendCVConfirmation(email, firstName, String(payload.format || "pdf"));
    emailSent = true;
  } catch (error) {
    console.error(
      "Cloudflare welcome email failed",
      error instanceof Error ? error.message : error
    );
  }

  return NextResponse.json({
    success: true,
    contactSaved,
    emailSent,
    ...(!emailSent
      ? {
          warning:
            "Your download is ready. We could not send the confirmation email, but every download format remains available.",
        }
      : {}),
  });
}
