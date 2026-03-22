import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SYSTEM_PROMPT =
    "You are a senior recruiter conducting a structured competency-based interview. You have reviewed the candidate's CV. Ask one question at a time. Start with an introduction, then ask behavioural questions using the STAR method. After 5 questions, provide a brief summary of strengths and areas to improve. Keep each response under 150 words.";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cvData, jobTitle, message, history } = body;

    if (!cvData || typeof cvData !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid 'cvData' field." },
        { status: 400 }
      );
    }

    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    if (history && Array.isArray(history)) {
      messages.push(...history);
    }

    let startContent = `Here is the candidate's CV:\n\n${JSON.stringify(cvData, null, 2)}`;
    if (jobTitle) startContent += `\n\nTarget role: ${jobTitle}`;

    if (messages.length === 0) {
      startContent += "\n\nPlease begin the interview.";
      messages.push({ role: "user", content: startContent });
    }

    const response = await getAnthropicClient().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Unexpected response format from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: content.text });
  } catch (error) {
    console.error("Mock Interview error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview response. Please try again." },
      { status: 500 }
    );
  }
}
