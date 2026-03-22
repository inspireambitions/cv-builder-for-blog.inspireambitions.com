"use client";

import { useCVState } from "@/lib/state";
import { TEMPLATE_INFO } from "@/lib/constants";
import type { TemplateType } from "@/lib/types";

export default function StepTemplate() {
  const { state, updateField } = useCVState();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Choose Your Template
        </h2>
        <p className="mt-2 text-gray-600">
          Select a layout that fits your industry and target market
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TEMPLATE_INFO.map((tpl) => {
          const selected = state.template === tpl.key;
          return (
            <button
              key={tpl.key}
              onClick={() => updateField({ template: tpl.key as TemplateType })}
              className={`relative bg-white rounded-xl shadow-sm border overflow-hidden text-left transition-all cursor-pointer ${
                selected
                  ? "ring-2 ring-gold-500 border-gold-500"
                  : "border-gray-200 hover:shadow-md"
              }`}
            >
              {/* Color strip */}
              <div className={`h-[100px] w-full ${tpl.color}`} />

              {/* Checkmark */}
              {selected && (
                <div className="absolute top-3 right-3 w-7 h-7 bg-gold-500 rounded-full flex items-center justify-center">
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
              {tpl.key === "gulf" && state.geo === "gulf" && (
                <span className="absolute top-3 left-3 bg-green-100 text-green-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Recommended for your region
                </span>
              )}

              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  {tpl.name}
                </h3>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                  {tpl.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* HR Tip */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
        <p className="font-semibold text-amber-800 text-sm">
          HR Director Tip
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
