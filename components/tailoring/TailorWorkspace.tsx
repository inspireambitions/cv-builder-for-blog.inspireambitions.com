"use client";

import { useMemo, useState } from "react";
import { useCVState } from "@/lib/state";
import { trackToolEvent } from "@/lib/analytics";
import type { TailoringResult } from "@/lib/tailoring-types";
import ApplicationPack from "@/components/tailoring/ApplicationPack";
import OutcomeFeedback from "@/components/tailoring/OutcomeFeedback";
import { computeGulfMatchScore } from "@/lib/gulf-match";
import { useLocale } from "@/lib/locale";

type View = "closed" | "input" | "running" | "result";
const tailorError = { minimum: "tailor.minimum", failed: "tailor.failed" } as const;

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function requestTailoring(body: string) {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let response: Response;
    try {
      response = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
    } catch (caught) {
      lastError = caught instanceof Error ? caught : new Error("We could not match this job. Try again.");
      if (attempt === 2) throw lastError;
      await wait(1_500 * (attempt + 1));
      continue;
    }
    const payload = await response.json();
    if (response.ok) return payload as TailoringResult;
    const fallback = response.status === 429 || response.status === 503
      ? "The review service is busy. Your CV is safe and unchanged. Please wait, then try again."
      : "The review could not finish. Your CV is safe and unchanged. Please try again.";
    lastError = new Error(fallback);
    if (response.status !== 503 || attempt === 2) throw lastError;
    await wait(1_500 * (attempt + 1));
  }
  throw lastError ?? new Error("We could not match this job. Try again.");
}

function statusStyle(status: "supported" | "partial" | "gap") {
  if (status === "supported") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (status === "partial") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-red-50 text-red-800 border-red-200";
}

export default function TailorWorkspace() {
  const { state, setState, goToStep } = useCVState();
  const { locale, t } = useLocale();
  const [view, setView] = useState<View>("closed");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<TailoringResult | null>(null);
  const [error, setError] = useState<(typeof tailorError)[keyof typeof tailorError] | null>(null);
  const [applied, setApplied] = useState(false);
  const deterministicMatch = useMemo(() => computeGulfMatchScore(state, jobDescription, jobTitle), [state, jobDescription, jobTitle]);

  async function runTailoring() {
    setError(null);
    if (jobDescription.trim().length < 120) {
      setError(tailorError.minimum);
      return;
    }
    setView("running");
    trackToolEvent("cv_tailoring_started", { surface: "score_workspace" });
    try {
      const payload = await requestTailoring(
        JSON.stringify({ cvData: state, jobTitle, company, jobDescription })
      );
      setResult(payload);
      setView("result");
      trackToolEvent("cv_tailoring_completed", {
        surface: "score_workspace",
        format: payload.integrity?.passed ? "evidence_passed" : "evidence_failed",
      });
    } catch {
      setError(tailorError.failed);
      setView("input");
      trackToolEvent("cv_tailoring_failed", { surface: "score_workspace" });
    }
  }

  function applyTailoredVersion() {
    if (!result?.integrity.passed || !result.review.approved) return;
    const final = result.review.final;
    const byExperience = new Map(final.experience.map((entry) => [entry.experienceId, entry]));
    setState((current) => ({
      ...current,
      summary: final.summary.text,
      skills: final.skills.map((skill) => skill.name),
      experience: current.experience.map((entry) => {
        const tailored = byExperience.get(entry.id);
        return tailored
          ? { ...entry, description: tailored.bullets.map((bullet) => bullet.text).join("\n") }
          : entry;
      }),
      score: null,
    }));
    setApplied(true);
    trackToolEvent("cv_tailoring_applied", { surface: "score_workspace" });
  }

  if (view === "closed") {
    return (
      <section className="border-y border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="mt-2 text-2xl font-bold text-gray-950">{t("tailor.entry")}</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            {t("tailor.intro")}
          </p>
          <button
            type="button"
            onClick={() => setView("input")}
            className="mt-6 min-h-12 bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            {t("tailor.entry")}
          </button>
        </div>
      </section>
    );
  }

  if (view === "running") {
    return (
      <section className="border-y border-gray-200 bg-white px-4 py-12 text-center" aria-live="polite">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gold-500" />
        <h3 className="mt-5 text-xl font-bold text-gray-950">{t("tailor.runningTitle")}</h3>
        <p className="mt-2 text-sm text-gray-600">{t("tailor.runningIntro")}</p>
        <p className="mt-2 text-xs text-gray-500">{t("tailor.runningTiming")}</p>
      </section>
    );
  }

  if (view === "input") {
    return (
      <section className="border-y border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{t("tailor.target")}</p>
            <h3 className="mt-2 text-2xl font-bold text-gray-950">{t("tailor.roleQuestion")}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">{t("tailor.vacancyIntro")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-gray-800">
              {t("tailor.jobTitle")} <span className="font-normal text-gray-500">{t("tailor.optional")}</span>
              <input
                dir="auto"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                className="mt-2 min-h-12 w-full border border-gray-300 bg-white px-3 font-normal outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
                placeholder={t("tailor.jobExample")}
              />
            </label>
            <label className="text-sm font-semibold text-gray-800">
              {t("tailor.company")} <span className="font-normal text-gray-500">{t("tailor.optional")}</span>
              <input
                dir="auto"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="mt-2 min-h-12 w-full border border-gray-300 bg-white px-3 font-normal outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
                placeholder={t("tailor.companyExample")}
              />
            </label>
          </div>
          <label className="block text-sm font-semibold text-gray-800">
            {t("tailor.description")}
            <textarea
              dir="auto"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={12}
              className="mt-2 w-full resize-y border border-gray-300 bg-white px-3 py-3 font-normal leading-6 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
              placeholder={t("tailor.descriptionExample")}
            />
          </label>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{t("tailor.privacy")}</span>
            <span>{t("tailor.characters", { used: jobDescription.length.toLocaleString(locale), limit: (30000).toLocaleString(locale) })}</span>
          </div>
          {error && <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{t(error)}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setView("closed")} className="min-h-12 border border-gray-300 px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50">{t("tailor.cancel")}</button>
            <button type="button" onClick={runTailoring} className="min-h-12 bg-gray-950 px-6 text-sm font-semibold text-white hover:bg-gray-800">{t("tailor.check")}</button>
          </div>
        </div>
      </section>
    );
  }

  if (!result) return null;
  const final = result.review.final;
  const role = final.roleTitle || jobTitle || t("tailor.matchedCV");
  return (
    <section className="border-y border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{t("tailor.completed")}</p>
            <h3 dir="auto" className="mt-2 text-2xl font-bold text-gray-950">{final.company ? t("tailor.roleAt", { role, company: final.company }) : role}</h3>
            <p className="mt-2 text-sm text-gray-600">{t("tailor.reviewChanges")}</p>
            {locale !== "en" && <p className="mt-2 text-sm text-gray-600">{t("tailor.englishReview")}</p>}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-950">{deterministicMatch.score}</span>
            <span className="text-sm text-gray-500">{t("tailor.matchUnit")}</span>
          </div>
        </div>

        <div className="border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h4 lang="en" dir="auto" className="font-bold text-gray-950">{deterministicMatch.verdict}</h4><p className="mt-1 text-sm text-gray-600">{t("tailor.scoreMethod")}</p></div>
            <div className="text-xs text-gray-600">{t("tailor.breakdown", { skills: deterministicMatch.components.skills, role: deterministicMatch.components.title, gcc: deterministicMatch.components.gcc, ats: deterministicMatch.components.ats })}</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" aria-label={t("tailor.gccCompliance")}>
            {deterministicMatch.compliance.map((item) => <span key={item.label} className={`border px-2 py-1 text-xs font-semibold ${item.met ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{t(item.met ? "tailor.ready" : "tailor.missing")}: <bdi lang="en">{item.label}</bdi></span>)}
          </div>
        </div>

        {deterministicMatch.gaps.length > 0 && (
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500">{t("tailor.prioritisedGaps")}</h4>
            <div className="mt-3 divide-y divide-gray-200 border-y border-gray-200">
              {deterministicMatch.gaps.slice(0, 8).map((gap) => (
                <div key={gap.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><p dir="auto" className="text-sm font-semibold text-gray-900">{gap.label}</p><p lang="en" dir="auto" className="mt-1 text-sm text-gray-600">{gap.reason}</p></div>
                  <button type="button" onClick={() => { const steps = { personal: 1, summary: 5, experience: 2, education: 3, skills: 4 }; goToStep(steps[gap.target]); }} className="min-h-10 shrink-0 border border-gray-300 px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50">{t("tailor.fix")}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`border px-4 py-3 text-sm font-semibold ${result.integrity.passed ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`}>
          {result.integrity.passed
            ? t("tailor.evidencePassed", { count: result.evidence.length })
            : t("tailor.evidenceFailed")}
        </div>

        {!result.review.approved && (
          <div className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950" role="alert">
            {t("tailor.notApproved")}
          </div>
        )}

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500">{t("tailor.updatedProfile")}</h4>
          <p lang="en" dir="auto" className="mt-3 border-s-4 border-gold-500 ps-4 text-base leading-7 text-gray-800">{final.summary.text}</p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500">{t("tailor.requirements")}</h4>
          <div className="mt-3 divide-y divide-gray-200 border-y border-gray-200">
            {final.requirements.map((requirement) => (
              <div key={requirement.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p dir="auto" className="text-sm leading-6 text-gray-800">{requirement.text}</p>
                <span className={`w-fit shrink-0 border px-2 py-1 text-xs font-semibold capitalize ${statusStyle(requirement.status)}`}>{t(`tailor.status.${requirement.status}`)}</span>
              </div>
            ))}
          </div>
        </div>

        {final.gaps.length > 0 && (
          <div className="border border-amber-200 bg-amber-50 p-4">
            <h4 className="text-sm font-bold text-amber-950">{t("tailor.genuineGaps")}</h4>
            <ul className="mt-2 list-disc space-y-1 ps-5 text-sm leading-6 text-amber-900">
              {final.gaps.map((gap) => <li key={gap} dir="auto">{gap}</li>)}
            </ul>
          </div>
        )}

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500">{t("tailor.skills")}</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {final.skills.map((skill) => <bdi key={skill.name} className="border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-800">{skill.name}</bdi>)}
          </div>
        </div>

        {result.review.warnings.length > 0 && (
          <div className="border-t border-gray-200 pt-5">
            <h4 className="text-sm font-bold text-gray-900">{t("tailor.notes")}</h4>
            <ul className="mt-2 list-disc space-y-1 ps-5 text-sm leading-6 text-gray-600">
              {result.review.warnings.map((warning) => <li key={warning} lang="en" dir="auto">{warning}</li>)}
            </ul>
          </div>
        )}

        {result.review.approved && (
          <>
            <ApplicationPack
              result={result}
              jobTitle={jobTitle}
              company={company}
              jobDescription={jobDescription}
            />
            <OutcomeFeedback />
          </>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-between">
          <button type="button" onClick={() => setView("input")} className="min-h-12 border border-gray-300 px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50">{t("tailor.changeVacancy")}</button>
          <button
            type="button"
            onClick={applyTailoredVersion}
            disabled={!result.integrity.passed || !result.review.approved || applied}
            className="min-h-12 bg-gold-500 px-6 text-sm font-semibold text-white hover:bg-gold-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {t(applied ? "tailor.applied" : result.review.approved ? "tailor.apply" : "tailor.rejected")}
          </button>
        </div>
      </div>
    </section>
  );
}
