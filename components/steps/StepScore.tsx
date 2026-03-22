"use client";

import { useEffect, useState } from "react";
import { useCVState } from "@/lib/state";
import { calculateScore } from "@/lib/score";
import type { ScoreResult } from "@/lib/types";

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

export default function StepScore() {
  const { state } = useCVState();
  const [score, setScore] = useState<ScoreResult | null>(null);

  useEffect(() => {
    const result = calculateScore(state);
    setScore(result);
  }, [state]);

  if (!score) return null;

  const dashOffset =
    CIRCUMFERENCE - (score.total / score.max) * CIRCUMFERENCE;
  const color = getScoreColor(score.total);

  const breakdownRows = Object.values(score.breakdown);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          CV Score & Download
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          See how your CV stacks up and access premium features
        </p>
      </div>

      {/* ── Score Ring ── */}
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg
            width={SIZE}
            height={SIZE}
            className="-rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={STROKE}
            />
            {/* Progress arc */}
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
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-900">
              {score.total}
            </span>
            <span className="text-sm text-gray-500">/100</span>
          </div>
        </div>
      </div>

      {/* ── Score Breakdown ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Score Breakdown
        </h3>
        {breakdownRows.map((criterion) => (
          <div
            key={criterion.label}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-2.5 h-2.5 rounded-full ${getLevelDot(criterion.level)}`}
              />
              <span className="text-sm text-gray-700">{criterion.label}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {criterion.score}/{criterion.max}
            </span>
          </div>
        ))}
      </div>

      {/* ── CTA Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Download CV */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center space-y-4 md:col-span-2">
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
            Export your polished CV as a professional PDF or Word document
          </p>
          <button
            type="button"
            onClick={() => alert("Download modal")}
            className="bg-gold-500 hover:bg-gold-600 text-white font-medium px-8 py-3 rounded-lg transition-colors text-base"
          >
            Download CV
          </button>
        </div>

        {/* AI CV Roast */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
              />
            </svg>
            <h3 className="text-base font-semibold text-gray-900">
              AI CV Roast
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            Get brutally honest HR feedback on your CV
          </p>
          <button
            type="button"
            onClick={() => alert("AI CV Roast — pay gate")}
            className="mt-auto bg-gold-500 hover:bg-gold-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Roast My CV ($2)
          </button>
        </div>

        {/* Generate Cover Letter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-base font-semibold text-gray-900">
              Generate Cover Letter
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            AI-powered cover letter tailored to your experience
          </p>
          <button
            type="button"
            onClick={() => alert("Generate Cover Letter — pay gate")}
            className="mt-auto bg-gold-500 hover:bg-gold-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Generate ($2)
          </button>
        </div>

        {/* Mock Interview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <svg
              className="w-8 h-8 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-base font-semibold text-gray-900">
              Mock Interview
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            Practice with an AI recruiter tailored to your role and experience.
            <span className="block mt-1 font-medium text-purple-600">
              Annual Plan includes 1 live mock interview with an HR specialist on weekends.
            </span>
          </p>
          <button
            type="button"
            onClick={() => alert("Mock Interview — Annual Plan required")}
            className="self-start bg-gold-500 hover:bg-gold-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Start Interview (Annual Plan)
          </button>
        </div>
      </div>
    </div>
  );
}
