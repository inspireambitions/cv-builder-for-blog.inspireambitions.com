"use client";

import { useState } from "react";
import { useCVState } from "@/lib/state";
import { exportJPEG } from "@/lib/export-jpeg";
import { trackToolEvent } from "@/lib/analytics";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DownloadFormat = "pdf" | "word" | "jpeg";

export default function DownloadModal({ isOpen, onClose }: DownloadModalProps) {
  const { state } = useCVState();
  const [downloading, setDownloading] = useState<DownloadFormat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMoreFormats, setShowMoreFormats] = useState(false);

  if (!isOpen) return null;

  async function runDownload(format: DownloadFormat) {
    setDownloading(format);
    setError(null);
    trackToolEvent("cv_download_started", { format });

    try {
      if (format === "pdf") {
        const { exportPDF } = await import("@/lib/export-pdf");
        await exportPDF(state);
      }
      if (format === "word") {
        const { exportWord } = await import("@/lib/export-word");
        await exportWord(state);
      }
      if (format === "jpeg") {
        await exportJPEG(state.personal.name);
      }
      trackToolEvent("cv_download_completed", { format });
    } catch (e) {
      setError("Download failed. Please try again.");
      console.error(e);
      trackToolEvent("cv_download_failed", { format });
    } finally {
      setDownloading(null);
    }
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
          className="absolute right-4 top-4 min-h-10 min-w-10 rounded-full text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close download dialog"
        >
          x
        </button>

        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
          Free. No signup. No watermark.
        </span>

        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Download Your CV
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Choose PDF for ATS systems or Word when you want an editable file.
          Both are free and available immediately.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            onClick={() => runDownload("pdf")}
            disabled={downloading !== null}
            className="w-full rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 text-left transition-colors hover:border-emerald-400 disabled:opacity-60"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  Download PDF
                </div>
                <p className="mt-0.5 text-sm text-gray-600">
                  ATS-safe, single-column, selectable text.
                </p>
              </div>
              <span className="text-sm font-semibold text-emerald-700">
                {downloading === "pdf" ? "Exporting..." : "Free"}
              </span>
            </div>
          </button>

          <button
            onClick={() => runDownload("word")}
            disabled={downloading !== null}
            className="w-full rounded-xl border-2 border-gray-200 p-4 text-left transition-colors hover:border-emerald-400 disabled:opacity-60"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  Download Word (.docx)
                </div>
                <p className="mt-0.5 text-sm text-gray-600">
                  Editable in Microsoft Word and Google Docs.
                </p>
              </div>
              <span className="text-sm font-semibold text-emerald-700">
                {downloading === "word" ? "Exporting..." : "Free"}
              </span>
            </div>
          </button>

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
              className="w-full rounded-xl border border-gray-200 p-4 text-left transition-colors hover:border-gray-300 disabled:opacity-60"
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
                  {downloading === "jpeg" ? "Exporting..." : "Download"}
                </span>
              </div>
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Your CV stays in your browser. No card, no forced signup, no watermark.
        </p>
      </div>
    </div>
  );
}
