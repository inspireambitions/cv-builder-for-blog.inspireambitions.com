import {
  ANTHROPIC_MODEL,
  createAnthropicMessage,
  getAnthropicToolInput,
} from "@/lib/anthropic";
import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const AI_IMPROVE_SYSTEM_PROMPT =
  'You are an expert HR Career Specialist and CV coach. Extract only facts visible in the uploaded CV or image. Never invent licence numbers, DHA, DOH, MOH or RERA credentials, employers, dates, job titles, education, salary, nationality, visa status or legal status. Leave unclear or missing fields empty and mention each important gap in the feedback. Do not imply a professional licence exists unless the CV states it. Submit the result with the provided tool.';

const ANALYSIS_TOOL_NAME = "submit_cv_analysis";
const STRING_FIELD = { type: "string" } as const;
const CV_ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["extracted", "feedback"],
  properties: {
    extracted: {
      type: "object",
      additionalProperties: false,
      required: [
        "name",
        "title",
        "email",
        "phone",
        "location",
        "linkedin",
        "summary",
        "experience",
        "education",
        "skills",
        "languages",
      ],
      properties: {
        name: STRING_FIELD,
        title: STRING_FIELD,
        email: STRING_FIELD,
        phone: STRING_FIELD,
        location: STRING_FIELD,
        linkedin: STRING_FIELD,
        summary: STRING_FIELD,
        experience: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: [
              "role",
              "company",
              "companyDesc",
              "location",
              "dates",
              "description",
            ],
            properties: {
              role: STRING_FIELD,
              company: STRING_FIELD,
              companyDesc: STRING_FIELD,
              location: STRING_FIELD,
              dates: STRING_FIELD,
              description: STRING_FIELD,
            },
          },
        },
        education: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["degree", "institution", "year", "grade"],
            properties: {
              degree: STRING_FIELD,
              institution: STRING_FIELD,
              year: STRING_FIELD,
              grade: STRING_FIELD,
            },
          },
        },
        skills: { type: "array", items: STRING_FIELD },
        languages: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["language", "level"],
            properties: { language: STRING_FIELD, level: STRING_FIELD },
          },
        },
      },
    },
    feedback: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: STRING_FIELD,
    },
  },
} as const;

type CvAnalysis = {
  extracted: Record<string, unknown>;
  feedback: string[];
};

async function requestStructuredAnalysis(
  messages: Parameters<typeof createAnthropicMessage>[0]["messages"]
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const message = await createAnthropicMessage({
        model: ANTHROPIC_MODEL,
        max_tokens: 2400,
        system: AI_IMPROVE_SYSTEM_PROMPT,
        messages,
        tools: [
          {
            name: ANALYSIS_TOOL_NAME,
            description: "Submit the facts extracted from the CV and practical feedback.",
            input_schema: CV_ANALYSIS_SCHEMA as Tool.InputSchema,
          },
        ],
        tool_choice: { type: "tool", name: ANALYSIS_TOOL_NAME },
      });
      const analysis = getAnthropicToolInput<CvAnalysis>(
        message,
        ANALYSIS_TOOL_NAME
      );
      if (
        !analysis ||
        typeof analysis !== "object" ||
        !analysis.extracted ||
        !Array.isArray(analysis.feedback)
      ) {
        throw new Error("AI analysis did not match the required structure");
      }
      return analysis;
    } catch (error) {
      lastError = error;
      console.error(
        `CV analysis returned invalid structured output (attempt ${attempt}/2)`,
        error
      );
    }
  }

  throw new Error(
    "AI analysis is temporarily unavailable. Your CV was not changed. Continue with the guided steps.",
    { cause: lastError }
  );
}

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
  return requestStructuredAnalysis([{ role: "user", content: text }]);
}

export async function analyseCvImage(base64Data: string, mediaType: string) {
  const supportedMediaType = mediaType === "image/webp" ? "image/webp" : mediaType === "image/png" ? "image/png" : "image/jpeg";
  return requestStructuredAnalysis([
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
    ]);
}
