"use client";
import { useSyncExternalStore } from "react";

function readPreference() {
  try { return localStorage.getItem("ia-usage-consent") === "yes"; } catch { return false; }
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("ia-usage-preference", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("ia-usage-preference", listener);
  };
}

export default function UsagePreference() {
  const allowed = useSyncExternalStore(subscribe, readPreference, () => false);
  if (process.env.NEXT_PUBLIC_POSTHOG_ENABLED !== "true") return null;
  return <div className="mx-auto max-w-xl px-4 pt-4 pb-[calc(112px+env(safe-area-inset-bottom,0px))] text-sm text-gray-600 sm:pb-4">
    <label className="flex min-h-12 items-center gap-3">
      <input type="checkbox" checked={allowed} onChange={(event) => {
        const checked = event.target.checked;
        try {
          localStorage.setItem("ia-usage-consent", checked ? "yes" : "no");
          if (!checked) sessionStorage.removeItem("ia-usage-session");
          window.dispatchEvent(new Event("ia-usage-preference"));
        } catch { /* Optional preference. */ }
      }} />
      Help improve this free tool
    </label>
    <p>Share usage counts, not your CV or contact details.</p>
  </div>;
}
