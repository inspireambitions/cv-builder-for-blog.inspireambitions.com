import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";
const RETIRED_MODEL_REPLACEMENTS: Record<string, string> = {
  "claude-sonnet-4-20250514": "claude-sonnet-4-6",
};

const configuredModel = process.env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL;

export const ANTHROPIC_MODEL =
  RETIRED_MODEL_REPLACEMENTS[configuredModel] || configuredModel;

type AnthropicLikeError = Error & {
  status?: number;
  error?: {
    type?: string;
    message?: string;
  };
};

export function getPublicAnthropicErrorMessage(error: unknown) {
  const maybeError = error as Partial<AnthropicLikeError>;
  const message = error instanceof Error ? error.message : "";
  const providerType = maybeError.error?.type ?? "";
  const providerMessage = maybeError.error?.message ?? "";
  const combined = `${providerType} ${providerMessage} ${message}`.toLowerCase();

  if (
    maybeError.status === 404 ||
    combined.includes("not_found_error") ||
    combined.includes("model:")
  ) {
    return "AI analysis is temporarily unavailable. You can still build your CV manually with the guided steps.";
  }

  if (message === "ANTHROPIC_API_KEY is not configured") {
    return "AI analysis is temporarily unavailable. You can still build your CV manually with the guided steps.";
  }

  return message || "Failed to analyse this CV file. Please try a PDF, DOCX, TXT, RTF, JPG, PNG, WEBP, HEIC, or HEIF file.";
}

export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  return new Anthropic({ apiKey });
}
