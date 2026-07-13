"use client";

import { useCVState } from "@/lib/state";
import { TEMPLATE_INFO } from "@/lib/constants";
import type { TemplateType } from "@/lib/types";
import TemplatePreview from "@/components/templates/TemplatePreview";

const photoRules: Record<TemplateType, string> = {
  classic: "Photo optional",
  site: "Photo optional",
  service: "Photo prominent",
  care: "Photo optional",
  ledger: "Photo optional",
  crew: "Photo prominent",
  stack: "Photo hidden",
  move: "Photo optional",
  corner: "Photo optional",
};

export default function StepTemplate() {
  const { state, updateField } = useCVState();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Choose how recruiters should read you
        </h2>
        <p className="mt-2 text-gray-600">
          Each direction changes hierarchy, density and regional emphasis, not just colour.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {TEMPLATE_INFO.map((tpl) => {
          const selected = state.template === tpl.key;
          return (
            <button
              key={tpl.key}
              onClick={() => updateField({ template: tpl.key as TemplateType })}
              className={`relative overflow-hidden rounded-lg border bg-white text-start shadow-rest transition-all ${
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
                <div className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-gold-600 shadow-raised">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              {/* Gulf region badge */}
              {tpl.key === "classic" && state.geo === "gulf" && (
                <span className="absolute top-3 start-3 bg-green-100 text-green-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Recommended for your region
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
          HR Specialist Tip
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
