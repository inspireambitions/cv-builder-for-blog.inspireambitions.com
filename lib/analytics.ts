"use client";

const DEFAULT_SOURCE = "cv-builder";
const DEFAULT_TOOL = "CV Builder";

type EventDetails = {
  source?: string;
  tool?: string;
  surface?: string;
  format?: string;
};

type AnalyticsWindow = Window & {
  dataLayer?: Record<string, unknown>[];
  gtag?: (...args: unknown[]) => void;
};

export function trackToolEvent(eventName: string, details: EventDetails = {}) {
  if (typeof window === "undefined") return;

  const win = window as AnalyticsWindow;
  const payload = {
    type: "ia_tool_event",
    event: eventName,
    source: details.source || DEFAULT_SOURCE,
    tool: details.tool || DEFAULT_TOOL,
    surface: details.surface || "cv_builder_app",
    format: details.format,
  };

  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push({
    event: eventName,
    tool_source: payload.source,
    tool_name: payload.tool,
    capture_surface: payload.surface,
    export_format: details.format,
  });

  if (typeof win.gtag === "function") {
    win.gtag("event", eventName, {
      event_category: "email_capture",
      event_label: payload.source,
      tool_source: payload.source,
      tool_name: payload.tool,
      capture_surface: payload.surface,
      export_format: details.format,
    });
  }

  if (window.parent && window.parent !== window) {
    window.parent.postMessage(payload, "https://inspireambitions.com");
  }
}
