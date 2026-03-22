import { NextRequest, NextResponse } from "next/server";

// Payment integration (Mamo Pay) coming soon.
// All features are currently free during beta.

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      message:
        "All features are currently free during our launch period. No payment required.",
      free: true,
    },
    { status: 200 }
  );
}
