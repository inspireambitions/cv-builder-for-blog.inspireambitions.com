"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCVState } from "@/lib/state";
import { STEPS } from "@/lib/constants";
import { useLocale } from "@/lib/locale";
import { createResumeLink } from "@/lib/resume-link";
import { trackToolEvent } from "@/lib/analytics";
import type { CVIssue } from "@/lib/cv-quality";
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
import { defaultTalkProgress, TALK_MODE_ENABLED } from "@/lib/talk-flow";

/** Maps step keys from STEPS to i18n translation keys */
const STEP_I18N_KEY: Record<(typeof STEPS)[number]["key"], string> = {
  start: "builder.nav.start",
  template: "step.template",
  personal: "step.personal",
  summary: "step.summary",
  experience: "step.experience",
  education: "step.education",
  skills: "step.skills",
  extras: "step.extras",
  score: "step.score",
};

// Keep the wordmark unchanged in every interface language.
const BRAND_WORDMARK = { first: "Inspire", second: "Ambitions" };
const RESUME_LINK_STATUS_KEY = {
  copying: "builder.link.copying",
  copied: "builder.link.copied",
  error: "builder.link.retry",
} as const;

const STEP_COMPONENTS = [
  StepStart,
  StepPersonal,
  StepExperience,
  StepEducation,
  StepSkills,
  StepSummary,
  StepTemplate,
  StepExtras,
];

function TemplateRenderer({ state }: { state: ReturnType<typeof useCVState>["state"] }) {
  if (state.template === "ats-clean") return <ATSCleanTemplate state={state} />;
  return <SectorTemplate state={state} />;
}

export default function CVBuilder({ initialUpload = false }: { initialUpload?: boolean }) {
  const {
    state,
    updateField,
    goToStep,
    nextStep,
    prevStep,
    resetState,
    restoredAt,
    dismissRestoreBanner,
    hydrated,
  } = useCVState();
  const { t, dir, locale } = useLocale();
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [mobileMode, setMobileMode] = useState<"edit" | "preview" | "score">("edit");
  const [returnToCheck, setReturnToCheck] = useState(false);
  const reviewFocus = useRef(false);
  const nextFix = useRef<CVIssue | null>(null);
  function fixIssue(issue: CVIssue) {
    nextFix.current = issue;
    setReturnToCheck(true);
    if (issue.step === 1) updateField({ mobilePersonalPage: 0 });
    setMobileMode("edit");
    goToStep(issue.step);
  }
  function returnToRecruiterCheck() {
    nextFix.current = null;
    reviewFocus.current = true;
    setReturnToCheck(false);
    setMobileMode("score");
    goToStep(8);
  }
  useEffect(() => {
    const issue = nextFix.current;
    const focusReview = reviewFocus.current && state.step === 8;
    if (!focusReview && (!issue?.field || issue.step !== state.step)) return;
    const focus = () => {
      const selector = focusReview ? "[data-recruiter-check-heading]" : "[data-cv-fix]";
      const element = Array.from(document.querySelectorAll<HTMLElement>(selector))
        .find((field) => (focusReview || field.dataset.cvFix === issue?.field) && field.getClientRects().length);
      if (!element) return false;
      element.focus({ preventScroll: true });
      element.scrollIntoView({ block: "center" });
      nextFix.current = null;
      reviewFocus.current = false;
      return true;
    };
    if (focus()) return;
    const observer = new MutationObserver(() => { if (focus()) observer.disconnect(); });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [state.step, state.mobilePersonalPage]);
  const [resumeLinkStatus, setResumeLinkStatus] = useState<
    "idle" | "copying" | "copied" | "error"
  >("idle");
  const resumeLinkStatusText = resumeLinkStatus === "idle" ? "" : t(RESUME_LINK_STATUS_KEY[resumeLinkStatus]);
  const displayLocale = locale === "tl" ? "fil" : locale;
  const started = useRef(false);
  useEffect(() => {
    if (!hydrated || state.step === 0) return;
    if (!started.current) {
      started.current = true;
      trackToolEvent("full_form_started", { lang: locale });
    }
    trackToolEvent("full_form_step_viewed", { stepKey: STEPS[state.step]?.key, lang: locale });
    if (state.step === 8) trackToolEvent("full_form_completed", { lang: locale });
  }, [hydrated, locale, state.step]);

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
      t("builder.draft.deleteConfirm")
    );
    if (!confirmed) return;
    resetState();
    setMobileMode("edit");
    setReturnToCheck(false);
    goToStep(1);
    trackToolEvent("cv_draft_deleted", { surface: "cv_builder_header" });
  }, [goToStep, resetState, t]);

  const handleStartFresh = useCallback(() => {
    resetState();
    setMobileMode("edit");
    setReturnToCheck(false);
    goToStep(1);
  }, [goToStep, resetState]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className={`max-w-7xl mx-auto px-4 py-3 flex items-center justify-between ${TALK_MODE_ENABLED ? "flex-wrap gap-3" : ""}`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://inspireambitions.com"
              dir="ltr"
              lang="en"
              data-testid="brand"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <span className="w-5 h-5 bg-[#806017] rotate-45 rounded-sm inline-block shrink-0" />
              <span className="text-[#6f5314] font-bold">{BRAND_WORDMARK.first}</span>
              <span className="text-[#1a2744] font-bold -ms-1">{BRAND_WORDMARK.second}</span>
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
                aria-label={t("builder.link.copyLabel")}
              >
                {resumeLinkStatusText || t("builder.link.continueElsewhere")}
              </button>
            )}
            {state.step > 0 && (
              <button
                type="button"
                onClick={handleDeleteDraft}
                className="hidden min-h-10 items-center rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 md:inline-flex"
              >
                {t("builder.draft.delete")}
              </button>
            )}
            <span className={state.step > 0 ? "hidden md:inline-flex" : "inline-flex"}><ThemeToggle /></span>
            {TALK_MODE_ENABLED && <button className="min-h-12 rounded-lg border border-gray-300 px-3 text-sm" onClick={() => updateField({ builderMode: "talk", talk: state.talk ?? defaultTalkProgress })}>{t("builder.simpleQuestions")}</button>}
            <LanguageToggle />
          </div>
        </div>
      </header>
      <p className="sr-only" role="status">
        {resumeLinkStatus === "error" ? t("builder.link.error") : resumeLinkStatusText}
      </p>

      {/* Restore banner */}
      {restoredAt && (
        <div className="border-b border-emerald-100 bg-emerald-50">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-sm text-emerald-950 sm:flex-row sm:items-center sm:justify-between">
            <p>
              {t("builder.draft.restored", {
                date: new Date(restoredAt).toLocaleString(locale === "en" ? undefined : displayLocale),
              })}
            </p>
            <p className="text-xs text-emerald-800 sm:ms-auto">
              {t("builder.draft.privateLink")}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={dismissRestoreBanner}
                className="rounded-lg bg-emerald-700 px-3 py-1.5 font-semibold text-white hover:bg-emerald-800"
              >
                {t("talk.continue")}
              </button>
              <button
                type="button"
                onClick={handleStartFresh}
                className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                {t("builder.draft.startFresh")}
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
                    {t("builder.progress", {
                      step: t(state.step === 1 ? "builder.personalStep" : STEP_I18N_KEY[currentStep.key]),
                      number: state.step === 1 ? state.mobilePersonalPage + 1 : state.step,
                      total: state.step === 1 ? 3 : 8,
                    })}
                  </p>
                  <p className="mt-0.5 text-xs text-[#697184]">
                    {t(state.step < 3 ? "builder.timeLeft" : state.step < 6 ? "builder.goodProgress" : "builder.nearlyFinished")}
                  </p>
                </div>
                <button type="button" onClick={() => setMobileMode(mobileMode === "preview" ? "edit" : "preview")} className="min-h-10 rounded-lg border border-[#d5c58d] bg-white px-3 text-xs font-bold text-[#806017]">
                  {t(mobileMode === "preview" ? "builder.backToEditing" : "builder.preview")}
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
                  <span className="hidden sm:inline">{t(STEP_I18N_KEY[s.key])}</span>
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
            {returnToCheck && !isLastStep && state.step > 0 && (
              <button type="button" onClick={returnToRecruiterCheck}
                className="mb-4 hidden min-h-12 items-center rounded-lg border border-gold-500 bg-white px-4 py-2 text-sm font-semibold text-ink sm:inline-flex">
                {t("builder.returnToCheck")}
              </button>
            )}
            <div className="mb-6 bg-transparent p-0 shadow-none sm:rounded-xl sm:border sm:border-gray-200 sm:bg-white sm:p-6 sm:shadow-sm [&_input]:text-base [&_textarea]:text-base [&_select]:text-base">
              {state.step === 8 ? <StepScore onFix={fixIssue} /> : state.step === 0 ? <StepStart initialUpload={initialUpload} /> : <CurrentStep />}
            </div>

            {state.step === 8 && (
              <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 sm:hidden">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-sm font-semibold text-emerald-950">
                      {t("builder.link.continueElsewhere")}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-800">
                      {t("builder.link.hint")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyResumeLink}
                    disabled={resumeLinkStatus === "copying"}
                    aria-label={t("builder.link.copyLabel")}
                    className="min-h-11 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
                  >
                    {resumeLinkStatusText || t("builder.link.copy")}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteDraft}
                    className="min-h-11 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
                  >
                    {t("builder.draft.deleteSaved")}
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
                    {scale < 1
                      ? t("builder.canvas.zoom", {
                        percent: new Intl.NumberFormat(displayLocale, { style: "percent", maximumFractionDigits: 0 }).format(scale),
                      })
                      : t("builder.canvas.fullSize")}
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
          <section className="lg:hidden" aria-label={t("builder.canvas.previewLabel")}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-gray-700">{t("nav.preview")}</h2>
              <span className="text-xs text-gray-500">{t("builder.canvas.pinch")}</span>
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
              {t("builder.canvas.export")}
            </button>
          </section>
        )}

        {state.step > 0 && state.step !== 8 && mobileMode === "score" && (
          <section className="lg:hidden" aria-label={t("builder.canvas.reviewLabel")}>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <StepScore onFix={fixIssue} />
            </div>
          </section>
        )}
      </div>

      {state.step > 0 && mobileMode === "edit" && !isLastStep && (
        <div className="mobile-action-bar fixed inset-x-0 bottom-0 z-30 px-4 pt-3 sm:hidden">
          <p className="mb-2 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-[#2f6b5e]"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />{t("builder.saved")}</p>
          <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleMobileBack}
            className="min-h-12 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700"
          >
            <span className="flex items-center gap-1.5"><ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />{t("nav.back")}</span>
          </button>
          <button
            type="button"
            onClick={returnToCheck ? returnToRecruiterCheck : handleMobileNext}
            className="min-h-12 flex-1 rounded-lg bg-gold-500 px-5 text-sm font-semibold text-white"
          >
            <span className="flex items-center justify-center gap-2">{t(returnToCheck ? "builder.returnToCheck" : "builder.saveContinue")}<ArrowRight className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden="true" /></span>
          </button>
          </div>
        </div>
      )}

      {/* Footer */}
      {state.step > 0 ? <footer className="py-8 text-center text-sm text-ink-muted"><a href="https://inspireambitions.com/career-tools/" className="underline">{t("builder.moreTools")}</a></footer> : <footer className="bg-gray-900 text-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <a
                href="https://inspireambitions.com"
                dir="ltr"
                lang="en"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center gap-1.5 hover:opacity-80 transition-opacity"
              >
                <span className="w-4 h-4 bg-[#806017] rotate-45 rounded-sm inline-block shrink-0" />
                <span className="text-[#d7bd78] font-bold text-lg">{BRAND_WORDMARK.first}</span>
                <span className="text-white font-bold text-lg -ms-1">{BRAND_WORDMARK.second}</span>
              </a>
              <p className="text-sm text-gray-300 leading-relaxed">
                {t("builder.footer.description")}
              </p>
            </div>

            {/* Career Tools */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wide">{t("builder.footer.tools")}</h4>
              <ul className="space-y-2">
                <li><Link href="/why-free" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">{t("builder.footer.whyFree")}</Link></li>
                <li><Link href="/vs/zety" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">{t("builder.footer.compare")}</Link></li>
                <li>
                  <a href="https://inspireambitions.com/career-tools/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">
                    {t("builder.moreTools")}
                  </a>
                </li>
                <li>
                  <a href="https://inspireambitions.com/should-i-take-this-dubai-job/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">
                    {t("builder.footer.dubaiJob")}
                  </a>
                </li>
                <li>
                  <a href="https://inspireambitions.com/dubai-internship-eligibility-checker/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">
                    {t("builder.footer.internship")}
                  </a>
                </li>
                <li>
                  <a href="https://inspireambitions.com/uae-salary-benchmarking-tool/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">
                    {t("builder.footer.salary")}
                  </a>
                </li>
                <li>
                  <a href="https://inspireambitions.com/uae-resignation-letter-generator/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">
                    {t("builder.footer.resignation")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wide">{t("builder.footer.quickLinks")}</h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://inspireambitions.com/career-tools/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">
                    {t("builder.footer.allTools")}
                  </a>
                </li>
                <li>
                  <a href="https://inspireambitions.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center py-1.5 text-sm hover:text-white transition-colors">
                    {t("builder.footer.blog")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-xs text-gray-400">
              {t("builder.footer.copyright", { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </footer>}

      <SaveToast />
    </div>
  );
}
