import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface HandoffPayload {
  role: string;
  country: string;
  tasks: string[];
  source: string;
  exp: number;
}

export async function POST(request: Request) {
  const secret = process.env.HANDOFF_SECRET;
  if (!secret || secret.length < 32) {
    return NextResponse.json({ error: "CV handoff is not configured." }, { status: 503 });
  }
  const { token } = await request.json() as { token?: string };
  if (!token || token.length > 12000) return NextResponse.json({ error: "Invalid handoff." }, { status: 400 });
  const [encoded, provided] = token.split(".");
  if (!encoded || !provided) return NextResponse.json({ error: "Invalid handoff." }, { status: 400 });
  const expected = createHmac("sha256", secret).update(encoded).digest();
  let supplied: Buffer;
  try { supplied = Buffer.from(provided, "base64url"); } catch { return NextResponse.json({ error: "Invalid handoff." }, { status: 400 }); }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ error: "Invalid handoff signature." }, { status: 400 });
  }
  let payload: HandoffPayload;
  try { payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as HandoffPayload; } catch { return NextResponse.json({ error: "Invalid handoff payload." }, { status: 400 }); }
  if (payload.source !== "ai-job-risk-calculator" || payload.exp < Math.floor(Date.now() / 1000) || !payload.role || !Array.isArray(payload.tasks)) {
    return NextResponse.json({ error: "This handoff has expired." }, { status: 410 });
  }
  return NextResponse.json({ role: payload.role.slice(0, 120), country: String(payload.country || "").slice(0, 60), tasks: payload.tasks.slice(0, 8).map((task) => String(task).slice(0, 300)) });
}
