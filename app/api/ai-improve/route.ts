import { NextRequest, NextResponse } from "next/server";
import { analyseCvText } from "@/lib/ai-improve";

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

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response as JSON" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyse CV. Please try again." },
      { status: 500 }
    );
  }
}
