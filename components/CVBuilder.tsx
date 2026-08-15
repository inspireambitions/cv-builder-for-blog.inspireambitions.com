"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCVState } from "@/lib/state";
import { STEPS } from "@/lib/constants";
import { useLocale } from "@/lib/locale";
import { createResumeLink } from "@/lib/resume-link";
import { trackToolEvent } from "@/lib/analytics";
import LanguageToggle from "./shared/LanguageToggle";
import ThemeToggle from "./shared/ThemeToggle";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

const StepStart = dynamic(() => import("./steps/StepStart"));
const StepTemplate = dynamic(() => import("./steps/StepTemplate"));
const StepPersonal = dynamic(() => import("./steps/StepPersonal"));
const StepSummary = dynamic(() => import("./steps/StepSummary"));
const StepExperience = dynamic(() => import("./steps/StepExperience"));
const StepEducation = dynamic(() => import("./steps/StepEducation"));
const StepSkills = dynamic(() => import("./steps/StepSkills"));
const StepExtras = dynamic(() => import("./steps/StepExtras"));
const StepScore = dynamic(() => import("./steps/StepScore"));

const SectorTemplate = dynamic(() => import("./templates/SectorTemplate"));
const ATSCleanTemplate = dynamic(() => import("./templates/ATSCleanTemplate"));
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
  StepPersonal,
  StepSummary,
  StepExperience,
  StepEducation,
  StepSkills,
  StepTemplate,
  StepExtras,
  StepScore,
];

function TemplateRenderer({ state }: { state: ReturnType<typeof useCVState>["state"] }) {
  if (state.template === "ats-clean") return <ATSCleanTemplate state={state} />;
  return <SectorTemplate state={state} />;
}

export default function CVBuilder() {
  const {
    state,
    updateField,
    goToStep,
    nextStep,
    prevStep,
    resetState,
    restoredAt,
    dismissRestoreBanner,
  } = useCVState();
  const { t, dir, locale } = useLocale();
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [mobileMode, setMobileMode] = useState<"edit" | "preview" | "score">("edit");
  const [resumeLinkStatus, setResumeLinkStatus] = useState<
    "idle" | "copying" | "copied" | "error"
  >("idle");

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
  const currentStep = STEPS[state.step];
  const mobileProgress = state.step === 1
    ? ((state.mobilePersonalPage + 1) / 3) * 12.5
    : (state.step / 8) * 100;

  const handleMobileBack = () => {
    if (state.step === 1 && state.mobilePersonalPage > 0) {
      updateField({ mobilePersonalPage: state.mobilePersonalPage - 1 });
      return;
    }
    setMobileMode("edit");
    prevStep();
  };

  const handleMobileNext = () => {
    if (state.step === 1 && state.mobilePersonalPage < 2) {
      updateField({ mobilePersonalPage: state.mobilePersonalPage + 1 });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (isLastStep) setMobileMode("score");
    else nextStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopyResumeLink = useCallback(async () => {
    setResumeLinkStatus("copying");
    try {
      const link = await createResumeLink(state);
      await navigator.clipboard.writeText(link);
      setResumeLinkStatus("copied");
      trackToolEvent("cv_resume_link_copied", { surface: "cv_builder_header" });
      window.setTimeout(() => setResumeLinkStatus("idle"), 2500);
    } catch {
      setResumeLinkStatus("error");
      trackToolEvent("cv_resume_link_failed", { surface: "cv_builder_header" });
      window.setTimeout(() => setResumeLinkStatus("idle"), 3500);
    }
  }, [state]);

  const handleDeleteDraft = useCallback(() => {
    const confirmed = window.confirm(
      "Delete this saved CV draft from this browser? This cannot be undone."
    );
    if (!confirmed) return;
    resetState();
    setMobileMode("edit");
    goToStep(1);
    trackToolEvent("cv_draft_deleted", { surface: "cv_builder_header" });
  }, [goToStep, resetState]);

  const handleStartFresh = useCallback(() => {
    resetState();
    setMobileMode("edit");
    goToStep(1);
  }, [goToStep, resetState]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://inspireambitions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <span className="w-5 h-5 bg-[#806017] rotate-45 rounded-sm inline-block shrink-0" />
              <span className="text-[#6f5314] font-bold">Inspire</span>
              <span className="text-[#1a2744] font-bold -ms-1">Ambitions</span>
            </a>
            <span className="bg-gold-500/10 text-gold-600 text-xs font-medium px-2 py-0.5 rounded-full hidden sm:inline">
              {t("header.cvBuilder")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 hidden md:inline">
              {t("header.tagline")}
            </span>
            {state.step > 0 && (
              <button
                type="button"
                onClick={handleCopyResumeLink}
                disabled={resumeLinkStatus === "copying"}
                className="hidden min-h-10 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-60 sm:inline-flex"
                aria-label="Copy private resume link"
              >
                {resumeLinkStatus === "copying"
                  ? "Saving..."
                  : resumeLinkStatus === "copied"
                  ? "Link copied"
                  : resumeLinkStatus === "error"
                  ? "Try again"
                  : "Resume link"}
              </button>
            )}
            {state.step > 0 && (
              <button
                type="button"
                onClick={handleDeleteDraft}
                className="hidden min-h-10 items-center rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 md:inline-flex"
              >
                Delete draft
              </button>
            )}
            <span className="hidden sm:inline-flex"><ThemeToggle /></span>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Restore banner */}
      {restoredAt && (
        <div className="border-b border-emerald-100 bg-emerald-50">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-sm text-emerald-950 sm:flex-row sm:items-center sm:justify-between">
            <p>
              We restored your CV from{" "}
              {new Date(restoredAt).toLocaleString()}.
            </p>
            <p className="text-xs text-emerald-800 sm:ms-auto">
              Autosave is active. Resume links are encrypted in the private URL fragment and never sent to our server.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={dismissRestoreBanner}
                className="rounded-lg bg-emerald-700 px-3 py-1.5 font-semibold text-white hover:bg-emerald-800"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={handleStartFresh}
                className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                Start fresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {state.step > 0 && (
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:py-2">
            <div className="sm:hidden">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-[#1a2744]">
                    {state.step === 1
                      ? `Personal details • ${state.mobilePersonalPage + 1} of 3`
                      : `${currentStep?.label} • ${state.step} of 8`}
                  </p>
                  <p className="mt-0.5 text-xs text-[#697184]">
                    {state.step < 3 ? "About 6 minutes left" : state.step < 6 ? "You are making good progress" : "Nearly finished"}
                  </p>
                </div>
                <button type="button" onClick={() => setMobileMode(mobileMode === "preview" ? "edit" : "preview")} className="min-h-10 rounded-lg border border-[#d5c58d] bg-white px-3 text-xs font-bold text-[#806017]">
                  {mobileMode === "preview" ? "Back to editing" : "Preview CV"}
                </button>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#ece8dc]">
                <div className="h-full rounded-full bg-[#806017] transition-all" style={{ width: `${mobileProgress}%` }} />
              </div>
            </div>
            <div className="hidden items-center gap-1 overflow-x-auto sm:flex" style={{ WebkitOverflowScrolling: "touch" }}>
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
            <div className="mt-2 hidden h-1 rounded-full bg-gray-200 sm:block">
              <div
                className="h-1 bg-gold-500 rounded-full transition-all duration-300"
                style={{ width: `${(state.step / 8) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:py-6 sm:pb-6">
        <div className="flex gap-6">
          {/* Form Panel */}
          <div className={`flex-1 min-w-0 ${mobileMode === "edit" || (mobileMode === "score" && state.step === 8) ? "block" : "hidden lg:block"}`}>
            <div className="mb-6 bg-transparent p-0 shadow-none sm:rounded-xl sm:border sm:border-gray-200 sm:bg-white sm:p-6 sm:shadow-sm [&_input]:text-base [&_textarea]:text-base [&_select]:text-base">
              <CurrentStep />
            </div>

            {state.step === 8 && (
              <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 sm:hidden">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-sm font-semibold text-emerald-950">
                      Continue on another device
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-800">
                      Copy an encrypted resume link. The private CV data stays in the URL fragment, not server logs.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyResumeLink}
                    disabled={resumeLinkStatus === "copying"}
                    aria-label="Copy private resume link"
                    className="min-h-11 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
                  >
                    {resumeLinkStatus === "copying"
                      ? "Saving..."
                      : resumeLinkStatus === "copied"
                      ? "Link copied"
                      : resumeLinkStatus === "error"
                      ? "Try again"
                      : "Copy Resume Link"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteDraft}
                    className="min-h-11 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
                  >
                    Delete saved draft
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {state.step > 0 && (
              <div className="hidden justify-between items-center sm:flex">
                <button
                  onClick={() => { setMobileMode("edit"); prevStep(); }}
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
                  className="paper-surface bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  <div
                    data-preview-container
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: dir === "rtl" ? "top right" : "top left",
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

        {state.step > 0 && mobileMode === "preview" && (
          <section className="lg:hidden" aria-label="CV preview">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">{t("nav.preview")}</h2>
              <span className="text-xs text-gray-500">Pinch to zoom</span>
            </div>
            <div className="paper-surface overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg touch-pinch-zoom">
              <div
                data-preview-container
                style={{
                  transform: `scale(${Math.min((typeof window !== "undefined" ? window.innerWidth - 32 : 360) / 794, 1)})`,
                  transformOrigin: dir === "rtl" ? "top right" : "top left",
                  width: "794px",
                  height: `${1123 * Math.min((typeof window !== "undefined" ? window.innerWidth - 32 : 360) / 794, 1)}px`,
                }}
              >
                <TemplateRenderer state={state} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => { goToStep(8); setMobileMode("score"); }}
              className="fixed end-4 z-30 min-h-12 rounded-full bg-gold-500 px-5 font-semibold text-white shadow-lg"
              style={{ bottom: "calc(16px + var(--ia-safe-bottom))" }}
            >
              Export
            </button>
          </section>
        )}

        {state.step > 0 && state.step !== 8 && mobileMode === "score" && (
          <section className="lg:hidden" aria-label="CV score and export">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <StepScore />
            </div>
          </section>
        )}
      </div>

      {state.step > 0 && mobileMode === "edit" && !isLastStep && (
        <div className="mobile-action-bar fixed inset-x-0 bottom-0 z-30 px-4 pt-3 sm:hidden">
          <p className="mb-2 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-[#2f6b5e]"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Saved on this device</p>
          <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleMobileBack}
            className="min-h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700"
          >
            <span className="flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" aria-hidden="true" />{t("nav.back")}</span>
          </button>
          <button
            type="button"
            onClick={handleMobileNext}
            className="min-h-11 flex-1 rounded-lg bg-gold-500 px-5 text-sm font-semibold text-white"
          >
            <span className="flex items-center justify-center gap-2">Save and continue<ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
          </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <a
                href="https://inspireambitions.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              >
                <span className="w-4 h-4 bg-[#806017] rotate-45 rounded-sm inline-block shrink-0" />
                <span className="text-[#d7bd78] font-bold text-lg">Inspire</span>
                <span className="text-white font-bold text-lg -ms-1">Ambitions</span>
              </a>
              <p className="text-sm text-gray-300 leading-relaxed">
                Free career tools built by an HR Career Specialist with 20+ years of GCC experience.
              </p>
            </div>

            {/* Career Tools */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wide">Career Tools</h4>
              <ul className="space-y-2">
                <li><Link href="/why-free" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">Why it is free</Link></li>
                <li><Link href="/vs/zety" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">Compare CV builders</Link></li>
                <li>
                  <a href="https://inspireambitions.com/career-tools/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">
                    More free career tools
                  </a>
                </li>
                <li>
                  <a href="https://inspireambitions.com/should-i-take-this-dubai-job/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">
                    Should I Take This Dubai Job?
                  </a>
                </li>
                <li>
                  <a href="https://inspireambitions.com/dubai-internship-eligibility-checker/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">
                    Dubai Internship Eligibility Checker
                  </a>
                </li>
                <li>
                  <a href="https://inspireambitions.com/uae-salary-benchmarking-tool/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">
                    UAE Salary Benchmarking Tool
                  </a>
                </li>
                <li>
                  <a href="https://inspireambitions.com/uae-resignation-letter-generator/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">
                    UAE Resignation Letter Generator
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://inspireambitions.com/career-tools/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">
                    All Career Tools
                  </a>
                </li>
                <li>
                  <a href="https://inspireambitions.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">
                    Blog &amp; Articles
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} InspireAmbitions.com. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <SaveToast />
    </div>
  );
}
