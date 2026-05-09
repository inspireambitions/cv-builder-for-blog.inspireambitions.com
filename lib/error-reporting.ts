"use client";

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_RE = /(?:\+?\d[\s().-]?){7,}/g;

function scrub(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(EMAIL_RE, "[email]")
      .replace(PHONE_RE, "[phone]")
      .slice(0, 800);
  }

  if (Array.isArray(value)) return value.map(scrub);

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        scrub(item),
      ])
    );
  }

  return value;
}

export function scrubForTelemetry(value: unknown): unknown {
  return scrub(value);
}

export function reportClientError(event: string, details: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const payload = {
    event,
    details: scrubForTelemetry(details),
    path: window.location.pathname,
    userAgent: navigator.userAgent.slice(0, 240),
  };

  window.fetch("/api/client-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Telemetry must never block the CV builder.
  });
}
