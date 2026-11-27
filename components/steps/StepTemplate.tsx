"use client";

import { useEffect, useState } from "react";
import { useCVState } from "@/lib/state";
import { useLocale } from "@/lib/locale";
import { TEMPLATE_INFO } from "@/lib/constants";
import type { TemplateType } from "@/lib/types";
import TemplatePreview from "@/components/templates/TemplatePreview";
import { recommendTemplateForTitle } from "@/lib/template-recommendation";

const photoRules: Record<TemplateType, string> = {
  "ats-clean": "design.photoHidden",
  classic: "design.photoOptional",
  site: "design.photoHidden",
  service: "design.photoProminent",
  care: "design.photoOptional",
  ledger: "design.photoHidden",
  crew: "design.photoProminent",
  stack: "design.photoHidden",
  move: "design.photoOptional",
  corner: "design.photoOptional",
};

export default function StepTemplate() {
  const { state, updateField } = useCVState();
  const { t } = useLocale();
  const [showAll, setShowAll] = useState(false);
  const recommendedKey = recommendTemplateForTitle(state.personal.title);

  useEffect(() => {
    if (!state.templateConfirmed && state.template !== recommendedKey) {
      updateField({ template: recommendedKey });
    }
  }, [recommendedKey, state.template, state.templateConfirmed, updateField]);
  const templates = [...TEMPLATE_INFO].sort((a, b) =>
    a.key === recommendedKey ? -1 : b.key === recommendedKey ? 1 : 0
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("design.heading")}
        </h2>
        <p className="mt-2 break-words text-gray-600">
          {t("design.recommendation", { title: state.personal.title || t("design.target") })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {templates.map((tpl, index) => {
          const selected = state.template === tpl.key;
          return (
            <button
              key={tpl.key}
              onClick={() => updateField({ template: tpl.key as TemplateType, templateConfirmed: true })}
              className={`${index > 0 && !showAll ? "hidden md:block" : "block"} relative overflow-hidden rounded-lg border bg-white text-start shadow-rest transition-all ${
                selected
                  ? "border-gold-600 ring-2 ring-gold-600 ring-offset-2"
                  : "border-gray-200 hover:-translate-y-0.5 hover:border-gold-600 hover:shadow-raised"
              }`}
              aria-pressed={selected}
            >
              <div className="h-[280px] overflow-hidden bg-gray-100 p-3">
                <div className="h-[390px] overflow-hidden border border-gray-200 shadow-rest">
                  <TemplatePreview template={tpl.key} />
                </div>
              </div>

              {(selected || tpl.key === recommendedKey) && (
                <div className="absolute inset-x-3 top-3 flex flex-row-reverse flex-wrap items-start justify-between gap-1.5">
                  {selected && (
                    <span className="rounded-full bg-gold-600 px-3 py-1 text-xs font-bold text-white shadow-raised">
                      {t("design.selected")}
                    </span>
                  )}
                  {tpl.key === recommendedKey && (
                    <span className="me-auto rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">
                      {t("design.recommended")}
                    </span>
                  )}
                </div>
              )}

              <div className="p-4">
                <h3 className="text-base font-semibold text-gray-900">
                  <bdi lang="en" dir="ltr">
                    {tpl.name}
                  </bdi>
                </h3>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                  {t(`design.description.${tpl.key}`)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase">
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-600">{t(photoRules[tpl.key])}</span>
                  <span className="rounded-full bg-green-50 px-2 py-1 text-green-800">{t("start.easyRead")}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {!showAll && (
        <button type="button" onClick={() => setShowAll(true)} className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-[#1a2744] md:hidden">
          {t("design.showAll")}
        </button>
      )}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <label className="text-sm font-semibold text-gray-900" htmlFor="cv-language">{t("design.documentLanguage")}</label>
        <p className="mt-1 text-xs text-gray-600" id="cv-language-help">{t("design.documentLanguageHelp")}</p>
        <select
          id="cv-language"
          aria-describedby="cv-language-help"
          value={state.cvLanguage}
          onChange={(event) => updateField({ cvLanguage: event.target.value as "en" | "ar" })}
          className="mt-3 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-base md:w-72"
        >
          <option value="en">{t("design.formatEnglish")}</option>
          <option value="ar">{t("design.formatArabic")}</option>
        </select>
      </div>
      <p className="text-center text-xs text-gray-500">{t("design.sameSample")}</p>

      {/* HR Tip */}
      <div className="bg-amber-50 border-s-4 border-amber-400 p-4 rounded-e-lg">
        <p className="font-semibold text-amber-800 text-sm">
          {t("design.tipTitle")}
        </p>
        <p className="mt-1 text-sm text-amber-900">
          {t("design.tip")}
        </p>
      </div>
    </div>
  );
}
