"use client";

import { useEffect, useState } from "react";
import { useCVState } from "@/lib/state";
import { TEMPLATE_INFO } from "@/lib/constants";
import type { TemplateType } from "@/lib/types";
import TemplatePreview from "@/components/templates/TemplatePreview";
import { recommendTemplateForTitle } from "@/lib/template-recommendation";

const photoRules: Record<TemplateType, string> = {
  classic: "Photo optional",
  site: "Photo hidden",
  service: "Photo prominent",
  care: "Photo optional",
  ledger: "Photo hidden",
  crew: "Photo prominent",
  stack: "Photo hidden",
  move: "Photo optional",
  corner: "Photo optional",
};

export default function StepTemplate() {
  const { state, updateField } = useCVState();
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
          Choose your CV design
        </h2>
        <p className="mt-2 text-gray-600">
          We recommend a clear layout for {state.personal.title || "your target job"}. You can change it at any time.
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

              {/* Checkmark */}
              {selected && (
                <span className="absolute end-3 top-3 rounded-full bg-gold-600 px-3 py-1 text-xs font-bold text-white shadow-raised">Selected</span>
              )}

              {/* Gulf region badge */}
              {tpl.key === recommendedKey && (
                <span className="absolute top-3 start-3 bg-green-100 text-green-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Recommended for your target job
                </span>
              )}

              <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900">
                  {tpl.name}
                </h3>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                  {tpl.desc}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase">
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-600">{photoRules[tpl.key]}</span>
                  <span className="rounded-full bg-green-50 px-2 py-1 text-green-800">ATS-safe</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {!showAll && (
        <button type="button" onClick={() => setShowAll(true)} className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-[#1a2744] md:hidden">
          See all CV designs
        </button>
      )}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <label className="text-sm font-semibold text-gray-900" htmlFor="cv-language">CV document language</label>
        <p className="mt-1 text-xs text-gray-600">This changes headings and layout direction. Your own content stays unchanged.</p>
        <select
          id="cv-language"
          value={state.cvLanguage}
          onChange={(event) => updateField({ cvLanguage: event.target.value as "en" | "ar" })}
          className="mt-3 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-base md:w-72"
        >
          <option value="en">English, left to right</option>
          <option value="ar">العربية، من اليمين إلى اليسار</option>
        </select>
      </div>
      <p className="text-center text-xs text-gray-500">The same sample data is used in every preview for a fair comparison.</p>

      {/* HR Tip */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
        <p className="font-semibold text-amber-800 text-sm">
          HR Career Specialist Tip
        </p>
        <p className="mt-1 text-sm text-amber-900">
          In the Gulf/MENA region, including a professional photo on your CV is
          standard practice. In Europe and North America, it&apos;s generally
          discouraged. Choose a template that matches your target market.
        </p>
      </div>
    </div>
  );
}
