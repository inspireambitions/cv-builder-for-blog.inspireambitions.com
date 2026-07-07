import { ANTHROPIC_MODEL, createAnthropicMessage } from "@/lib/anthropic";

export const AI_IMPROVE_SYSTEM_PROMPT =
  'You are an expert HR Specialist and CV coach. Analyse the CV provided and return a JSON object with two keys: "extracted" (an object with fields: name, title, email, phone, location, linkedin, summary, experience array [{role, company, companyDesc, location, dates, description}], education array [{degree, institution, year, grade}], skills array of strings, languages array [{language, level}]) and "feedback" (an array of 3-5 specific improvement suggestions, each as a string starting with the section name in bold). Safety rules: extract only facts visible in the uploaded CV or image; never invent licence numbers, DHA/DOH/MOH/RERA credentials, employers, dates, job titles, education, salary, nationality, visa status, or legal status; if a field is unclear or missing, leave it empty and mention the gap in feedback; do not imply a professional licence exists unless it is explicitly shown. Return only valid JSON, no preamble, no markdown fences.';

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
  const message = await createAnthropicMessage({
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

export async function analyseCvImage(base64Data: string, mediaType: string) {
  const supportedMediaType = mediaType === "image/webp" ? "image/webp" : mediaType === "image/png" ? "image/png" : "image/jpeg";
  const message = await createAnthropicMessage({
    model: ANTHROPIC_MODEL,
    max_tokens: 1500,
    system: AI_IMPROVE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: supportedMediaType,
              data: base64Data,
            },
          },
          {
            type: "text",
            text: "Read this CV image or screenshot and extract the same structured CV data and feedback as requested. If text is unclear, return the readable parts and specific feedback about missing information. Do not infer or invent credentials, dates, employers, legal status, or licence numbers from context.",
          },
        ],
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response format from AI");
  }

  return JSON.parse(extractJSON(content.text));
}
