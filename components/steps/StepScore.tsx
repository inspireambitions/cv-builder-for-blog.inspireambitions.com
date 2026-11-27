"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCVState } from "@/lib/state";
import { calculateScore } from "@/lib/score";
import { checkCV, reviewIssueLabel, type CVIssue } from "@/lib/cv-quality";
import { useLocale } from "@/lib/locale";
import { scoreDisplayText } from "@/lib/locales/score-controls";
import { finishCV } from "@/lib/cv-finish";
import type { ScoreLayer } from "@/lib/types";
import DownloadModal from "@/components/modals/DownloadModal";
import TailorWorkspace from "@/components/tailoring/TailorWorkspace";
import { trackToolEvent } from "@/lib/analytics";
import FinishDetails from "@/components/shared/FinishDetails";

// SVG ring constants
const SIZE = 160;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getScoreColor(total: number): string {
  if (total >= 75) return "#22c55e";
  if (total >= 50) return "#f59e0b";
  return "#ef4444";
}

function getLevelDot(level: "green" | "amber" | "red"): string {
  if (level === "green") return "bg-green-500";
  if (level === "amber") return "bg-amber-500";
  return "bg-red-500";
}

function getLayerColor(label: string): string {
  switch (label) {
    case "Completeness":
      return "bg-blue-500";
    case "Content Quality":
      return "bg-purple-500";
    case "Gulf Readiness":
      return "bg-amber-500";
    case "Computer readability":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

function LayerCard({ layer }: { layer: ScoreLayer }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(layer.score < layer.max);
  const pct = Math.round((layer.score / layer.max) * 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-5 text-start transition-colors hover:bg-gray-50"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className={`h-3 w-3 shrink-0 rounded-full ${getLayerColor(layer.label)}`}
          />
          <span className="break-words text-sm font-semibold text-gray-900">
            {scoreDisplayText(layer.label, t)}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div aria-hidden="true" className="h-2 w-8 rounded-full bg-gray-200 sm:w-16 lg:w-24">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                pct >= 75
                  ? "bg-green-500"
                  : pct >= 40
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <bdi dir="ltr" className="text-end text-sm font-medium text-gray-700">
            {layer.score}/{layer.max}
          </bdi>
          <svg
            aria-hidden="true"
            className={`w-4 h-4 text-gray-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-4 space-y-2">
          {layer.criteria.map((c) => (
            <div key={c.label} className="py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 shrink-0 rounded-full ${getLevelDot(c.level)}`}
                  />
                  <span className="break-words text-sm text-gray-700">{scoreDisplayText(c.label, t)}</span>
                </div>
                <bdi dir="ltr" className="shrink-0 text-sm font-medium text-gray-900">
                  {c.score}/{c.max}
                </bdi>
              </div>
              {c.tip && c.level !== "green" && (
                <p className="text-xs text-gray-500 mt-1 ms-4">{scoreDisplayText(c.tip, t)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StepScore({ onFix }: { onFix: (issue: CVIssue) => void }) {
  const { state } = useCVState();
  const { t } = useLocale();
  const { score, issues } = useMemo(() => {
    const { cv } = finishCV(state);
    return { score: calculateScore(cv), issues: checkCV(cv) };
  }, [state]);
  const basicMissing = issues.filter((issue) => issue.basic).length;
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const completionTracked = useRef(false);

  const scoreBand = score.total >= 75 ? "strong" : score.total >= 50 ? "developing" : "needs_work";
  const resultArticle = score.total >= 75
    ? { title: t("review.articleStrong"), url: "https://inspireambitions.com/interview-prep/" }
    : score.total >= 50
      ? { title: t("review.articleDeveloping"), url: "https://inspireambitions.com/jargon-vs-plain-language-cv-2026/" }
      : { title: t("review.articleNeedsWork"), url: "https://inspireambitions.com/hiring-manager-eye-tracking-cv-2026/" };

  useEffect(() => {
    if (completionTracked.current) return;
    completionTracked.current = true;
    trackToolEvent("tool_completed", { surface: "cv_score", scoreBand });
  }, [scoreBand]);

  const dashOffset =
    CIRCUMFERENCE - (score.total / score.max) * CIRCUMFERENCE;
  const color = getScoreColor(score.total);

  const isGulf = state.geo === "gulf";

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#d8c895] bg-[#faf7ee] p-6 text-center sm:p-8">
        <p className="text-sm font-bold text-[#2f6b5e]">{t("review.saved")}</p>
        <h1 tabIndex={-1} data-recruiter-check-heading className="mt-2 text-3xl font-bold text-ink">
          {t(issues.length === 1 ? "review.one" : issues.length ? "review.many" : "review.ready", { count: issues.length })}
        </h1>
        {issues.length > 0 && <ul className="mx-auto mt-4 max-w-xl divide-y divide-[#e7ddc6] text-start">
          {issues.map((issue) => <li key={issue.id} className="flex items-center justify-between gap-3 py-1 text-sm text-ink">
            <p>{reviewIssueLabel(issue, t)}</p>
            <button type="button" onClick={() => onFix(issue)} aria-label={t("review.fixSpecific", { issue: reviewIssueLabel(issue, t) })}
              className="min-h-12 shrink-0 rounded-lg px-3 font-semibold text-accent underline focus-visible:outline-2 focus-visible:outline-accent">{t("review.fix")}</button>
          </li>)}
        </ul>}
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#586174]">
          {t(issues.length ? "export.stillDownload" : "review.readyHelp")}
        </p>
        <button
          type="button"
          onClick={() => setShowDownloadModal(true)}
          className="mt-6 min-h-12 w-full rounded-xl bg-[#806017] px-6 text-base font-bold text-white transition-colors hover:bg-[#6f5314] sm:w-auto"
        >
          {t("review.download")}
        </button>
      </section>

      <FinishDetails draft={state} />

      <details className="rounded-2xl border border-gray-200 bg-white p-5">
        <summary className="cursor-pointer text-base font-bold text-[#1a2744]">
          {t("review.improve")}
        </summary>
        <div className="mt-6 space-y-8">
          <div className="flex flex-col items-center">
            <div className="relative" style={{ width: SIZE, height: SIZE }}>
              <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden="true">
                <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth={STROKE} />
                <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset} className="transition-all duration-700 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">{score.total}</span>
                <span className="text-sm text-gray-500">{t("review.outOf100")}</span>
              </div>
            </div>
            <p className="mt-3 max-w-sm text-center text-xs leading-5 text-gray-500">
              {t("review.checklistNote")}
            </p>
          </div>

          {score.topTips.length > 0 && (
            <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-sm font-bold text-amber-950">{t("review.nextFixes")}</h2>
              <ol className="space-y-2">
                {score.topTips.map((tip, index) => (
                  <li key={tip} className="flex gap-2 text-sm leading-5 text-amber-900">
                    <span className="font-bold">{index + 1}.</span><span>{scoreDisplayText(tip, t)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-900">{t("review.detailedChecks")}</h2>
            <LayerCard layer={score.layers.completeness} />
            <LayerCard layer={score.layers.contentQuality} />
            {isGulf && <LayerCard layer={score.layers.gulfSpecific} />}
            <LayerCard layer={score.layers.atsFormatting} />
          </div>
        </div>
      </details>

      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        basicMissing={basicMissing}
      />

      <TailorWorkspace />

      <aside className="rounded-2xl border border-[#d8c895] bg-[#faf7ee] p-6" aria-labelledby="cv-next-step-title">
        <p className="text-xs font-bold uppercase tracking-wider text-[#2f6b5e]">{t("review.nextStep")}</p>
        <h2 id="cv-next-step-title" className="mt-2 text-xl font-bold text-[#1a2744]">{t("review.prepare")}</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a
            href={resultArticle.url}
            onClick={() => trackToolEvent("result_article_clicked", { surface: "cv_score", destination: resultArticle.url, journey: "applications", scoreBand })}
            className="min-h-12 rounded-xl border border-[#806017] px-5 py-3 text-center font-semibold text-[#806017]"
          >
            {resultArticle.title}
          </a>
          <a
            href="https://tools.inspireambitions.com/interview-question-bank/"
            onClick={() => trackToolEvent("next_tool_clicked", { surface: "cv_score", destination: "interview_question_bank", journey: "applications", scoreBand })}
            className="min-h-12 rounded-xl bg-[#806017] px-5 py-3 text-center font-semibold text-white"
          >
            {t("review.questionBank")}
          </a>
        </div>
      </aside>
    </div>
  );
}
