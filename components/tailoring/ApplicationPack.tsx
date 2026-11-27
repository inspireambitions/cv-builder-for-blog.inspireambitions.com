"use client";

import { useState } from "react";
import type { TailoringResult } from "@/lib/tailoring-types";
import { trackToolEvent } from "@/lib/analytics";
import { useLocale } from "@/lib/locale";

type Pack = {
  coverLetter: string;
  recruiterEmail: string;
  linkedinMessage: string;
  interviewQuestions: string[];
  starPrompts: Array<{ question: string; evidenceIds: string[]; bridgeAdvice: string }>;
};

export default function ApplicationPack({
  result,
  jobTitle,
  company,
  jobDescription,
}: {
  result: TailoringResult;
  jobTitle: string;
  company: string;
  jobDescription: string;
}) {
  const { locale, t } = useLocale();
  const [pack, setPack] = useState<Pack | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ serverMessage?: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/application-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          final: result.review.final,
          evidence: result.evidence,
          jobTitle,
          company,
          jobDescription,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError({ serverMessage: typeof payload.error === "string" && payload.error ? payload.error : undefined });
        return;
      }
      setPack(payload as Pack);
      trackToolEvent("cv_application_pack_created", { surface: "score_workspace" });
    } catch {
      setError({});
    } finally {
      setLoading(false);
    }
  }

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1800);
  }

  if (!pack) {
    return (
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-lg font-bold text-gray-950">{t("pack.completeTitle")}</h4>
        <p className="mt-2 text-sm leading-6 text-gray-600">{t("pack.intro")}</p>
        {error && <p lang={error.serverMessage ? "en" : undefined} dir="auto" role="alert" className="mt-3 border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error.serverMessage ?? t("pack.failed")}</p>}
        <button type="button" onClick={generate} disabled={loading} className="mt-4 min-h-12 bg-gray-950 px-5 text-sm font-semibold text-white hover:bg-gray-800 disabled:bg-gray-400">
          {t(loading ? "pack.building" : "pack.build")}
        </button>
      </div>
    );
  }

  const sections = [
    ["pack.coverLetter", pack.coverLetter],
    ["pack.recruiterEmail", pack.recruiterEmail],
    ["pack.linkedinMessage", pack.linkedinMessage],
  ] as const;
  return (
    <div className="border-t border-gray-200 pt-6">
      <h4 className="text-lg font-bold text-gray-950">{t("pack.title")}</h4>
      {locale !== "en" && <p className="mt-2 text-sm text-gray-600">{t("pack.englishContent")}</p>}
      <div className="mt-4 divide-y divide-gray-200 border-y border-gray-200">
        {sections.map(([label, value]) => (
          <section key={label} className="py-5">
            <div className="flex items-center justify-between gap-4">
              <h5 className="text-sm font-bold uppercase tracking-wide text-gray-500">{t(label)}</h5>
              <button type="button" onClick={() => copy(label, value)} className="min-h-10 border border-gray-300 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50">{t(copied === label ? "pack.copied" : "pack.copy")}</button>
            </div>
            <p lang="en" dir="auto" className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-800">{value}</p>
          </section>
        ))}
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section>
          <h5 className="text-sm font-bold uppercase tracking-wide text-gray-500">{t("pack.interview")}</h5>
          <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-6 text-gray-800">
            {pack.interviewQuestions.map((question) => <li key={question} lang="en" dir="auto">{question}</li>)}
          </ol>
        </section>
        <section>
          <h5 className="text-sm font-bold uppercase tracking-wide text-gray-500">{t("pack.star")}</h5>
          <div className="mt-3 divide-y divide-gray-200 border-y border-gray-200">
            {pack.starPrompts.map((prompt) => (
              <div key={prompt.question} className="py-3 text-sm">
                <p lang="en" dir="auto" className="font-semibold text-gray-900">{prompt.question}</p>
                <p lang="en" dir="auto" className="mt-1 leading-6 text-gray-600">{prompt.bridgeAdvice}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
