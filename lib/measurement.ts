// Manual events only. Never capture DOM text, form fields, URLs, photos or recordings.
export const MEASUREMENT_EVENTS = [
  "full_form_started", "full_form_step_viewed", "full_form_completed",
  "talk_mode_started", "talk_question_answered", "talk_question_skipped",
  "talk_voice_used", "read_aloud_used", "talk_bullets_accepted",
  "talk_bullets_changed", "talk_mode_completed", "match_score_run",
  "match_gap_fixed", "whatsapp_share_used", "cv_exported",
] as const;

export type MeasurementDetails = {
  questionId?: string;
  lang?: string;
  format?: string;
  stepKey?: string;
};

export function measurementPayload(event: string, details: MeasurementDetails, distinctId: string, token: string) {
  if (!(MEASUREMENT_EVENTS as readonly string[]).includes(event)) return null;
  const properties: Record<string, string | boolean> = {
    product: "cv-builder", measurement_version: "1", $process_person_profile: false,
    $geoip_disable: true,
  };
  if (details.questionId && /^[a-z][a-z0-9_-]{0,39}$/.test(details.questionId)) properties.question_id = details.questionId;
  if (details.lang && ["en", "ar", "ur", "hi", "tl"].includes(details.lang)) properties.lang = details.lang;
  if (details.format && ["jpeg", "pdf_ats", "pdf_recruiter", "word_ats", "word_recruiter"].includes(details.format)) properties.format = details.format;
  if (details.stepKey && ["start", "personal", "experience", "education", "skills", "summary", "template", "extras", "score"].includes(details.stepKey)) properties.step_key = details.stepKey;
  return { api_key: token, event, distinct_id: distinctId, properties };
}

export type MeasurementConfig = { enabled: boolean; optedIn: boolean; host: string; token: string };

export async function sendMeasurement(event: string, details: MeasurementDetails, distinctId: string, config: MeasurementConfig, transport: typeof fetch = fetch) {
  if (!config.enabled || !config.optedIn || !config.token || !["https://us.i.posthog.com", "https://eu.i.posthog.com"].includes(config.host)) return false;
  const payload = measurementPayload(event, details, distinctId, config.token);
  if (!payload) return false;
  try {
    const response = await transport(`${config.host}/i/v0/e`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), keepalive: true, credentials: "omit",
      referrerPolicy: "no-referrer", signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    // Analytics must never interrupt editing or downloading.
    return false;
  }
}

export function captureMeasurement(event: string, details: MeasurementDetails) {
  if (typeof window === "undefined" || process.env.NEXT_PUBLIC_POSTHOG_ENABLED !== "true") return;
  try {
    if (navigator.doNotTrack === "1" || localStorage.getItem("ia-usage-consent") !== "yes") return;
    const sessionId = sessionStorage.getItem("ia-usage-session") || crypto.randomUUID();
    sessionStorage.setItem("ia-usage-session", sessionId);
    const config = {
      enabled: true, optedIn: true,
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "",
      token: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? "",
    };
    const id = sessionId;
    // Event-driven and deferred: no SDK or automatic page tracking on initial load.
    window.setTimeout(() => {
      try {
        if (localStorage.getItem("ia-usage-consent") === "yes") void sendMeasurement(event, details, id, config);
      } catch { /* Optional storage may become unavailable. */ }
    }, 0);
  } catch {
    // Storage can be unavailable in private browsers. Editing still works.
  }
}
