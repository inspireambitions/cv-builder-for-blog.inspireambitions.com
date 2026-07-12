"use client";

import { useEffect } from "react";

const MEASUREMENT_ID = "G-PY9B70N583";

export default function DeferredAnalytics() {
  useEffect(() => {
    let loaded = false;
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
    };
    const timeout = window.setTimeout(load, 8000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  return null;
}
