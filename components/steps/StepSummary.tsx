"use client";

import { useCVState } from "@/lib/state";
import { finishCV } from "@/lib/cv-finish";
import { useLocale } from "@/lib/locale";

export default function StepSummary() {
  const { state } = useCVState();
  const { t } = useLocale();
  const { cv } = finishCV(state);

  return (
    <div className="space-y-6" data-testid="summary-step">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{t("summary.title")}</h2>
        <p className="mt-1 text-sm text-gray-600">{t("summary.description")}</p>
      </div>
      <section aria-label={t("summary.builtProfile")} className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-900">
        <h3 className="font-semibold">{t("summary.builtProfile")}</h3>
        <p data-testid="built-profile" dir={cv.cvLanguage === "ar" ? "rtl" : "ltr"} lang={cv.cvLanguage} className="mt-2 break-words leading-relaxed">
          {cv.summary}
        </p>
        {!cv.summary && <p className="mt-2 text-ink-muted">{t("summary.profileMissing")}</p>}
      </section>
      {state.summary && <div>
        <label htmlFor="cv-profile-notes" className="block text-sm font-medium text-gray-900">{t("summary.savedNotes")}</label>
        <p id="cv-profile-notes-help" className="mt-1 text-sm text-gray-600">
          {t("summary.savedNotesHelp")}
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
