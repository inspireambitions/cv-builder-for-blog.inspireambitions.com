"use client";

import { useEffect, useState, useRef } from "react";
import { useCVState } from "@/lib/state";
import { detectGeo } from "@/lib/geo";
import { validateFileUpload } from "@/lib/validators";
import type { CVState } from "@/lib/types";
import { trackToolEvent } from "@/lib/analytics";

type Mode = "hero" | "upload" | "analysing" | "feedback";

type FeedbackItem = {
  title: string;
  body: string;
};

type AiExtractedCv = {
  name?: unknown;
  title?: unknown;
  email?: unknown;
  phone?: unknown;
  location?: unknown;
  linkedin?: unknown;
  summary?: unknown;
  experience?: unknown;
  education?: unknown;
  skills?: unknown;
  languages?: unknown;
};

const LANGUAGE_LEVELS: CVState["languages"][number]["level"][] = [
  "Native",
  "Fluent",
  "Professional",
  "Conversational",
  "Basic",
];

const DEFAULT_FEEDBACK: FeedbackItem[] = [
  {
    title: "Review complete",
    body: "Your CV was analysed successfully. Review the suggestions below before applying the improved version.",
  },
];

const FEEDBACK_SECTION_TITLES = [
  "Header Section",
  "Professional Summary",
  "Experience Section",
  "Skills Section",
  "Format & Structure",
  "Education Section",
  "Contact Details",
  "Achievements",
  "Keywords",
];

const TEMPLATES: {
  key: CVState["template"];
  name: string;
  bestFor: string;
  badge?: string;
  accentClass: string;
}[] = [
  { key: "corp", name: "Corporate", bestFor: "Finance, consulting & enterprise roles", accentClass: "bg-navy-700" },
  { key: "min", name: "Minimal", bestFor: "Tech, startups & design roles", accentClass: "bg-gray-600" },
  { key: "gulf", name: "Gulf", bestFor: "GCC employers, government & semi-gov", badge: "Popular in GCC", accentClass: "bg-gold-600" },
  { key: "cre", name: "Creative", bestFor: "Marketing, media & creative industries", accentClass: "bg-emerald-700" },
];

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "HR Specialist Approved",
    desc: "Every tip, prompt, and scoring criterion written by a practising HR Specialist who screens CVs daily.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    title: "Free PDF & Word Export",
    desc: "Email-gated ATS-safe PDF and editable Word files. No watermark. No credit card.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Gulf/MENA Ready",
    desc: "Built for GCC applications, with a dedicated Gulf template, photo support and Arabic-friendly layouts.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "AI-Powered",
    desc: "Upload your existing CV and our AI rewrites it with achievement-focused language.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    title: "Live Preview",
    desc: "See your CV update in real-time as you type. What you see is what you get.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: "Commonly Forgotten Sections",
    desc: "We prompt you for achievements, volunteering, certifications and memberships that are easy to overlook.",
  },
];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map(asString).filter(Boolean)
    : [];
}

function cleanFeedbackText(value: string): string {
  return value.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitFeedbackValue(value: unknown): string[] {
  const rawText = asString(value);
  if (!rawText) return [];

  const markdownHeadingPattern = /\*\*([^*]{2,80})\*\*\s*:/g;
  const markdownMatches = Array.from(rawText.matchAll(markdownHeadingPattern));

  if (markdownMatches.length > 1) {
    return markdownMatches
      .map((match, index) => {
        const start = match.index ?? 0;
        const next = markdownMatches[index + 1]?.index ?? rawText.length;
        return rawText.slice(start, next).trim();
      })
      .filter(Boolean);
  }

  const cleanedText = cleanFeedbackText(rawText);
  const plainHeadingPattern = new RegExp(
    `\\b(${FEEDBACK_SECTION_TITLES.map(escapeRegExp).join("|")}):`,
    "g"
  );
  const plainMatches = Array.from(cleanedText.matchAll(plainHeadingPattern));

  if (plainMatches.length > 1) {
    return plainMatches
      .map((match, index) => {
        const start = match.index ?? 0;
        const next = plainMatches[index + 1]?.index ?? cleanedText.length;
        return cleanedText.slice(start, next).trim();
      })
      .filter(Boolean);
  }

  return [rawText];
}

function parseFeedbackItem(value: unknown): FeedbackItem | null {
  const text = cleanFeedbackText(asString(value));
  if (!text) return null;

  const separatorIndex = text.indexOf(":");
  if (separatorIndex > 0 && separatorIndex < 70) {
    return {
      title: text.slice(0, separatorIndex).trim(),
      body: text.slice(separatorIndex + 1).trim(),
    };
  }

  return {
    title: "Recommendation",
    body: text,
  };
}

function normalizeFeedback(value: unknown): FeedbackItem[] {
  const feedbackValues = Array.isArray(value)
    ? value.flatMap(splitFeedbackValue)
    : splitFeedbackValue(value);

  const items = feedbackValues
    .map(parseFeedbackItem)
    .filter((item): item is FeedbackItem => Boolean(item));

  return items.length ? items : DEFAULT_FEEDBACK;
}

function asLanguageLevel(value: unknown): CVState["languages"][number]["level"] {
  const level = asString(value);
  return LANGUAGE_LEVELS.includes(level as CVState["languages"][number]["level"])
    ? (level as CVState["languages"][number]["level"])
    : "Professional";
}

function applyAiDataToCvState(prev: CVState, aiData: Record<string, unknown>): CVState {
  const extracted = asRecord(aiData.extracted) as AiExtractedCv;
  const skills = asStringArray(extracted.skills);
  const experience = Array.isArray(extracted.experience)
    ? extracted.experience
        .map((item, index) => {
          const entry = asRecord(item);
          return {
            id: `ai-exp-${index + 1}`,
            role: asString(entry.role),
            company: asString(entry.company),
            companyDesc: asString(entry.companyDesc),
            location: asString(entry.location),
            dates: asString(entry.dates),
            description: asString(entry.description),
            gap: "",
          };
        })
        .filter((entry) => entry.role || entry.company || entry.description)
    : [];

  const education = Array.isArray(extracted.education)
    ? extracted.education
        .map((item, index) => {
          const entry = asRecord(item);
          return {
            id: `ai-edu-${index + 1}`,
            degree: asString(entry.degree),
            institution: asString(entry.institution),
            year: asString(entry.year),
            grade: asString(entry.grade),
          };
        })
        .filter((entry) => entry.degree || entry.institution)
    : [];

  const languages = Array.isArray(extracted.languages)
    ? extracted.languages
        .map((item, index) => {
          const entry = asRecord(item);
          return {
            id: `ai-lang-${index + 1}`,
            language: asString(entry.language),
            level: asLanguageLevel(entry.level),
          };
        })
        .filter((entry) => entry.language)
    : [];

  return {
    ...prev,
    personal: {
      ...prev.personal,
      name: asString(extracted.name) || prev.personal.name,
      title: asString(extracted.title) || prev.personal.title,
      email: asString(extracted.email) || prev.personal.email,
      phone: asString(extracted.phone) || prev.personal.phone,
      location: asString(extracted.location) || prev.personal.location,
      linkedin: asString(extracted.linkedin) || prev.personal.linkedin,
    },
    summary: asString(extracted.summary) || prev.summary,
    experience: experience.length ? experience : prev.experience,
    education: education.length ? education : prev.education,
    skills: skills.length ? skills : prev.skills,
    languages: languages.length ? languages : prev.languages,
    score: null,
  };
}

export default function StepStart() {
  const { nextStep, updateField, setState, hydrated } = useCVState();
  const [mode, setMode] = useState<Mode>("hero");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>(DEFAULT_FEEDBACK);
  const [aiData, setAiData] = useState<Record<string, unknown> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect geo on mount
  useEffect(() => {
    detectGeo().then((geo) => {
      updateField({ geo });
      if (geo === "gulf") {
        updateField({ template: "gulf" });
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFile(file: File) {
    setError(null);
    const validation = validateFileUpload(file);
    if (!validation.valid) {
      setError(validation.error ?? "Invalid file");
      return;
    }

    trackToolEvent("tool_started", { surface: "cv_file_upload" });
    setMode("analysing");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ai-improve-file", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "API request failed");
      }

      setFeedback(normalizeFeedback(data.feedback));
      setAiData(data);
      setMode("feedback");
    } catch (error) {
      setFeedback([
        {
          title: "Analysis unavailable",
          body:
            error instanceof Error
              ? error.message
              : "We couldn\u2019t reach the AI service right now. You can still build your CV manually with our guided steps.",
        },
      ]);
      setAiData(null);
      setMode("feedback");
    }
  }

  function handleUseImproved() {
    if (aiData) {
      try {
        setState((prev) => applyAiDataToCvState(prev, aiData));
      } catch {
        // Ignore parse errors
      }
    }
    trackToolEvent("tool_started", { surface: "cv_ai_improve" });
    nextStep();
  }

  function handleBuildManually() {
    trackToolEvent("tool_started", { surface: "cv_manual_start" });
    nextStep();
  }

  function handleUploadMode() {
    trackToolEvent("tool_started", { surface: "cv_upload_start" });
    setMode("upload");
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  // --- Analysing mode: spinner ---
  if (mode === "analysing") {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="w-12 h-12 border-4 border-gold-200 border-t-gold-500 rounded-full animate-spin" />
        <p className="text-lg font-medium text-gray-700">
          Analysing your CV...
        </p>
        <p className="text-sm text-gray-500">
          This usually takes 10-20 seconds
        </p>
      </div>
    );
  }

  // --- Feedback mode: show AI results ---
  if (mode === "feedback") {
    const hasAiResult = Boolean(aiData);

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
              hasAiResult
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                hasAiResult ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {hasAiResult ? "CV read successfully" : "Manual build is still available"}
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900">
            AI Analysis Complete
          </h2>
          <p className="mt-3 text-base md:text-lg text-gray-600">
            {hasAiResult
              ? "We pulled out the main CV details and found the highest-impact fixes to make before export."
              : "The AI could not complete this file, but you can still build your CV manually with the guided steps."}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Recommended fixes
              </h3>
              <p className="text-sm text-gray-500">
                Start with these before downloading or sharing your CV.
              </p>
            </div>
            <span className="w-fit rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-700">
              {feedback.length} {feedback.length === 1 ? "tip" : "tips"}
            </span>
          </div>

          <ol className="mt-5 space-y-3">
            {feedback.map((item, index) => (
              <li
                key={`${item.title}-${index}`}
                className="rounded-xl border border-gray-200 bg-gray-50/70 p-4"
              >
                <div className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-gold-700 shadow-sm ring-1 ring-gold-100">
                    {index + 1}
                  </span>
                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-gray-900">
                      {item.title}
                    </h4>
                    <p className="text-sm md:text-base leading-7 text-gray-600">
                      {item.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {hasAiResult && (
          <div className="rounded-2xl bg-gray-900 p-5 md:p-6 text-white shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold">Ready to edit the improved CV?</h3>
                <p className="mt-1 text-sm leading-6 text-gray-300">
                  The next step imports the extracted details into the builder. You can edit every section before exporting.
                </p>
              </div>
              <div className="rounded-xl bg-white/10 px-4 py-3 text-sm text-gray-200">
                No changes are final yet.
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {hasAiResult && (
            <button
              onClick={handleUseImproved}
              className="bg-gold-500 hover:bg-gold-600 text-white font-semibold px-7 py-3 rounded-xl shadow-lg shadow-gold-500/20 transition-colors"
            >
              Use Improved Version
            </button>
          )}
          <button
            onClick={handleBuildManually}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-7 py-3 rounded-xl transition-colors"
          >
            Build Manually
          </button>
        </div>
      </div>
    );
  }

  // --- Hero / Upload mode ---
  return (
    <div className="space-y-20">
      {/* ===== HERO SECTION ===== */}
      <section className="text-center max-w-3xl mx-auto pt-8">
        {/* Badge */}
        <span className="inline-block bg-gold-50 text-gold-700 text-xs font-semibold tracking-wide uppercase px-4 py-1.5 rounded-full border border-gold-200 mb-6">
          Built by an HR Specialist
        </span>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Build a CV That Gets You Hired
        </h1>

        {/* Subheadline */}
        <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Build a clear, evidence-led CV for UAE and international roles. Free ATS-safe PDF and Word export by email. No watermark. No credit card.
        </p>

        {/* CTAs */}
        {mode === "hero" && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleBuildManually}
              disabled={!hydrated}
              className="bg-gold-500 hover:bg-gold-600 text-white font-semibold text-lg px-8 py-3.5 rounded-xl shadow-lg shadow-gold-500/20 transition-all hover:shadow-xl hover:shadow-gold-500/30 disabled:cursor-wait disabled:opacity-60"
            >
              Build My CV &mdash; Free
            </button>
            <button
              onClick={handleUploadMode}
              disabled={!hydrated}
              className="border-2 border-gray-300 hover:border-gold-400 text-gray-700 hover:text-gold-700 font-semibold text-lg px-8 py-3.5 rounded-xl transition-all disabled:cursor-wait disabled:opacity-60"
            >
              Upload &amp; Tailor to a Job
            </button>
          </div>
        )}
        {mode === "hero" && (
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
            Already have a CV? Upload it, improve it, then tailor the reviewed version to a real vacancy.
          </p>
        )}

        {/* Upload zone (inline) */}
        {mode === "upload" && (
          <div className="mt-8 max-w-xl mx-auto space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 cursor-pointer transition-colors ${
                dragOver
                  ? "border-gold-500 bg-gold-50"
                  : "border-gray-300 bg-gray-50 hover:border-gold-400 hover:bg-gold-50/50"
              }`}
            >
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <p className="text-sm font-medium text-gray-700">
                Drag &amp; drop your file here, or click to browse
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PDF, DOCX, TXT, RTF, JPG, PNG, WEBP or iPhone HEIC &mdash; Max 5 MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.rtf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/rtf,application/rtf,image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={onFileInput}
                className="hidden"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <button
              onClick={() => setMode("hero")}
              className="block mx-auto text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Go back
            </button>
          </div>
        )}

        {/* Trust signals */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Free forever
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            HR Specialist approved
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            GCC/MENA optimised
          </span>
        </div>
      </section>

      {/* ===== TEMPLATE PREVIEW GALLERY ===== */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
          4 Professional Templates &mdash; Choose Your Style
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEMPLATES.map((t) => {
            return (
              <div
                key={t.key}
                className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Lightweight representative preview. Full templates load in the editor. */}
                <div className="relative h-[360px] w-full overflow-hidden bg-gray-50 p-6">
                  <span className="absolute start-3 top-3 z-10 bg-gray-950 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Fictional sample CV
                  </span>
                  <div className="mt-8 h-full bg-white p-5 shadow-sm" aria-hidden="true">
                    <div className={`mb-4 h-2 w-20 ${t.accentClass}`} />
                    <div className="mb-2 h-3 w-3/4 bg-gray-800" />
                    <div className="mb-6 h-2 w-1/2 bg-gray-300" />
                    {["w-full", "w-5/6", "w-full", "w-2/3"].map((width, index) => (
                      <div key={index} className="mb-5">
                        <div className={`mb-2 h-2 w-24 ${t.accentClass}`} />
                        <div className={`mb-1 h-1.5 ${width} bg-gray-300`} />
                        <div className="mb-1 h-1.5 w-full bg-gray-200" />
                        <div className="h-1.5 w-4/5 bg-gray-200" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Badge */}
                {t.badge && (
                  <span className="absolute top-3 end-3 bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                    {t.badge}
                  </span>
                )}

                {/* Info */}
                <div className="p-4 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900">{t.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Best for: {t.bestFor}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="max-w-5xl mx-auto pb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
          Why InspireAmbitions?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-center w-11 h-11 bg-gold-50 text-gold-600 rounded-lg mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
