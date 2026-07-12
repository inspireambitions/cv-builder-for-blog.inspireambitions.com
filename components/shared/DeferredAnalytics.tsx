"use client";

import { useEffect } from "react";

const MEASUREMENT_ID = "G-PY9B70N583";

export default function DeferredAnalytics() {
  useEffect(() => {
    let loaded = false;
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    const cleanup = () => events.forEach((event) => window.removeEventListener(event, load));
    const load = () => {
      if (loaded) return;
      loaded = true;
      const analyticsWindow = window as typeof window & {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
      };
      analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
      analyticsWindow.gtag = (...args: unknown[]) => analyticsWindow.dataLayer?.push(args);
      analyticsWindow.gtag("js", new Date());
      analyticsWindow.gtag("config", MEASUREMENT_ID);
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
      document.head.appendChild(script);
      cleanup();
    };
    events.forEach((event) => window.addEventListener(event, load, { once: true, passive: true }));
    const timeout = window.setTimeout(load, 8000);
    return () => {
      window.clearTimeout(timeout);
      cleanup();
    };
  }, []);

  return null;
}
