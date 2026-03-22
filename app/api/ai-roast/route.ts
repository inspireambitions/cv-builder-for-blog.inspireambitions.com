import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cvData } = body;

    if (!cvData || typeof cvData !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid 'cvData' field." },
        { status: 400 }
      );
    }

    const message = await getAnthropicClient().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system:
        "You are a brutally honest senior HR Specialist who has screened over 10,000 CVs. The user has paid for honest, actionable feedback. Do not soften your analysis. Identify every weak bullet, generic phrase, missing metric, and structural problem. Format your response as a numbered list. Each item starts with the exact text or section name, followed by the specific problem, followed by a rewritten example that fixes it. Be direct. No fluff.",
      messages: [
        {
          role: "user",
          content: `Here is my CV data:\n\n${JSON.stringify(cvData, null, 2)}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Unexpected response format from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ feedback: content.text });
  } catch (error) {
    console.error("AI Roast error:", error);
    return NextResponse.json(
      { error: "Failed to generate CV roast. Please try again." },
      { status: 500 }
    );
  }
}
