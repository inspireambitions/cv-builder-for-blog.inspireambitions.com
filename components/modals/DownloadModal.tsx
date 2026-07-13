"use client";

import { useEffect, useState } from "react";
import { useCVState } from "@/lib/state";
import { exportJPEG } from "@/lib/export-jpeg";
import { trackToolEvent } from "@/lib/analytics";
import { validateEmail } from "@/lib/validators";
import { reportClientError } from "@/lib/error-reporting";
import { saveAs } from "file-saver";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DownloadFormat = "pdf_ats" | "pdf_recruiter" | "word_ats" | "word_recruiter" | "jpeg";
type AtsReport = {
  passed: boolean;
  score: number;
  checks: Array<{ label: string; passed: boolean; detail: string }>;
};

const DOWNLOAD_GATE_KEY = "ia-cv-download-email-unlocked";
const REVIEW_PROMPT_KEY = "ia-cv-review-prompt-seen";
const MAX_EXPORT_ATTEMPTS = 3;

async function wait(ms: number) {
  await new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function DownloadModal({ isOpen, onClose }: DownloadModalProps) {
  const { state } = useCVState();
  const [downloading, setDownloading] = useState<DownloadFormat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMoreFormats, setShowMoreFormats] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [email, setEmail] = useState("");
  const [atsReport, setAtsReport] = useState<AtsReport | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "loading" | "unlocked" | "error"
  >("idle");

  useEffect(() => {
    if (!isOpen) return;
    const unlockedEmail = localStorage.getItem(DOWNLOAD_GATE_KEY);
    if (unlockedEmail) {
      setEmail(unlockedEmail);
      setEmailStatus("unlocked");
    } else {
      setEmailStatus("idle");
    }
    trackToolEvent("email_prompt_seen", { surface: "cv_download_gate" });
  }, [isOpen]);

  if (!isOpen) return null;

  async function unlockDownloads(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateEmail(email);
    if (!validation.valid) {
      setError(validation.warning ?? "Please enter a valid email address.");
      return;
    }
    setEmailStatus("loading");
    setError(null);
    trackToolEvent("email_gate_shown", { surface: "cv_download_gate", format: "pdf_ats" });
    try {
      const firstName = (state.personal.name || "").split(" ")[0] || "";
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, source: "cv-builder-download-gate", template: state.template, cvLang: state.cvLanguage, uiLang: document.documentElement.lang || "en", format: "pdf_ats" }),
      });
      if (!response.ok) throw new Error("Email capture failed.");
      localStorage.setItem(DOWNLOAD_GATE_KEY, email.toLowerCase().trim());
      setEmailStatus("unlocked");
      trackToolEvent("email_captured", { surface: "cv_download_gate", format: "pdf_ats" });
      await runDownload("pdf_ats");
    } catch {
      setEmailStatus("error");
      setError("We could not unlock downloads. Please check your email and try again.");
    }
  }

  async function runDownload(format: DownloadFormat) {
    setDownloading(format);
    setAttempt(1);
    setError(null);
    trackToolEvent("cv_download_started", { format });

    try {
      for (let tryNumber = 1; tryNumber <= MAX_EXPORT_ATTEMPTS; tryNumber += 1) {
        setAttempt(tryNumber);
        try {
          if (format === "pdf_ats") {
            const { buildPDF } = await import("@/lib/export-pdf");
            const output = await buildPDF(state, { mode: "ats" });
            const formData = new FormData();
            formData.append("file", new File([output.blob], output.filename, { type: "application/pdf" }));
            formData.append(
              "expected",
              JSON.stringify({
                name: state.personal.name,
                email: state.personal.email,
                phone: state.personal.phone,
                skills: state.skills,
              })
            );
            try {
              const check = await fetch("/api/ats-check", { method: "POST", body: formData });
              if (check.ok) setAtsReport((await check.json()) as AtsReport);
            } catch {
              // Download remains available when the optional verification service is unavailable.
            }
            saveAs(output.blob, output.filename);
          }
          if (format === "pdf_recruiter") {
            const { exportPDF } = await import("@/lib/export-pdf");
            await exportPDF(state, { mode: "recruiter" });
          }
          if (format === "word_ats") {
            const { exportWord } = await import("@/lib/export-word");
            await exportWord(state, { mode: "ats" });
          }
          if (format === "word_recruiter") {
            const { exportWord } = await import("@/lib/export-word");
            await exportWord(state, { mode: "recruiter" });
          }
          if (format === "jpeg") {
            await exportJPEG(state.personal.name);
          }
          break;
        } catch (error) {
          if (tryNumber === MAX_EXPORT_ATTEMPTS) throw error;
          trackToolEvent("cv_download_retry", { format });
          await wait(500 * tryNumber);
        }
      }
      trackToolEvent("cv_download_completed", { format });
      if (!localStorage.getItem(REVIEW_PROMPT_KEY)) {
        localStorage.setItem(REVIEW_PROMPT_KEY, "shown");
        setShowReview(true);
        trackToolEvent("review_prompt_shown", { format });
      }
    } catch (e) {
      setError("Export failed after retries. Your CV is still saved; please try again.");
      console.error(e);
      reportClientError("cv_download_failed", {
        format,
        message: e instanceof Error ? e.message : String(e),
      });
      trackToolEvent("cv_download_failed", { format });
    } finally {
      setDownloading(null);
      setAttempt(0);
    }
  }

  function downloadStatus(format: DownloadFormat) {
    if (downloading !== format) return "Unlocked";
    return attempt > 1 ? `Retrying ${attempt}/${MAX_EXPORT_ATTEMPTS}...` : "Exporting...";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute end-4 top-4 min-h-10 min-w-10 rounded-full text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close download dialog"
        >
          x
        </button>

        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
          Free. No card. No watermark.
        </span>

        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Download Your CV
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          JPEG is instant with no email. PDF and Word ask for your email once on this device.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() => runDownload("jpeg")}
          disabled={downloading !== null}
          className="mt-5 w-full rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 text-start transition-colors hover:border-emerald-400 disabled:opacity-60"
        >
          <div className="font-semibold text-gray-900">Download JPEG, no email</div>
          <p className="mt-1 text-sm text-gray-600">Instant, anonymous and watermark-free. PDF is better for ATS applications.</p>
        </button>

        {emailStatus !== "unlocked" ? (
          <form onSubmit={unlockDownloads} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Email address
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 min-h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none transition-colors focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                autoComplete="email"
                required
              />
            </label>
            <button
              type="submit"
              disabled={emailStatus === "loading"}
              className="min-h-12 w-full rounded-xl bg-gold-500 px-4 text-base font-semibold text-white transition-colors hover:bg-gold-600 disabled:opacity-60"
            >
              {emailStatus === "loading"
                ? "Unlocking downloads..."
                : "Unlock and Download PDF"}
            </button>
            <p className="text-xs leading-5 text-gray-500">
              PDF and Word are free. We ask for your email and may send practical Gulf job-search guidance. Unsubscribe anytime. Prefer not to share it? Use the JPEG button above.
            </p>
          </form>
        ) : (
        <div className="mt-6 space-y-3">
          {atsReport && (
            <div className={`border p-4 ${atsReport.passed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`} aria-live="polite">
              <div className="flex items-center justify-between gap-4">
                <div className={`font-semibold ${atsReport.passed ? "text-emerald-950" : "text-amber-950"}`}>Finished-PDF ATS check</div>
                <div className={`text-sm font-bold ${atsReport.passed ? "text-emerald-800" : "text-amber-800"}`}>{atsReport.score}/100</div>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-gray-700">
                {atsReport.checks.map((check) => (
                  <li key={check.label}>{check.passed ? "Pass" : "Review"}: {check.label} - {check.detail}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={() => runDownload("pdf_ats")}
            disabled={downloading !== null}
            className="w-full rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 text-start transition-colors hover:border-emerald-400 disabled:opacity-60"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  Download ATS-safe PDF
                </div>
                <p className="mt-0.5 text-sm text-gray-600">
                  No photo, no columns, selectable text for applicant tracking systems.
                </p>
              </div>
              <span className="text-sm font-semibold text-emerald-700">
                {downloadStatus("pdf_ats")}
              </span>
            </div>
          </button>

          <button
            onClick={() => runDownload("pdf_recruiter")}
            disabled={downloading !== null}
            className="w-full rounded-xl border-2 border-gray-200 p-4 text-start transition-colors hover:border-emerald-400 disabled:opacity-60"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  Download Recruiter-ready PDF
                </div>
                <p className="mt-0.5 text-sm text-gray-600">
                  Keeps your professional photo where the selected CV design supports it.
                </p>
              </div>
              <span className="text-sm font-semibold text-emerald-700">
                {downloadStatus("pdf_recruiter")}
              </span>
            </div>
          </button>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => runDownload("word_ats")}
              disabled={downloading !== null}
              className="rounded-xl border-2 border-gray-200 p-4 text-start transition-colors hover:border-emerald-400 disabled:opacity-60"
            >
              <div className="font-semibold text-gray-900">ATS Word (.docx)</div>
              <p className="mt-0.5 text-sm text-gray-600">
                Editable, text-first version.
              </p>
              <span className="mt-2 inline-block text-sm font-semibold text-emerald-700">
                {downloadStatus("word_ats")}
              </span>
            </button>

            <button
              onClick={() => runDownload("word_recruiter")}
              disabled={downloading !== null}
              className="rounded-xl border-2 border-gray-200 p-4 text-start transition-colors hover:border-emerald-400 disabled:opacity-60"
            >
              <div className="font-semibold text-gray-900">Recruiter Word</div>
              <p className="mt-0.5 text-sm text-gray-600">
                Editable version with photo when available.
              </p>
              <span className="mt-2 inline-block text-sm font-semibold text-emerald-700">
                {downloadStatus("word_recruiter")}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowMoreFormats((value) => !value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            {showMoreFormats ? "Hide more formats" : "More formats"}
          </button>

          {showMoreFormats && (
            <button
              onClick={() => runDownload("jpeg")}
              disabled={downloading !== null}
              className="w-full rounded-xl border border-gray-200 p-4 text-start transition-colors hover:border-gray-300 disabled:opacity-60"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-gray-900">
                    JPEG Preview Image
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Useful for quick visual sharing, not recommended for ATS.
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-600">
                  {downloading === "jpeg" ? downloadStatus("jpeg") : "Download"}
                </span>
              </div>
            </button>
          )}
        </div>
        )}

        {showReview && (
          <div className="mt-5 border border-gold-200 bg-gold-50 p-4">
            <p className="font-semibold text-gray-950">Did this help?</p>
            <p className="mt-1 text-sm text-gray-700">A short, honest review helps other Gulf job seekers find this free tool.</p>
            <div className="mt-3 flex gap-3">
              <a href="https://www.trustpilot.com/evaluate/inspireambitions.com" target="_blank" rel="noreferrer" onClick={() => trackToolEvent("review_prompt_clicked", { surface: "download" })} className="bg-gray-950 px-4 py-2 text-sm font-semibold text-white">Review on Trustpilot</a>
              <button type="button" onClick={() => setShowReview(false)} className="px-3 py-2 text-sm font-semibold text-gray-700">Not now</button>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          Your CV stays in your browser. Downloads stay free after email unlock.
        </p>
      </div>
    </div>
  );
}
