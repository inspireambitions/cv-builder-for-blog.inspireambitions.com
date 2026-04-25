"use client";

import { useEffect, useState } from "react";
import { useCVState } from "@/lib/state";
import { exportJPEG } from "@/lib/export-jpeg";
import { calculateScore } from "@/lib/score";
import { buildCVEmailHTML } from "@/components/shared/EmailCapture";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadModal({ isOpen, onClose }: DownloadModalProps) {
  const { state } = useCVState();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(state.personal.email || "");
  const [unlocked, setUnlocked] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<"idle" | "loading">("idle");

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setUnlocked(localStorage.getItem("ia-email-subscribed") === "1");

    if (!email && state.personal.email) {
      setEmail(state.personal.email);
    }
  }, [email, isOpen, state.personal.email]);

  if (!isOpen) return null;

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();

    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setCaptureStatus("loading");
    setError(null);

    try {
      const score = calculateScore(state);
      const content = buildCVEmailHTML(state, score);

      const emailRes = await fetch("/api/email-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          tool: "CV Builder",
          subject: `Your CV Score: ${score.total}/100 - ${state.personal.name || "CV Report"}`,
          content,
        }),
      });

      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          firstName: state.personal.name.split(" ")[0] || "",
          source: "CV Builder Download",
        }),
      }).catch(() => {});

      if (!emailRes.ok) {
        setError("Could not send your CV report. Please try again.");
        return;
      }

      localStorage.setItem("ia-email-subscribed", "1");
      setUnlocked(true);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setCaptureStatus("idle");
    }
  }

  async function handleJPEG() {
    setDownloading("jpeg");
    setError(null);
    try {
      await exportJPEG(state.personal.name);
    } catch (e) {
      setError("Failed to export JPEG. Please try again.");
      console.error(e);
    }
    setDownloading(null);
  }

  async function handlePDF() {
    setDownloading("pdf");
    setError(null);
    try {
      const { exportPDF } = await import("@/lib/export-pdf");
      await exportPDF(state.personal.name);
    } catch (e) {
      setError("Failed to export PDF. Please try again.");
      console.error(e);
    }
    setDownloading(null);
  }

  async function handleWord() {
    setDownloading("word");
    setError(null);
    try {
      const { exportWord } = await import("@/lib/export-word");
      await exportWord(state);
    } catch (e) {
      setError("Failed to export Word document. Please try again.");
      console.error(e);
    }
    setDownloading(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          x
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {unlocked ? "Download Your CV" : "Email your CV report"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {unlocked
            ? "Choose your preferred format. All formats are free during our launch period."
            : "We will send your score report and improvement checklist, then unlock JPEG, PDF, and Word downloads."}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {!unlocked ? (
          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={captureStatus === "loading"}
              className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              {captureStatus === "loading"
                ? "Sending report..."
                : "Email My Report & Unlock Downloads"}
            </button>
            <p className="text-xs text-gray-400 text-center">
              No spam. Weekly career tips only. Unsubscribe anytime.
            </p>
          </form>
        ) : (
        <div className="space-y-3">
          {/* JPEG - Free */}
          <button
            onClick={handleJPEG}
            disabled={downloading === "jpeg"}
            className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-green-400 transition-colors group"
          >
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  JPEG Image
                </span>
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  FREE
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Quick preview image. Great for sharing on social media.
              </p>
            </div>
            <span className="text-green-600 group-hover:text-green-700 font-medium">
              {downloading === "jpeg" ? "Exporting..." : "Download"}
            </span>
          </button>

          {/* PDF - Free */}
          <button
            onClick={handlePDF}
            disabled={downloading === "pdf"}
            className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-green-400 transition-colors group"
          >
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  PDF Document
                </span>
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  FREE
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                ATS-friendly format. Recommended for job applications.
              </p>
            </div>
            <span className="text-green-600 group-hover:text-green-700 font-medium">
              {downloading === "pdf" ? "Exporting..." : "Download"}
            </span>
          </button>

          {/* Word - Free */}
          <button
            onClick={handleWord}
            disabled={downloading === "word"}
            className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-green-400 transition-colors group"
          >
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  Word Document
                </span>
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  FREE
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Editable .docx format. Easy to customise further.
              </p>
            </div>
            <span className="text-green-600 group-hover:text-green-700 font-medium">
              {downloading === "word" ? "Exporting..." : "Download"}
            </span>
          </button>
        </div>
        )}

        {unlocked && (
          <p className="text-xs text-gray-400 text-center mt-6">
            All formats are free during our launch period. Premium plans coming soon.
          </p>
        )}
      </div>
    </div>
  );
}
