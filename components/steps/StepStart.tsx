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

type Mode = "hero" | "upload" | "analysing" | "feedback";

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
    title: "HR Director Approved",
    desc: "Every tip, prompt, and scoring criterion written by a practising HR Director who screens CVs daily.",
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

export default function StepStart() {
  const { nextStep, updateField, setState } = useCVState();
  const [mode, setMode] = useState<Mode>("hero");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
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

    setMode("analysing");

    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });

    try {
      const res = await fetch("/api/ai-improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("API request failed");

      const data = await res.json();
      setFeedback(data.feedback ?? "AI analysis complete. Review the suggestions below.");
      setAiData(data);
      setMode("feedback");
    } catch {
      setFeedback(
        "We couldn\u2019t reach the AI service right now. You can still build your CV manually with our guided steps."
      );
      setAiData(null);
      setMode("feedback");
    }
  }

  function handleUseImproved() {
    if (aiData) {
      try {
        setState((prev) => ({
          ...prev,
          ...(aiData as Record<string, unknown>),
          step: prev.step,
        }));
      } catch {
        // Ignore parse errors
      }
    }
    nextStep();
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
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            AI Analysis Complete
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-700 whitespace-pre-wrap">{feedback}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {aiData && (
            <button
              onClick={handleUseImproved}
              className="bg-gold-500 hover:bg-gold-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              Use Improved Version
            </button>
          )}
          <button
            onClick={() => nextStep()}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-6 py-2.5 rounded-lg transition-colors"
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
          Built by an HR Director
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
              onClick={() => nextStep()}
              className="bg-gold-500 hover:bg-gold-600 text-white font-semibold text-lg px-8 py-3.5 rounded-xl shadow-lg shadow-gold-500/20 transition-all hover:shadow-xl hover:shadow-gold-500/30"
            >
              Build My CV &mdash; Free
            </button>
            <button
              onClick={() => setMode("upload")}
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <p className="text-sm font-medium text-gray-700">
                Drag &amp; drop your file here, or click to browse
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PDF, DOCX, or TXT &mdash; Max 5 MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
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
            No sign-up
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            HR Director approved
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
            const previewState: CVState = { ...sampleCVState, template: t.key };
            return (
              <div
                key={t.key}
                className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Scaled template preview */}
                <div className="relative w-full overflow-hidden bg-gray-50" style={{ height: 360 }}>
                  <div
                    className="origin-top-left pointer-events-none"
                    style={{
                      transform: "scale(0.35)",
                      width: 794,
                      minHeight: 1123,
                    }}
                  >
                    <t.Component state={previewState} />
                  </div>
                </div>

                {/* Badge */}
                {t.badge && (
                  <span className="absolute top-3 right-3 bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
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
