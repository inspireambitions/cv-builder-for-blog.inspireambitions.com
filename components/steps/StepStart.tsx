"use client";

import { useEffect, useState, useRef } from "react";
import { useCVState } from "@/lib/state";
import { detectGeo } from "@/lib/geo";
import { validateFileUpload } from "@/lib/validators";
import { sampleCVState } from "@/lib/sample-data";
import type { CVState } from "@/lib/types";
import Corporate from "@/components/templates/Corporate";
import Minimal from "@/components/templates/Minimal";
import Gulf from "@/components/templates/Gulf";
import Creative from "@/components/templates/Creative";
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
  Component: React.ComponentType<{ state: CVState }>;
}[] = [
  { key: "corp", name: "Corporate", bestFor: "Finance, consulting & enterprise roles", Component: Corporate },
  { key: "min", name: "Minimal", bestFor: "Tech, startups & design roles", Component: Minimal },
  { key: "gulf", name: "Gulf", bestFor: "GCC employers, government & semi-gov", badge: "Popular in GCC", Component: Gulf },
  { key: "cre", name: "Creative", bestFor: "Marketing, media & creative industries", Component: Creative },
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
    title: "Free JPEG Export",
    desc: "Download your CV as a high-resolution image. No watermark. No credit card. No catch.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Gulf/MENA Ready",
    desc: "The only CV builder with a dedicated GCC template. Photo support, Arabic-friendly layouts.",
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
    desc: "We prompt you for achievements, volunteering, certifications, and memberships that 68\u201395% of candidates miss.",
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
  const { nextStep, updateField, setState } = useCVState();
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
            <span className="wfit rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-700">
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
          The world&apos;s most HR-credible CV builder. Free JPEG export. No watermark. No credit card.
        </p>

        {/* CTAs */}
        {mode === "hero" && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleBuildManually}
              className="bg-gold-500 hover:bg-gold-600 text-white font-semibold text-lg px-8 py-3.5 rounded-xl shadow-lg shadow-gold-500/20 transition-all hover:shadow-xl hover:shadow-gold-500/30"
            >
              Build My CV &mdash; Free
            </button>
            <button
              onClick={handleUploadMode}
              className="border-2 border-gray-300 hover:border-gold-400 text-gray-700 hover:text-gold-700 font-semibold text-lg px-8 py-3.5 rounded-xl transition-all"
            >
              Upload &amp; AI Improve
            </button>
          </div>
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
                  d="Mà€ÄÙØÅ„Ì€Ì€À€ÀÀÌ€Í ÄÁ„Ì€Ì€À€ÀÀÌ´ÍØ´Å´´Ð´á°´Ð´Ñ´À€Á0à€á´Ð´ÑØÄÈˆ(€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€ð½ÍÙœø(€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áÐµÍ´™½¹Ðµµ•‘¥Õ´Ñ•áÐµÉ…ä´ÜÀÀˆø(€€€€€€€€€€€€€€€É…œ€™…µÀì‘É½Àå½ÕÈ™¥±”¡•É”°½È±¥¬Ñ¼‰É½ÝÍ”(€€€€€€€€€€€€€€ð½Àø(€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰µÐ´ÄÑ•áÐµáÌÑ•áÐµÉ…ä´ÔÀÀˆø(€€€€€€€€€€€€€€€A°=`°½ÈQaP€™µ‘…Í ì5…à€Ô5(€€€€€€€€€€€€€€ð½Àø(€€€€€€€€€€€€€€ñ¥¹ÁÕÐ(€€€€€€€€€€€€€€€É•˜õí™¥±•%¹ÁÕÑI•™ô(€€€€€€€€€€€€€€€ÑåÁ”ô‰™¥±”ˆ(€€€€€€€€€€€€€€€…•ÁÐôˆ¹Á‘˜°¹‘½à°¹ÑáÐ±…ÁÁ±¥…Ñ¥½¸½Á‘˜±…ÁÁ±¥…Ñ¥½¸½Ù¹¹½Á•¹áµ±™½Éµ…ÑÌµ½™™¥•‘½Õµ•¹Ð¹Ý½É‘ÁÉ½•ÍÍ¥¹µ°¹‘½Õµ•¹Ð±Ñ•áÐ½Á±…¥¸ˆ(€€€€€€€€€€€€€€€½¹¡…¹”õí½¹¥±•%¹ÁÕÑô(€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰¡¥‘‘•¸ˆ(€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€ð½‘¥Øø((€€€€€€€€€€€í•ÉÉ½È€˜˜€ (€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áÐµÍ´Ñ•áÐµÉ•´ØÀÀÑ•áÐµ•¹Ñ•Èˆùí•ÉÉ½Éôð½Àø(€€€€€€€€€€€€¥ô((€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€½¹±¥¬õì ¤€ôøÍ•Ñ5½‘” ‰¡•É¼ˆ¥ô(€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰‰±½¬µàµ…ÕÑ¼Ñ•áÐµÍ´Ñ•áÐµÉ…ä´ÔÀÀ¡½Ù•ÈéÑ•áÐµÉ…ä´ÜÀÀÕ¹‘•É±¥¹”ˆ(€€€€€€€€€€€€ø(€€€€€€€€€€€€€¼‰…¬(€€€€€€€€€€€€ð½‰ÕÑÑ½¸ø(€€€€€€€€€€ð½‘¥Øø(€€€€€€€€¥ô((€€€€€€€ì¼¨QÉÕÍÐÍ¥¹…±Ì€¨½ô(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰µÐ´à™±•à™±•àµÝÉ…À¥Ñ•µÌµ•¹Ñ•È©ÕÍÑ¥™äµ•¹Ñ•È…Àµà´Ø…Àµä´ÈÑ•áÐµÍ´Ñ•áÐµÉ…ä´ÔÀÀˆø(€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰™±•à¥Ñ•µÌµ•¹Ñ•È…À´Ä¸Ôˆø(€€€€€€€€€€€€ñÍÙœ±…ÍÍ9…µ”ô‰Ü´Ð ´ÐÑ•áÐµÉ••¸´ÔÀÀˆ™¥±°ô‰ÕÉÉ•¹Ñ½±½ÈˆÙ¥•Ý	½àôˆÀ€À€ÈÀ€ÈÀˆøñÁ…Ñ ™¥±±IÕ±”ô‰•Ù•¹½‘ˆô‰4ÄØ¸ÜÀÜ€Ô¸ÈäÍ„Ä€Ä€À€ÀÄÀ€Ä¸ÐÄÑ°´à€á„Ä€Ä€À€ÀÄ´Ä¸ÐÄÐ€Á°´Ð´Ñ„Ä€Ä€À€ÀÄÄ¸ÐÄÐ´Ä¸ÐÄÑ0à€ÄÈ¸ÔàÙ°Ü¸ÈäÌ´Ü¸ÈäÍ„Ä€Ä€À€ÀÄÄ¸ÐÄÐ€Áèˆ±¥ÁIÕ±”ô‰•Ù•¹½‘ˆ€¼øð½ÍÙœø(€€€€€€€€€€€É•”™½É•Ù•È(€€€€€€€€€€ð½ÍÁ…¸ø(€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰™±•à¥Ñ•µÌµ•¹Ñ•È…À´Ä¸Ôˆø(€€€€€€€€€€€€ñÍÙœ±…ÍÍ9…µ”ô‰Ü´Ð ´ÐÑ•áÐµÉ••¸´ÔÀÀˆ™¥±°ô‰ÕÉÉ•¹Ñ½±½ÈˆÙ¥•Ý	½àôˆÀ€À€ÈÀ€ÈÀˆøñÁ…Ñ ™¥±±IÕ±”ô‰•Ù•¹½‘ˆô‰4ÄØ¸ÜÀÜ€Ô¸ÈäÍ„Ä€Ä€À€ÀÄÀ€Ä¸ÐÄÑ°´à€á„Ä€Ä€À€ÀÄ´Ä¸ÐÄÐ€Á°´Ð´Ñ„Ä€Ä€À€ÀÄÄ¸ÐÄÐ´Ä¸ÐÄÑ0à€ÄÈ¸ÔàÙ°Ü¸ÈäÌ´Ü¸ÈäÍ„Ä€Ä€À€ÀÄÄ¸ÐÄÐ€Áèˆ±¥ÁIÕ±”ô‰•Ù•¹½‘ˆ€¼øð½ÍÙœø(€€€€€€€€€€€9¼É•‘¥Ð…É(€€€€€€€€€€ð½ÍÁ…¸ø(€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰™±•à¥Ñ•µÌµ•¹Ñ•È…À´Ä¸Ôˆø(€€€€€€€€€€€€ñÍÙœ±…ÍÍ9…µ”ô‰Ü´Ð ´ÐÑ•áÐµÉ••¸´ÔÀÀˆ™¥±°ô‰ÕÉÉ•¹Ñ½±½ÈˆÙ¥•Ý	½àôˆÀ€À€ÈÀ€ÈÀˆøñÁ…Ñ ™¥±±IÕ±”ô‰•Ù•¹½‘ˆô‰4ÄØ¸ÜÀÜ€Ô¸ÈäÍ„Ä€Ä€À€ÀÄÀ€Ä¸ÐÄÑ°´à€á„Ä€Ä€À€ÀÄ´Ä¸ÐÄÐ€Á°´Ð´Ñ„Ä€Ä€À€ÀÄÄ¸ÐÄÐ´Ä¸ÐÄÑ0à€ÄÈ¸ÔàÙ°Ü¸ÈäÌ´Ü¸ÈäÍ„Ä€Ä€À€ÀÄÄ¸ÐÄÐ€Áèˆ±¥ÁIÕ±”ô‰•Ù•¹½‘ˆ€¼øð½ÍÙœø(€€€€€€€€€€€!HMÁ•¥…±¥ÍÐ…ÁÁÉ½Ù•(€€€€€€€€€€ð½ÍÁ…¸ø(€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰™±•à¥Ñ•µÌµ•¹Ñ•È…À´Ä¸Ôˆø(€€€€€€€€€€€€ñÍÙœ±…ÍÍ9…µ”ô‰Ü´Ð ´ÐÑ•áÐµÉ••¸´ÔÀÀˆ™¥±°ô‰ÕÉÉ•¹Ñ½±½ÈˆÙ¥•Ý	½àôˆÀ€À€ÈÀ€ÈÀˆøñÁ…Ñ ™¥±±IÕ±”ô‰•Ù•¹½‘ˆô‰4ÄØ¸ÜÀÜ€Ô¸ÈäÍ„Ä€Ä€À€ÀÄÀ€Ä¸ÐÄÑ°´à€á„Ä€Ä€À€ÀÄ´Ä¸ÐÄÐ€Á°´Ð´Ñ„Ä€Ä€À€ÀÄÄ¸ÐÄÐ´Ä¸ÐÄÑ0à€ÄÈ¸ÔàÙ°Ü¸ÈäÌ´Ü¸ÈäÍ„Ä€Ä€À€ÀÄÄ¸ÐÄÐ€Áèˆ±¥ÁIÕ±”ô‰•Ù•¹½‘ˆ€¼øð½ÍÙœø(€€€€€€€€€€€½59½ÁÑ¥µ¥Í•(€€€€€€€€€€ð½ÍÁ…¸ø(€€€€€€€€ð½‘¥Øø(€€€€€€ð½Í•Ñ¥½¸ø((€€€€€ì¼¨€ôôôôôQ5A1QAIY%\11Id€ôôôôô€¨½ô(€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰µ…àµÜ´Ùá°µàµ…ÕÑ¼ˆø(€€€€€€€€ñ È±…ÍÍ9…µ”ô‰Ñ•áÐ´Éá°µéÑ•áÐ´Íá°™½¹Ðµ‰½±Ñ•áÐµÉ…ä´äÀÀÑ•áÐµ•¹Ñ•Èµˆ´ÄÀˆø(€€€€€€€€€€ÐAÉ½™•ÍÍ¥½¹…°Q•µÁ±…Ñ•Ì€™µ‘…Í ì¡½½Í”e½ÕÈMÑå±”(€€€€€€€€ð½ Èø((€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰É¥É¥µ½±Ì´ÄÍ´éÉ¥µ½±Ì´È±œéÉ¥µ½±Ì´Ð…À´Øˆø(€€€€€€€€€íQ5A1QL¹µ…À ¡Ð¤€ôøì(€€€€€€€€€€€½¹ÍÐÁÉ•Ù¥•ÝMÑ…Ñ”èYMÑ…Ñ”€ôì€¸¸¹Í…µÁ±•YMÑ…Ñ”°Ñ•µÁ±…Ñ”èÐ¹­•äôì(€€€€€€€€€€€É•ÑÕÉ¸€ (€€€€€€€€€€€€€€ñ‘¥Ø(€€€€€€€€€€€€€€€­•äõíÐ¹­•åô(€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰É½ÕÀÉ•±…Ñ¥Ù”‰œµÝ¡¥Ñ”É½Õ¹‘•µá°‰½É‘•È‰½É‘•ÈµÉ…ä´ÈÀÀÍ¡…‘½ÜµÍ´¡½Ù•ÈéÍ¡…‘½ÜµµÑÉ…¹Í¥Ñ¥½¸µÍ¡…‘½Ü½Ù•É™±½Üµ¡¥‘‘•¸ˆ(€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€ì¼¨M…±•Ñ•µÁ±…Ñ”ÁÉ•Ù¥•Ü€¨½ô(€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰É•±…Ñ¥Ù”Üµ™Õ±°½Ù•É™±½Üµ¡¥‘‘•¸‰œµÉ…ä´ÔÀˆÍÑå±”õíì¡•¥¡Ðè€ÌØÀõôø(€€€€€€€€€€€€€€€€€€ñ‘¥Ø(€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰½É¥¥¸µÑ½Àµ±•™ÐÁ½¥¹Ñ•Èµ•Ù•¹ÑÌµ¹½¹”ˆ(€€€€€€€€€€€€€€€€€€€ÍÑå±”õíì(€€€€€€€€€€€€€€€€€€€€€ÑÉ…¹Í™½É´è€‰Í…±” À¸ÌÔ¤ˆ°(€€€€€€€€€€€€€€€€€€€€€Ý¥‘Ñ è€ÜäÐ°(€€€€€€€€€€€€€€€€€€€€€µ¥¹!•¥¡Ðè€ÄÄÈÌ°(€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€€ñÐ¹½µÁ½¹•¹ÐÍÑ…Ñ”õíÁÉ•Ù¥•ÝMÑ…Ñ•ô€¼ø(€€€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€€€ð½‘¥Øø((€€€€€€€€€€€€€€€ì¼¨	…‘”€¨½ô(€€€€€€€€€€€€€€€íÐ¹‰…‘”€˜˜€ (€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰…‰Í½±ÕÑ”Ñ½À´ÌÉ¥¡Ð´Ì‰œµÉ••¸´ØÀÀÑ•áÐµÝ¡¥Ñ”Ñ•áÐµlÄÁÁát™½¹Ðµ‰½±ÕÁÁ•É…Í”ÑÉ…­¥¹œµÝ¥‘•ÈÁà´È¸ÔÁä´ÄÉ½Õ¹‘•µ™Õ±°Í¡…‘½ÜµÍ´ˆø(€€€€€€€€€€€€€€€€€€€íÐ¹‰…‘•ô(€€€€€€€€€€€€€€€€€€ð½ÍÁ…¸ø(€€€€€€€€€€€€€€€€¥ô((€€€€€€€€€€€€€€€ì¼¨%¹™¼€¨½ô(€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰À´Ð‰½É‘•ÈµÐ‰½É‘•ÈµÉ…ä´ÄÀÀˆø(€€€€€€€€€€€€€€€€€€ñ Ì±…ÍÍ9…µ”ô‰™½¹ÐµÍ•µ¥‰½±Ñ•áÐµÉ…ä´äÀÀˆùíÐ¹¹…µ•ôð½ Ìø(€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áÐµáÌÑ•áÐµÉ…ä´ÔÀÀµÐ´À¸Ôˆù	•ÍÐ™½ÈèíÐ¹‰•ÍÑ½Éôð½Àø(€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€¤ì(€€€€€€€€€ô¥ô(€€€€€€€€ð½‘¥Øø(€€€€€€ð½Í•Ñ¥½¸ø((€€€€€ì¼¨€ôôôôôQUILMQ%=8€ôôôôô€¨½ô(€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰µ…àµÜ´Õá°µàµ…ÕÑ¼Áˆ´àˆø(€€€€€€€€ñ È±…ÍÍ9…µ”ô‰Ñ•áÐ´Éá°µéÑ•áÐ´Íá°™½¹Ðµ‰½±Ñ•áÐµÉ…ä´äÀÀÑ•áÐµ•¹Ñ•Èµˆ´ÄÀˆø(€€€€€€€€€]¡ä%¹ÍÁ¥É•µ‰¥Ñ¥½¹Ìü(€€€€€€€€ð½ Èø((€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰É¥É¥µ½±Ì´ÄÍ´éÉ¥µ½±Ì´È±œéÉ¥µ½±Ì´Ì…À´Øˆø(€€€€€€€€€íQUIL¹µ…À ¡˜¤€ôø€ (€€€€€€€€€€€€ñ‘¥Ø(€€€€€€€€€€€€€­•äõí˜¹Ñ¥Ñ±•ô(€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰‰œµÝ¡¥Ñ”É½Õ¹‘•µá°‰½É‘•È‰½É‘•ÈµÉ…ä´ÈÀÀÀ´Ø¡½Ù•ÈéÍ¡…‘½ÜµÍ´ÑÉ…¹Í¥Ñ¥½¸µÍ¡…‘½Üˆ(€€€€€€€€€€€€ø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰™±•à¥Ñ•µÌµ•¹Ñ•È©ÕÍÑ¥™äµ•¹Ñ•ÈÜ´ÄÄ ´ÄÄ‰œµ½±´ÔÀÑ•áÐµ½±´ØÀÀÉ½Õ¹‘•µ±œµˆ´Ðˆø(€€€€€€€€€€€€€€€í˜¹¥½¹ô(€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€ñ Ì±…ÍÍ9…µ”ô‰™½¹ÐµÍ•µ¥‰½±Ñ•áÐµÉ…ä´äÀÀµˆ´Ä¸Ôˆùí˜¹Ñ¥Ñ±•ôð½ Ìø(€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áÐµÍ´Ñ•áÐµÉ…ä´ØÀÀ±•…‘¥¹œµÉ•±…á•ˆùí˜¹‘•Íôð½Àø(€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€¤¥ô(€€€€€€€€ð½‘¥Øø(€€€€€€ð½Í•Ñ¥½¸ø(€€€€ð½‘¥Øø(€€¤ì)ô