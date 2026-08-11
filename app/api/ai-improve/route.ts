import { NextRequest, NextResponse } from "next/server";
import { analyseCvText } from "@/lib/ai-improve";
import { getPublicAnthropicErrorMessage } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' field. Please provide CV text." },
        { status: 400 }
      );
    }

    return NextResponse.json(await analyseCvText(text));
  } catch (error) {
    console.error("AI Improve error:", error);

    return NextResponse.json(
      { error: getPublicAnthropicErrorMessage(error) },
      { status: 500 }
    );
  }
}
