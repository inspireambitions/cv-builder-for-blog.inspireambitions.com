import { NextRequest, NextResponse } from "next/server";
import { GCC_MENA_CODES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const countryCode =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    "";

  return NextResponse.json({
    geo: GCC_MENA_CODES.includes(countryCode.toUpperCase()) ? "gulf" : "global",
  });
}
