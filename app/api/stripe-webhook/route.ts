import { NextRequest, NextResponse } from "next/server";

// Payment webhook (Mamo Pay) coming soon.
// Placeholder route to prevent build errors.

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return NextResponse.json({ received: true }, { status: 200 });
}
