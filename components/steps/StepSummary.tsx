"use client";

import { useCVState } from "@/lib/state";
import { finishCV } from "@/lib/cv-finish";

export default function StepSummary() {
  const { state } = useCVState();
  const { cv } = finishCV(state);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">About you (2 to 3 lines)</h2>
        <p className="mt-1 text-sm text-gray-600">Your CV uses your work history, skills and languages to write this section.</p>
      </div>
      <section aria-label="Profile on your CV" className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-900">
        <h3 className="font-semibold">Profile on your CV</h3>
        <p data-testid="built-profile" dir={cv.cvLanguage === "ar" ? "rtl" : "ltr"} lang={cv.cvLanguage} className="mt-2 break-words leading-relaxed">
          {cv.summary || "Add a role or a skill to build your profile."}
        </p>
      </section>
      {state.summary && <div>
        <label htmlFor="cv-profile-notes" className="block text-sm font-medium text-gray-900">Saved profile notes</label>
        <p id="cv-profile-notes-help" className="mt-1 text-sm text-gray-600">
          These notes stay in your draft. To add facts to your CV, use the work, skills or language fields.
        </p>
        <textarea
          id="cv-profile-notes"
          aria-describedby="cv-profile-notes-help"
          dir="auto"
          readOnly
          value={state.summary}
          rows={3}
          className="mt-2 w-full resize-y rounded-lg border border-gray-300 px-4 py-2.5 text-base"
        />
      </div>}
    </div>
  );
}
