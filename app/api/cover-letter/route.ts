import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cvData, jobTitle, company, jobDescription } = body;

    if (!cvData || typeof cvData !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid 'cvData' field." },
        { status: 400 }
      );
    }

    let userContent = `Here is my CV data:\n\n${JSON.stringify(cvData, null, 2)}`;

    if (jobTitle) userContent += `\n\nTarget job title: ${jobTitle}`;
    if (company) userContent += `\nCompany: ${company}`;
    if (jobDescription)
      userContent += `\n\nJob description:\n${jobDescription}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system:
        "You are an expert career writer and HR professional. Using the CV data provided, write a professional cover letter. If a job description is provided, tailor the letter to match the role keywords and requirements. The letter should be 3 short paragraphs: opening (hook + role), middle (top 2-3 achievements relevant to the role), close (call to action). Use British English. No more than 350 words.",
      messages: [{ role: "user", content: userContent }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Unexpected response format from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ coverLetter: content.text });
  } catch (error) {
    console.error("Cover Letter error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter. Please try again." },
      { status: 500 }
    );
  }
}
