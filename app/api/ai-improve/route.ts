import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

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

    const message = await getAnthropicClient().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system:
        'You are an expert HR Director and CV coach. Analyse the CV provided and return a JSON object with two keys: "extracted" (an object with fields: name, title, email, phone, location, linkedin, summary, experience array [{role, company, companyDesc, location, dates, description}], education array [{degree, institution, year, grade}], skills array of strings, languages array [{language, level}]) and "feedback" (an array of 3-5 specific improvement suggestions, each as a string starting with the section name in bold). Return only valid JSON, no preamble, no markdown fences.',
      messages: [{ role: "user", content: text }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Unexpected response format from AI" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content.text);
    return NextResponse.json(parsed);
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
