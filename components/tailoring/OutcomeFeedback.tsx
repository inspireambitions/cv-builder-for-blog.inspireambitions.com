"use client";

import { useState } from "react";
import { trackToolEvent } from "@/lib/analytics";

const OUTCOMES = ["Applied", "Interview", "No response", "Rejected", "Offer"] as const;

export default function OutcomeFeedback() {
  const [selected, setSelected] = useState<string | null>(null);

  function record(outcome: string) {
    setSelected(outcome);
    const key = "ia-cv-outcomes";
    const existing = JSON.parse(localStorage.getItem(key) || "[]") as Array<Record<string, string>>;
    existing.push({ outcome, recordedAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(existing.slice(-50)));
    trackToolEvent("cv_application_outcome", {
      surface: "score_workspace",
      format: outcome.toLowerCase().replace(/\s+/g, "_"),
    });
  }

  return (
    <div className="border-t border-gray-200 pt-6">
      <h4 className="text-sm font-bold text-gray-950">What happened with this application?</h4>
      <p className="mt-1 text-xs leading-5 text-gray-500">Stored only in this browser. No CV content is sent with this feedback.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {OUTCOMES.map((outcome) => (
          <button key={outcome} type="button" onClick={() => record(outcome)} className={`min-h-10 border px-3 text-xs font-semibold ${selected === outcome ? "border-emerald-700 bg-emerald-700 text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>{outcome}</button>
        ))}
      </div>
    </div>
  );
}
