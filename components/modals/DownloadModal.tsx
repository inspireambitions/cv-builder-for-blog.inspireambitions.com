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

  async function handleJPEG() {
    setDownloading("jpeg");
    setError(null);
    try {
      await exportJPEG();
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
          Download Your CV
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Choose your preferred format. All formats are free during our launch period.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

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

        <p className="text-xs text-gray-400 text-center mt-6">
          All formats are free during our launch period. Premium plans coming soon.
        </p>
      </div>
    </div>
  );
}
