import Anthropic from "@anthropic-ai/sdk";
import {
  type Message,
  type MessageCreateParamsNonStreaming,
} from "@anthropic-ai/sdk/resources/messages";

const FALLBACK_ANTHROPIC_MODEL = "claude-sonnet-5";
const DEFAULT_ANTHROPIC_MODEL = FALLBACK_ANTHROPIC_MODEL;
const RETIRED_MODEL_REPLACEMENTS: Record<string, string> = {
  "claude-sonnet-4-20250514": FALLBACK_ANTHROPIC_MODEL,
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

function isModelNotFoundError(error: unknown) {
  const maybeError = error as Partial<AnthropicLikeError>;
  const message = error instanceof Error ? error.message : "";
  const providerType = maybeError.error?.type ?? "";
  const providerMessage = maybeError.error?.message ?? "";
  const combined = `${providerType} ${providerMessage} ${message}`.toLowerCase();

  return (
    maybeError.status === 404 ||
    combined.includes("not_found_error") ||
    combined.includes("model:")
  );
}

export function getPublicAnthropicErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (isModelNotFoundError(error)) {
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

export async function createAnthropicMessage(
  params: MessageCreateParamsNonStreaming
): Promise<Message> {
  const client = getAnthropicClient();
  const primaryModel = RETIRED_MODEL_REPLACEMENTS[params.model] || params.model;

  try {
    return await client.messages.create({
      ...params,
      model: primaryModel,
    });
  } catch (error) {
    if (
      isModelNotFoundError(error) &&
      primaryModel !== FALLBACK_ANTHROPIC_MODEL
    ) {
      return client.messages.create({
        ...params,
        model: FALLBACK_ANTHROPIC_MODEL,
      });
    }

    throw error;
  }
}
