import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT =
  "You are a senior recruiter conducting a structured competency-based interview. You have reviewed the candidate's CV. Ask one question at a time. After the candidate responds, give brief feedback (2-3 sentences: what was strong, what was missing, suggested improvement). Then ask the next question. Start with: 'Tell me about yourself.' Use the STAR framework as a reference point for evaluating responses. Total of 10 questions.";

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

    if (history && Array.isArray(history) && history.length > 0) {
      // Continue conversation with existing history
      for (const msg of history) {
        messages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }

      if (message && typeof message === "string") {
        messages.push({ role: "user", content: message });
      }
    } else {
      // Initial call — start the interview
      let startContent = `Here is the candidate's CV:\n\n${JSON.stringify(cvData, null, 2)}`;
      if (jobTitle) startContent += `\n\nThey are applying for: ${jobTitle}`;
      startContent += "\n\nPlease begin the interview.";
      messages.push({ role: "user", content: startContent });
    }

    const response = await anthropic.messages.create({
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
      { error: "Failed to continue mock interview. Please try again." },
      { status: 500 }
    );
  }
}
