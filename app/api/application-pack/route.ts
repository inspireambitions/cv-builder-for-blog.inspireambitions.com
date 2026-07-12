import { NextRequest, NextResponse } from "next/server";
import {
  ANTHROPIC_MODEL,
  createAnthropicMessage,
  getAnthropicTextContent,
} from "@/lib/anthropic";
import { extractJSON } from "@/lib/ai-improve";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

function numberTokens(value: string) {
  return value.match(/\b\d+(?:[.,]\d+)?(?:%|\b)/g) ?? [];
}

interface StarPrompt {
  question: string;
  evidenceIds: string[];
  bridgeAdvice: string;
}

interface ApplicationPack {
  coverLetter: string;
  recruiterEmail: string;
  linkedinMessage: string;
  interviewQuestions: string[];
  starPrompts: StarPrompt[];
}

function validatePack(pack: ApplicationPack, evidence: Array<{ id: string; text: string }>) {
  const evidenceIds = new Set(evidence.map((item) => item.id));
  const evidenceText = evidence.map((item) => item.text).join(" ").toLowerCase();
  const publicCopy = [pack.coverLetter, pack.recruiterEmail, pack.linkedinMessage].join(" ");
  const unsupportedNumbers = numberTokens(publicCopy).filter(
    (number) => !evidenceText.includes(number.toLowerCase())
  );
  if (unsupportedNumbers.length) {
    throw new Error(`Application pack contains unsupported numbers: ${unsupportedNumbers.join(", ")}`);
  }
  if (pack.interviewQuestions.length !== 10 || pack.starPrompts.length !== 5) {
    throw new Error("Application pack has the wrong number of interview items");
  }
  pack.starPrompts.forEach((prompt, index) => {
    if (
      typeof prompt?.question !== "string" ||
      typeof prompt?.bridgeAdvice !== "string" ||
      !Array.isArray(prompt?.evidenceIds) ||
      prompt.evidenceIds.some((id: string) => !evidenceIds.has(id))
    ) {
      throw new Error(`STAR prompt ${index + 1} has invalid evidence references`);
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.final || !Array.isArray(body?.evidence) || !body?.jobDescription) {
      return NextResponse.json({ error: "A completed tailoring review is required." }, { status: 400 });
    }
    const message = await createAnthropicMessage({
      model: ANTHROPIC_MODEL,
      max_tokens: 3600,
      system: `You are the application-pack writer in a premium UAE career agency.
Use British English and only facts supported by the evidence ledger. Never invent achievements, qualifications, contacts or company facts.
Return JSON only with: coverLetter string (250-350 words, three short paragraphs), recruiterEmail string (under 140 words), linkedinMessage string (under 300 characters), interviewQuestions array of 10 strings, starPrompts array of 5 objects with question, evidenceIds and bridgeAdvice.
STAR prompts may guide the candidate, but must not write invented situations or results. If evidence is insufficient, say what the candidate should add.
Avoid cliches, em dashes, inflated claims and generic flattery.`,
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            target: {
              jobTitle: body.jobTitle || "",
              company: body.company || "",
              jobDescription: body.jobDescription,
            },
            evidence: body.evidence,
            finalCv: body.final,
          }),
        },
      ],
    });
    const pack = JSON.parse(extractJSON(getAnthropicTextContent(message))) as ApplicationPack;
    if (
      typeof pack?.coverLetter !== "string" ||
      typeof pack?.recruiterEmail !== "string" ||
      typeof pack?.linkedinMessage !== "string" ||
      !Array.isArray(pack?.interviewQuestions) ||
      !Array.isArray(pack?.starPrompts)
    ) {
      throw new Error("Application pack did not match the required structure");
    }
    validatePack(pack, body.evidence);
    return NextResponse.json(pack);
  } catch (error) {
    console.error("Application pack error:", error);
    return NextResponse.json({ error: "The CV is safe, but the application pack could not be completed. Please try again." }, { status: 500 });
  }
}
