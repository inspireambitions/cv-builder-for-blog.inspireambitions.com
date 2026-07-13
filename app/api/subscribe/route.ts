import { NextResponse } from "next/server";
import { resolveMx } from "node:dns/promises";

export const runtime = "nodejs";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

async function hasMx(email: string) {
  try {
    return (await resolveMx(email.split("@")[1])).length > 0;
  } catch {
    return false;
  }
}

async function resend(path: string, body: unknown, idempotencyKey?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  return fetch(`https://api.resend.com${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}) },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const email = String(payload.email || "").toLowerCase().trim();
    const firstName = String(payload.firstName || "").trim().slice(0, 80);
    if (!isEmail(email) || !(await hasMx(email))) return NextResponse.json({ error: "Enter a working email address." }, { status: 400 });

    const segmentId = process.env.RESEND_CV_SEGMENT_ID;
    const contact = await resend("/contacts", {
      email,
      firstName,
      unsubscribed: false,
      properties: {
        source: String(payload.source || "cv-builder-download-gate"),
        template: String(payload.template || "classic"),
        ui_language: String(payload.uiLang || "en"),
        cv_language: String(payload.cvLang || "en"),
        requested_format: String(payload.format || "pdf"),
      },
      ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
    });
    if (!contact.ok && contact.status !== 409) throw new Error(await contact.text());

    const welcome = await resend("/emails", {
      from: process.env.RESEND_FROM_EMAIL || "Inspire Ambitions <hello@inspireambitions.com>",
      to: [email],
      subject: "Your free CV downloads are unlocked",
      html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#1c1d1f"><h1>Your CV downloads are unlocked</h1><p>Greetings from Inspire Ambitions${firstName ? `, ${firstName}` : ""}.</p><p>You can return to the CV builder on this device and download PDF or Word without entering your email again.</p><h2>Three quick Gulf CV checks</h2><ol><li>State your current location and notice period.</li><li>Use numbers to prove results.</li><li>Match only skills you can support with evidence.</li></ol><p><a href="https://cv.inspireambitions.com">Return to the free CV builder</a></p><p>If the tool helped, leave an honest review on <a href="https://www.trustpilot.com/evaluate/inspireambitions.com">Trustpilot</a>. We ask every user the same way.</p><p style="font-size:12px;color:#666">You can unsubscribe from any guidance email with one tap.</p></div>`,
    }, `cv-welcome-${Buffer.from(email).toString("base64url").slice(0, 80)}`);
    if (!welcome.ok) throw new Error(await welcome.text());
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend capture failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We could not unlock downloads. Please try again." }, { status: 500 });
  }
}
