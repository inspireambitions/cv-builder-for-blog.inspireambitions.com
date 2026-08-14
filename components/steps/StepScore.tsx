"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCVState } from "@/lib/state";
import { calculateScore } from "@/lib/score";
import type { ScoreLayer } from "@/lib/types";
import DownloadModal from "@/components/modals/DownloadModal";
import TailorWorkspace from "@/components/tailoring/TailorWorkspace";
import { trackToolEvent } from "@/lib/analytics";

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
    case "ATS & Formatting":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

function LayerCard({ layer }: { layer: ScoreLayer }) {
  const [open, setOpen] = useState(layer.score < layer.max);
  const pct = Math.round((layer.score / layer.max) * 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-3 h-3 rounded-full ${getLayerColor(layer.label)}`}
          />
          <span className="text-sm font-semibold text-gray-900">
            {layer.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 bg-gray-200 rounded-full h-2">
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
          <span className="text-sm font-medium text-gray-700 w-16 text-end">
            {layer.score}/{layer.max}
          </span>
          <svg
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${getLevelDot(c.level)}`}
                  />
                  <span className="text-sm text-gray-700">{c.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {c.score}/{c.max}
                </span>
              </div>
              {c.tip && c.level !== "green" && (
                <p className="text-xs text-gray-500 mt-1 ms-4">{c.tip}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StepScore() {
  const { state } = useCVState();
  const score = useMemo(() => calculateScore(state), [state]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const completionTracked = useRef(false);

  const scoreBand = score.total >= 75 ? "strong" : score.total >= 50 ? "developing" : "needs_work";
  const resultArticle = score.total >= 75
    ? { title: "Prepare for your interview", url: "https://inspireambitions.com/interview-prep/" }
    : score.total >= 50
      ? { title: "Replace CV jargon with clear evidence", url: "https://inspireambitions.com/jargon-vs-plain-language-cv-2026/" }
      : { title: "See how hiring managers scan a CV", url: "https://inspireambitions.com/hiring-manager-eye-tracking-cv-2026/" };

  useEffect(() => {
    if (completionTracked.current) return;
    completionTracked.current = true;
    trackToolEvent("tool_completed", { surface: "cv_score" });
  }, [scoreBand]);

  const dashOffset =
    CIRCUMFERENCE - (score.total / score.max) * CIRCUMFERENCE;
  const color = getScoreColor(score.total);

  const isGulf = state.geo === "gulf";

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#d8c895] bg-[#faf7ee] p-6 text-center sm:p-8">
        <p className="text-sm font-bold text-[#2f6b5e]">Your work is saved</p>
        <h1 className="mt-2 text-3xl font-bold text-[#1a2744]">Your CV is ready to review</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#586174]">
          Preview it, then download a clean PDF, an editable Word file or a quick JPEG. There is no card and no watermark.
        </p>
        <button
          type="button"
          onClick={() => setShowDownloadModal(true)}
          className="mt-6 min-h-12 w-full rounded-xl bg-[#806017] px-6 text-base font-bold text-white transition-colors hover:bg-[#6f5314] sm:w-auto"
        >
          Download my CV
        </button>
      </section>

      <details className="rounded-2xl border border-gray-200 bg-white p-5">
        <summary className="cursor-pointer text-base font-bold text-[#1a2744]">
          Check and improve my CV
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
                <span className="text-sm text-gray-500">out of 100</span>
              </div>
            </div>
            <p className="mt-3 max-w-sm text-center text-xs leading-5 text-gray-500">
              This is a writing checklist, not a promise that an employer or recruitment system will accept your CV.
            </p>
          </div>

          {score.topTips.length > 0 && (
            <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-sm font-bold text-amber-950">Good next fixes</h2>
              <ol className="space-y-2">
                {score.topTips.map((tip, index) => (
                  <li key={tip} className="flex gap-2 text-sm leading-5 text-amber-900">
                    <span className="font-bold">{index + 1}.</span><span>{tip}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-900">Detailed checks</h2>
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
      />

      <TailorWorkspace />

      <aside className="rounded-2xl border border-[#d8c895] bg-[#faf7ee] p-6" aria-labelledby="cv-next-step-title">
        <p className="text-xs font-bold uppercase tracking-wider text-[#2f6b5e]">Your next step</p>
        <h2 id="cv-next-step-title" className="mt-2 text-xl font-bold text-[#1a2744]">Move from CV review to interview preparation</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a
            href={resultArticle.url}
            onClick={() => trackToolEvent("result_article_clicked", { surface: "cv_score", destination: resultArticle.url, journey: "applications" })}
            className="min-h-12 rounded-xl border border-[#806017] px-5 py-3 text-center font-semibold text-[#806017]"
          >
            {resultArticle.title}
          </a>
          <a
            href="https://tools.inspireambitions.com/interview-question-bank/"
            onClick={() => trackToolEvent("next_tool_clicked", { surface: "cv_score", destination: "interview_question_bank", journey: "applications" })}
            className="min-h-12 rounded-xl bg-[#806017] px-5 py-3 text-center font-semibold text-white"
          >
            Open interview question bank
          </a>
        </div>
      </aside>
    </div>
  );
}
