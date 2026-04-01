"use client";

import { useState, useEffect } from "react";
import type { CVState, ScoreResult, ScoreLayer } from "@/lib/types";

const DISMISSED_KEY = "ia-email-dismissed";
const SUBSCRIBED_KEY = "ia-email-subscribed";

function buildCVEmailHTML(state: CVState, score: ScoreResult): string {
  const color =
    score.total >= 75 ? "#22c55e" : score.total >= 50 ? "#f59e0b" : "#ef4444";
  const label =
    score.total >= 75
      ? "Strong CV"
      : score.total >= 50
      ? "Needs Improvement"
      : "Weak — Action Needed";

  const isGulf = state.geo === "gulf";

  function layerRows(layer: ScoreLayer): string {
    return layer.criteria
      .map((c) => {
        const dot =
          c.level === "green" ? "🟢" : c.level === "amber" ? "🟡" : "🔴";
        const tipHtml =
          c.tip && c.level !== "green"
            ? `<br><span style="color:#888;font-size:11px;">Tip: ${c.tip}</span>`
            : "";
        return `<tr><td style="padding:6px 10px;border-bottom:1px solid #f0f0f0;font-size:13px;">${dot} ${c.label}${tipHtml}</td><td style="padding:6px 10px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:right;font-weight:600;">${c.score}/${c.max}</td></tr>`;
      })
      .join("");
  }

  function layerBlock(layer: ScoreLayer): string {
    const pct = Math.round((layer.score / layer.max) * 100);
    const barColor =
      pct >= 75 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
    return `<h4 style="margin:16px 0 8px;color:#1a1a2e;font-size:14px;font-weight:600;">${layer.label} <span style="color:${barColor};font-size:13px;">(${layer.score}/${layer.max})</span></h4>
<table style="width:100%;border-collapse:collapse;">${layerRows(layer)}</table>`;
  }

  let html = `<h2 style="margin:0 0 8px;color:#1a1a2e;font-size:20px;">${isGulf ? "Gulf CV Score Report" : "CV Score Report"}</h2>
<p style="margin:0 0 20px;color:#666;font-size:14px;">Results for <strong>${state.personal.name || "your CV"}</strong>${state.personal.title ? ` — ${state.personal.title}` : ""}</p>

<div style="text-align:center;padding:24px;background:#f8f9fa;border-radius:12px;margin-bottom:20px;">
<div style="font-size:48px;font-weight:800;color:${color};">${score.total}<span style="font-size:20px;color:#999;">/100</span></div>
<div style="font-size:14px;font-weight:600;color:${color};margin-top:4px;">${label}</div>
</div>`;

  // Top tips
  if (score.topTips.length > 0) {
    html += `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px;margin-bottom:20px;">
<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#92400e;">Quick wins to boost your score</p>
<ol style="margin:0;padding-left:20px;">`;
    score.topTips.forEach((tip) => {
      html += `<li style="font-size:13px;color:#78350f;margin-bottom:4px;">${tip}</li>`;
    });
    html += `</ol></div>`;
  }

  // Detailed breakdown
  html += `<h3 style="margin:20px 0 8px;color:#1a1a2e;font-size:16px;">Detailed Breakdown</h3>`;
  html += layerBlock(score.layers.completeness);
  html += layerBlock(score.layers.contentQuality);
  if (isGulf) html += layerBlock(score.layers.gulfSpecific);
  html += layerBlock(score.layers.atsFormatting);

  // CV summary
  if (state.personal.name || state.personal.title) {
    html += `<h3 style="margin:24px 0 8px;color:#1a1a2e;font-size:16px;">CV Summary</h3>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">`;
    if (state.personal.name)
      html += `<tr><td style="padding:5px 0;font-size:13px;color:#888;width:110px;">Name</td><td style="padding:5px 0;font-size:13px;font-weight:600;">${state.personal.name}</td></tr>`;
    if (state.personal.title)
      html += `<tr><td style="padding:5px 0;font-size:13px;color:#888;">Title</td><td style="padding:5px 0;font-size:13px;">${state.personal.title}</td></tr>`;
    if (state.personal.location)
      html += `<tr><td style="padding:5px 0;font-size:13px;color:#888;">Location</td><td style="padding:5px 0;font-size:13px;">${state.personal.location}</td></tr>`;
    if (state.experience.length > 0 && state.experience[0].role)
      html += `<tr><td style="padding:5px 0;font-size:13px;color:#888;">Latest Role</td><td style="padding:5px 0;font-size:13px;">${state.experience[0].role}${state.experience[0].company ? ` at ${state.experience[0].company}` : ""}</td></tr>`;
    if (state.skills.length > 0)
      html += `<tr><td style="padding:5px 0;font-size:13px;color:#888;">Skills</td><td style="padding:5px 0;font-size:13px;">${state.skills.join(", ")}</td></tr>`;
    html += `</table>`;
  }

  html += `<div style="text-align:center;margin-top:24px;">
<a href="https://cv.inspireambitions.com" style="display:inline-block;background:#d4a843;color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">Continue Building Your CV</a>
</div>`;

  return html;
}

interface EmailCaptureProps {
  cvScore: number;
  userName: string;
  cvState: CVState;
  scoreResult: ScoreResult;
}

export default function EmailCapture({
  cvScore,
  userName,
  cvState,
  scoreResult,
}: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISSED_KEY);
    const wasSubscribed = localStorage.getItem(SUBSCRIBED_KEY);
    if (!wasDismissed && !wasSubscribed) {
      setDismissed(false);
    }
  }, []);

  if (dismissed || status === "success") {
    if (status === "success") {
      return (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <svg
            className="w-10 h-10 text-green-500 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <p className="text-green-800 font-semibold">Score report sent!</p>
          <p className="text-green-700 text-sm mt-1">
            Your full CV score breakdown has been sent to your email. Check your
            inbox (and spam folder).
          </p>
        </div>
      );
    }
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setErrorMsg("Enter a valid email address");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      // Send full score report via proxy to WordPress email system
      const emailContent = buildCVEmailHTML(cvState, scoreResult);

      const wpRes = await fetch("/api/email-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          tool: "CV Builder",
          subject: `Your CV Score: ${cvScore}/100 — ${userName || "CV Report"}`,
          content: emailContent,
        }),
      });

      // Also subscribe via local API
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: userName.split(" ")[0] || "",
        }),
      }).catch(() => {});

      if (wpRes.ok) {
        setStatus("success");
        localStorage.setItem(SUBSCRIBED_KEY, "1");
      } else {
        setStatus("error");
        setErrorMsg("Could not send report. Try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Try again.");
    }
  };

  const scoreLabel =
    cvScore >= 75 ? "strong" : cvScore >= 50 ? "getting there" : "needs work";
  const isGulf = cvState.geo === "gulf";

  return (
    <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 md:p-8 text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      {/* Dismiss button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="relative space-y-4">
        {/* Headline */}
        <div>
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-wide">
            Your {isGulf ? "Gulf " : ""}CV score: {cvScore}/100 ({scoreLabel})
          </p>
          <h3 className="text-xl md:text-2xl font-bold mt-2 leading-tight">
            Get your full {isGulf ? "Gulf " : ""}CV Score Report by email
          </h3>
          <p className="text-gray-300 text-sm mt-2 leading-relaxed">
            Receive your detailed score breakdown, improvement tips, and CV
            summary — plus weekly career insights from an HR Career Specialist.
            Unsubscribe anytime.
          </p>
        </div>

        {/* What you get */}
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
            Score breakdown
          </span>
          <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
            Improvement tips
          </span>
          <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
            Weekly career tips
          </span>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 mt-2"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your best email"
            required
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm whitespace-nowrap"
          >
            {status === "loading" ? "Sending..." : "Email My Report"}
          </button>
        </form>

        {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

        {/* Trust signal */}
        <p className="text-gray-500 text-xs">
          No spam. One email per week. Unsubscribe with one click.
        </p>
      </div>
    </div>
  );
}
