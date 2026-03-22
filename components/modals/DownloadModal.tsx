"use client";

import { useState } from "react";
import { useCVState } from "@/lib/state";
import { exportJPEG } from "@/lib/export-jpeg";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadModal({ isOpen, onClose }: DownloadModalProps) {
  const { state } = useCVState();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAnnual = state.plan === "annual";

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
    if (!isAnnual && state.plan !== "payg") {
      // Trigger payment flow
      try {
        const res = await fetch("/api/stripe-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceType: "pdf" }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } catch {
        setError("Payment service unavailable. Please try again later.");
      }
      return;
    }
    // Direct export for annual/paid users
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
    if (!isAnnual && state.plan !== "payg") {
      try {
        const res = await fetch("/api/stripe-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceType: "word" }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } catch {
        setError("Payment service unavailable. Please try again later.");
      }
      return;
    }
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
      {/* Backdrop */}
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
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Download Your CV
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Choose your preferred format. JPEG is always free.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {/* JPEG — Free */}
          <button
            onClick={handleJPEG}
            disabled={downloading === "jpeg"}
            className="w-full flex items-center justify-between p-4 border-2 border-green-200 bg-green-50 rounded-xl hover:border-green-400 transition-colors group"
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
                High-resolution image. Perfect for sharing online.
              </p>
            </div>
            <span className="text-green-600 group-hover:text-green-700 font-medium">
              {downloading === "jpeg" ? "Exporting..." : "Download →"}
            </span>
          </button>

          {/* PDF */}
          <button
            onClick={handlePDF}
            disabled={downloading === "pdf"}
            className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-gold-400 transition-colors group"
          >
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  PDF Document
                </span>
                {isAnnual ? (
                  <span className="bg-gold-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    INCLUDED
                  </span>
                ) : (
                  <span className="bg-gray-800 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    $5
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                ATS-friendly format. Recommended for job applications.
              </p>
            </div>
            <span className="text-gold-600 group-hover:text-gold-700 font-medium">
              {downloading === "pdf"
                ? "Exporting..."
                : isAnnual
                ? "Download →"
                : "Pay & Download →"}
            </span>
          </button>

          {/* Word */}
          <button
            onClick={handleWord}
            disabled={downloading === "word"}
            className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-gold-400 transition-colors group"
          >
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  Word Document
                </span>
                {isAnnual ? (
                  <span className="bg-gold-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    INCLUDED
                  </span>
                ) : (
                  <span className="bg-gray-800 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    $5
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Editable .docx format. Easy to customize further.
              </p>
            </div>
            <span className="text-gold-600 group-hover:text-gold-700 font-medium">
              {downloading === "word"
                ? "Exporting..."
                : isAnnual
                ? "Download →"
                : "Pay & Download →"}
            </span>
          </button>
        </div>

        {/* Annual plan upsell */}
        {!isAnnual && (
          <div className="mt-6 p-4 bg-gold-500/5 border border-gold-500/20 rounded-xl">
            <p className="text-sm font-semibold text-gray-900">
              💡 Save with the Annual Plan — $86.40/year
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Unlimited PDF &amp; Word downloads, Cover Letter Generator, Mock
              Interview, 12 AI Roast credits. 10% cheaper than any competitor.
            </p>
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/stripe-checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ priceType: "annual" }),
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                } catch {
                  setError("Payment service unavailable.");
                }
              }}
              className="mt-3 bg-gold-500 hover:bg-gold-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Get Annual Plan →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
