const XAI_API_URL = "https://api.x.ai/v1/chat/completions";
export const XAI_MODEL = process.env.XAI_MODEL || "grok-4.5";

type XaiResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

export async function createXaiStructuredCompletion<T>(options: {
  system: string;
  user: string;
  schemaName: string;
  schema: Record<string, unknown>;
  timeoutMs?: number;
}): Promise<T> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("XAI_API_KEY is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 55_000);
  try {
    const response = await fetch(XAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: XAI_MODEL,
        reasoning_effort: "medium",
        temperature: 0.2,
        messages: [
          { role: "system", content: options.system },
          { role: "user", content: options.user },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: options.schemaName,
            strict: true,
            schema: options.schema,
          },
        },
      }),
      signal: controller.signal,
    });
    const payload = (await response.json()) as XaiResponse & { error?: { message?: string } };
    if (!response.ok) {
      throw new Error(payload.error?.message || `xAI request failed with ${response.status}`);
    }
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("xAI returned no structured content");
    return JSON.parse(content) as T;
  } finally {
    clearTimeout(timeout);
  }
}
