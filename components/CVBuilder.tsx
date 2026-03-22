"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useCVState } from "@/lib/state";
import { STEPS } from "@/lib/constants";
import { useLocale } from "@/lib/locale";
import LanguageToggle from "./shared/LanguageToggle";

import StepStart from "./steps/StepStart";
import StepTemplate from "./steps/StepTemplate";
import StepPersonal from "./steps/StepPersonal";
import StepSummary from "./steps/StepSummary";
import StepExperience from "./steps/StepExperience";
import StepEducation from "./steps/StepEducation";
import StepSkills from "./steps/StepSkills";
import StepExtras from "./steps/StepExtras";
import StepScore from "./steps/StepScore";

import CorporateTemplate from "./templates/Corporate";
import MinimalTemplate from "./templates/Minimal";
import GulfTemplate from "./templates/Gulf";
import CreativeTemplate from "./templates/Creative";
import SaveToast from "./shared/SaveToast";

/** Maps step keys from STEPS to i18n translation keys */
const STEP_I18N_KEY: Record<string, string> = {
  template: "step.template",
  personal: "step.personal",
  summary: "step.summary",
  experience: "step.experience",
  education: "step.education",
  skills: "step.skills",
  extras: "step.extras",
  score: "step.score",
};

const STEP_COMPONENTS = [
  StepStart,
  StepTemplate,
  StepPersonal,
  StepSummary,
  StepExperience,
  StepEducation,
  StepSkills,
  StepExtras,
  StepScore,
];

function TemplateRenderer({ state }: { state: ReturnType<typeof useCVState>["state"] }) {
  switch (state.template) {
    case "corp":
      return <CorporateTemplate state={state} />;
    case "min":
      return <MinimalTemplate state={state} />;
    case "gulf":
      return <GulfTemplate state={state} />;
    case "cre":
      return <CreativeTemplate state={state} />;
    default:
      return <CorporateTemplate state={state} />;
  }
}

export default function CVBuilder() {
  const { state, goToStep, nextStep, prevStep } = useCVState();
  const { t, dir, locale } = useLocale();
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [showPreview, setShowPreview] = useState(false);

  // Sync html dir/lang on mount & locale change
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [dir, locale]);

  const calculateScale = useCallback(() => {
    if (previewContainerRef.current) {
      const containerWidth = previewContainerRef.current.clientWidth;
      setScale(Math.min(containerWidth / 794, 1));
    }
  }, []);

  useEffect(() => {
    calculateScale();
    const observer = new ResizeObserver(calculateScale);
    if (previewContainerRef.current) {
      observer.observe(previewContainerRef.current);
    }
    return () => observer.disconnect();
  }, [calculateScale]);

  const CurrentStep = STEP_COMPONENTS[state.step] || StepStart;
  const isLastStep = state.step === 8;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold flex items-center gap-1.5">
              <span className="w-5 h-5 bg-[#d4a843] rotate-45 rounded-sm inline-block shrink-0" />
              <span className="text-[#d4a843] font-bold">Inspire</span>
              <span className="text-[#1a2744] font-bold -ml-1">Ambitions</span>
            </h1>
            <span className="bg-gold-500/10 text-gold-600 text-xs font-medium px-2 py-0.5 rounded-full hidden sm:inline">
              {t("header.cvBuilder")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden md:inline">
              {t("header.tagline")}
            </span>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {state.step > 0 && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center gap-1 overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
              {STEPS.slice(1).map((s) => (
                <button
                  key={s.index}
                  onClick={() => s.index <= state.step && goToStep(s.index)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                    s.index === state.step
                      ? "bg-gold-500 text-white font-medium"
                      : s.index < state.step
                      ? "bg-green-100 text-green-700 cursor-pointer hover:bg-green-200"
                      : "bg-gray-100 text-gray-400 cursor-default"
                  }`}
                  disabled={s.index > state.step}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      s.index === state.step
                        ? "bg-white/30 text-white"
                        : s.index < state.step
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-500"
                    }`}
                  >
                    {s.index < state.step ? "✓" : s.index}
                  </span>
                  <span className="hidden sm:inline">{STEP_I18N_KEY[s.key] ? t(STEP_I18N_KEY[s.key]) : s.label}</span>
                </button>
              ))}
            </div>
            {/* Progress line */}
            <div className="mt-2 h-1 bg-gray-200 rounded-full">
              <div
                className="h-1 bg-gold-500 rounded-full transition-all duration-300"
                style={{ width: `${(state.step / 8) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Form Panel */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 [&_input]:text-base [&_textarea]:text-base [&_select]:text-base">
              <CurrentStep />
            </div>

            {/* Navigation Buttons */}
            {state.step > 0 && (
              <div className="flex justify-between items-center">
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span>{dir === "rtl" ? "\u2192" : "\u2190"}</span> {t("nav.back")}
                </button>
                {!isLastStep && (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
                  >
                    {t("nav.next")} <span>{dir === "rtl" ? "\u2190" : "\u2192"}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Live Preview Panel — desktop sidebar */}
          {state.step > 0 && (
            <div className="w-[420px] shrink-0 hidden lg:block">
              <div className="sticky top-28">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("nav.preview")}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {scale < 1 ? `${Math.round(scale * 100)}% zoom` : "Full size"}
                  </span>
                </div>
                <div
                  ref={previewContainerRef}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  <div
                    data-preview-container
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                      width: "794px",
                      height: `${1123 * scale}px`,
                    }}
                  >
                    <TemplateRenderer state={state} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile preview FAB */}
      {state.step > 0 && (
        <button
          onClick={() => setShowPreview(true)}
          className="fixed bottom-6 right-6 bg-gold-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 lg:hidden"
          aria-label={t("nav.preview")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      )}

      {/* Mobile full-screen preview overlay */}
      {showPreview && state.step > 0 && (
        <div className="fixed inset-0 z-50 bg-gray-50 overflow-auto lg:hidden">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">{t("nav.preview")}</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-700"
            >
              &#10005; {t("nav.close")}
            </button>
          </div>
          <div className="p-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div
                data-preview-container
                style={{
                  transform: `scale(${Math.min((typeof window !== "undefined" ? window.innerWidth - 32 : 360) / 794, 1)})`,
                  transformOrigin: "top left",
                  width: "794px",
                  height: `${1123 * Math.min((typeof window !== "undefined" ? window.innerWidth - 32 : 360) / 794, 1)}px`,
                }}
              >
                <TemplateRenderer state={state} />
              </div>
            </div>
          </div>
        </div>
      )}

      <SaveToast />
    </div>
  );
}
