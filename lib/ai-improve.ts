import { ANTHROPIC_MODEL, getAnthropicClient } from "@/lib/anthropic";

export const AI_IMPROVE_SYSTEM_PROMPT =
  'You are an expert HR Specialist and CV coach. Analyse the CV provided and return a JSON object with two keys: "extracted" (an object with fields: name, title, email, phone, location, linkedin, summary, experience array [{role, company, companyDesc, location, dates, description}], education array [{degree, institution, year, grade}], skills array of strings, languages array [{language, level}]) and "feedback" (an array of 3-5 specific improvement suggestions, each as a string starting with the section name in bold). Return only valid JSON, no preamble, no markdown fences.';

export function extractJSON(text: string): string {
  let cleaned = text.trim();
  const bt = String.fromCharCode(96);
  const fence = bt + bt + bt;
  const fenceStart = cleaned.indexOf(fence);
  if (fenceStart !== -1) {
    const afterFirstFence = cleaned.indexOf("\n", fenceStart);
    const fenceEnd = cleaned.indexOf(fence, afterFirstFence);
    if (afterFirstFence !== -1 && fenceEnd !== -1) {
      cleaned = cleaned.slice(afterFirstFence + 1, fenceEnd).trim();
    }
  }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

export async function analyseCvText(text: string) {
  const message = await getAnthropicClient().messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 1500,
    system: AI_IMPROVE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: text }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response format from AI");
  }

  return JSON.parse(extractJSON(content.text));
}
