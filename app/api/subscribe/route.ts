import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ResendDomain = {
  name?: string;
  status?: string;
  capabilities?: { sending?: string };
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

function senderAddress() {
  return (
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    "Inspire Ambitions <info@inspireambitions.com>"
  );
}

function senderDomain() {
  return senderAddress().match(/@([^>\s]+)/)?.[1]?.toLowerCase() ?? "";
}

function tagValue(value: unknown) {
  return (
    String(value || "unknown")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 256) || "unknown"
  );
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
  });
}

export async function GET() {
  try {
    const response = await resend("/domains");
    if (!response.ok) throw new Error(`Resend health check returned ${response.status}`);

    const payload = (await response.json()) as { data?: ResendDomain[] };
    const domain = payload.data?.find(
      (item) => item.name?.toLowerCase() === senderDomain()
    );
    const ready =
      Boolean(domain) &&
      domain?.capabilities?.sending === "enabled" &&
      ["verified", "partially_verified", "partially_failed"].includes(
        domain?.status || ""
      );

    if (!ready) throw new Error("The configured Resend sender domain is not ready");

    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(
      "Resend health check failed",
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
    const emailRequest = {
      from: senderAddress(),
      to: [email],
      subject: "Your free CV downloads are unlocked",
      html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#1c1d1f"><h1>Your CV downloads are unlocked</h1><p>Greetings from Inspire Ambitions${firstName ? `, ${firstName}` : ""}.</p><p>You can return to the CV builder on this device and download PDF or Word without entering your email again.</p><h2>Three quick Gulf CV checks</h2><ol><li>State your current location and notice period.</li><li>Use numbers to prove results.</li><li>Match only skills you can support with evidence.</li></ol><p><a href="https://cv.inspireambitions.com">Return to the free CV builder</a></p><p>If the tool helped, leave an honest review on <a href="https://www.trustpilot.com/evaluate/inspireambitions.com">Trustpilot</a>. We ask every user the same way.</p><p style="font-size:12px;color:#666">You can unsubscribe from any guidance email with one tap.</p></div>`,
      tags: [
        { name: "source", value: "cv_builder" },
        { name: "requested_format", value: tagValue(payload.format || "pdf") },
      ],
    };
    const idempotencyKey = `cv-welcome-${createHash("sha256")
      .update(JSON.stringify(emailRequest))
      .digest("base64url")}`;
    const welcome = await resend(
      "/emails",
      emailRequest,
      idempotencyKey
    );
    if (!welcome.ok) throw new Error(await welcome.text());
    emailSent = true;
  } catch (error) {
    console.error(
      "Resend welcome email failed",
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
