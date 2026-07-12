import { NextRequest, NextResponse } from "next/server";
import { tailorCv } from "@/lib/tailoring";
import type { TailoringRequest } from "@/lib/tailoring-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const requestWindows = new Map<string, { count: number; resetAt: number }>();

function getClientKey(req: NextRequest) {
  return (
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function isRateLimited(req: NextRequest) {
  const now = Date.now();
  const key = getClientKey(req);
  const current = requestWindows.get(key);
  if (!current || current.resetAt <= now) {
    requestWindows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  if (isRateLimited(req)) {
    return NextResponse.json(
      { error: "You have reached the beta review limit. Please wait ten minutes before trying again." },
      { status: 429, headers: { "Retry-After": "600" } }
    );
  }
  try {
    const request = (await req.json()) as TailoringRequest;
    return NextResponse.json(await tailorCv(request));
  } catch (error) {
    console.error("Premium tailoring error:", error);
    const message = error instanceof Error ? error.message : "Tailoring failed. Please try again.";
    const isInputError = /before tailoring|at least|too long|Add more/i.test(message);
    return NextResponse.json({ error: message }, { status: isInputError ? 400 : 500 });
  }
}
