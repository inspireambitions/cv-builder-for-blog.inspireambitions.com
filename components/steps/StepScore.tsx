"use client";

import { useEffect, useState } from "react";
import { useCVState } from "@/lib/state";
import { calculateScore } from "@/lib/score";
import type { ScoreResult, ScoreLayer } from "@/lib/types";
import DownloadModal from "@/components/modals/DownloadModal";
import TailorWorkspace from "@/components/tailoring/TailorWorkspace";

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
          <span className="text-sm font-medium text-gray-700 w-16 text-right">
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
                <p className="text-xs text-gray-500 mt-1 ml-4">{c.tip}</p>
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
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    const result = calculateScore(state);
    setScore(result);
  }, [state]);

  if (!score) return null;

  const dashOffset =
    CIRCUMFERENCE - (score.total / score.max) * CIRCUMFERENCE;
  const color = getScoreColor(score.total);

  const isGulf = state.geo === "gulf";

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {isGulf ? "Gulf CV Score & Analysis" : "CV Score & Download"}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {isGulf
            ? "See how your CV performs against Gulf ATS systems and recruiter expectations"
            : "See how your CV stacks up before exporting your free PDF or Word file after email unlock"}
        </p>
      </div>

      {/* Score Ring */}
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="-rotate-90">
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={STROKE}
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-900">
              {score.total}
            </span>
            <span className="text-sm text-gray-500">/100</span>
          </div>
        </div>
        {isGulf && (
          <p className="text-xs text-gray-500 mt-2 text-center max-w-xs">
            Scored against Gulf ATS patterns, regional recruiter expectations,
            and GCC hiring standards
          </p>
        )}
      </div>

      {/* Top Tips */}
      {score.topTips.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Quick wins to boost your score
          </h3>
          <ul className="space-y-2">
            {score.topTips.map((tip, i) => (
              <li
                key={i}
                className="text-sm text-amber-800 flex items-start gap-2"
              >
                <span className="text-amber-500 font-bold mt-0.5 shrink-0">
                  {i + 1}.
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Layered Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Detailed Breakdown
        </h3>
        <LayerCard layer={score.layers.completeness} />
        <LayerCard layer={score.layers.contentQuality} />
        {isGulf && <LayerCard layer={score.layers.gulfSpecific} />}
        <LayerCard layer={score.layers.atsFormatting} />
      </div>

      {/* CTA Cards */}
      <div className="grid grid-cols-1 gap-6">
        {/* Download CV */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center space-y-4">
          <svg
            className="w-10 h-10 text-gold-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">
            Download Your CV
          </h3>
          <p className="text-sm text-gray-600">
            Export your polished CV as a selectable-text PDF or editable Word
            document after email unlock. No card, no watermark.
          </p>
          <button
            type="button"
            onClick={() => setShowDownloadModal(true)}
            className="bg-gold-500 hover:bg-gold-600 text-white font-medium px-8 py-3 rounded-lg transition-colors text-base"
          >
            Email &amp; Download CV
          </button>
        </div>
      </div>

      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />

      <TailorWorkspace />
    </div>
  );
}
