"use client";

import { useMemo, useState } from "react";
import { useCVState } from "@/lib/state";
import { trackToolEvent } from "@/lib/analytics";
import type { TailoringResult } from "@/lib/tailoring-types";
import ApplicationPack from "@/components/tailoring/ApplicationPack";
import OutcomeFeedback from "@/components/tailoring/OutcomeFeedback";
import { computeGulfMatchScore } from "@/lib/gulf-match";

type View = "closed" | "input" | "running" | "result";

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
      lastError = caught instanceof Error ? caught : new Error("Tailoring failed. Please try again.");
      if (attempt === 2) throw lastError;
      await wait(1_500 * (attempt + 1));
      continue;
    }
    const payload = await response.json();
    if (response.ok) return payload as TailoringResult;
    const fallback = response.status === 429 || response.status === 503
      ? "The review service is busy. Your CV is safe and unchanged. Please wait, then try again."
      : "The review could not finish. Your CV is safe and unchanged. Please try again.";
    lastError = new Error(payload.error || fallback);
    if (response.status !== 503 || attempt === 2) throw lastError;
    await wait(1_500 * (attempt + 1));
  }
  throw lastError ?? new Error("Tailoring failed. Please try again.");
}

function statusStyle(status: "supported" | "partial" | "gap") {
  if (status === "supported") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (status === "partial") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-red-50 text-red-800 border-red-200";
}

export default function TailorWorkspace() {
  const { state, setState, goToStep } = useCVState();
  const [view, setView] = useState<View>("closed");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<TailoringResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const deterministicMatch = useMemo(() => computeGulfMatchScore(state, jobDescription, jobTitle), [state, jobDescription, jobTitle]);

  async function runTailoring() {
    setError(null);
    if (jobDescription.trim().length < 120) {
      setError("Paste at least 120 characters from the vacancy.");
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
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Tailoring failed. Please try again.");
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
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">Premium beta</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-950">Tailor this CV to a UAE job</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            Paste a real vacancy. Grok drafts the targeted version, Sonnet reviews it, and the evidence gate blocks unsupported claims before you can apply the changes.
          </p>
          <button
            type="button"
            onClick={() => setView("input")}
            className="mt-6 min-h-12 bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Tailor to a Job
          </button>
        </div>
      </section>
    );
  }

  if (view === "running") {
    return (
      <section className="border-y border-gray-200 bg-white px-4 py-12 text-center" aria-live="polite">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gold-500" />
        <h3 className="mt-5 text-xl font-bold text-gray-950">Your agency review is running</h3>
        <p className="mt-2 text-sm text-gray-600">Drafting, reviewing and checking every claim against your CV evidence.</p>
        <p className="mt-2 text-xs text-gray-500">This usually takes 30 to 90 seconds. During high demand, we may ask you to retry without changing your CV.</p>
      </section>
    );
  }

  if (view === "input") {
    return (
      <section className="border-y border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">Target vacancy</p>
            <h3 className="mt-2 text-2xl font-bold text-gray-950">What role are you applying for?</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">Use the full vacancy text. Requirements and genuine gaps are easier to judge with complete information.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-gray-800">
              Job title <span className="font-normal text-gray-500">(optional)</span>
              <input
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                className="mt-2 min-h-12 w-full border border-gray-300 bg-white px-3 font-normal outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
                placeholder="e.g. Front Office Manager"
              />
            </label>
            <label className="text-sm font-semibold text-gray-800">
              Company <span className="font-normal text-gray-500">(optional)</span>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="mt-2 min-h-12 w-full border border-gray-300 bg-white px-3 font-normal outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
                placeholder="e.g. Jumeirah Group"
              />
            </label>
          </div>
          <label className="block text-sm font-semibold text-gray-800">
            Full job description
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={12}
              className="mt-2 w-full resize-y border border-gray-300 bg-white px-3 py-3 font-normal leading-6 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
              placeholder="Paste the vacancy responsibilities, requirements and preferred qualifications here."
            />
          </label>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Your CV remains in this browser. Only the data needed for this review is sent to the AI providers.</span>
            <span>{jobDescription.length.toLocaleString()} / 30,000</span>
          </div>
          {error && <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setView("closed")} className="min-h-12 border border-gray-300 px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="button" onClick={runTailoring} className="min-h-12 bg-gray-950 px-6 text-sm font-semibold text-white hover:bg-gray-800">Run Premium Review</button>
          </div>
        </div>
      </section>
    );
  }

  if (!result) return null;
  const final = result.review.final;
  return (
    <section className="border-y border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">Agency review complete</p>
            <h3 className="mt-2 text-2xl font-bold text-gray-950">{final.roleTitle || jobTitle || "Tailored CV"}{final.company ? ` at ${final.company}` : ""}</h3>
            <p className="mt-2 text-sm text-gray-600">Drafted by {result.draftProvider}; reviewed by {result.reviewProvider}.</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-950">{deterministicMatch.score}</span>
            <span className="text-sm text-gray-500">/100 Gulf Match</span>
          </div>
        </div>

        <div className="border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h4 className="font-bold text-gray-950">{deterministicMatch.verdict}</h4><p className="mt-1 text-sm text-gray-600">The score is calculated in code. The same CV and vacancy always return the same result.</p></div>
            <div className="text-xs text-gray-600">Skills {deterministicMatch.components.skills}/40 · Role {deterministicMatch.components.title}/15 · GCC {deterministicMatch.components.gcc}/15 · ATS {deterministicMatch.components.ats}/10</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="GCC compliance">
            {deterministicMatch.compliance.map((item) => <span key={item.label} className={`border px-2 py-1 text-xs font-semibold ${item.met ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{item.met ? "Ready" : "Missing"}: {item.label}</span>)}
          </div>
        </div>

        {deterministicMatch.gaps.length > 0 && (
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500">Prioritised match gaps</h4>
            <div className="mt-3 divide-y divide-gray-200 border-y border-gray-200">
              {deterministicMatch.gaps.slice(0, 8).map((gap) => (
                <div key={gap.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-sm font-semibold text-gray-900">{gap.label}</p><p className="mt-1 text-sm text-gray-600">{gap.reason}</p></div>
                  <button type="button" onClick={() => { const steps = { personal: 2, summary: 3, experience: 4, education: 5, skills: 6 }; goToStep(steps[gap.target]); }} className="min-h-10 shrink-0 border border-gray-300 px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50">Fix</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`border px-4 py-3 text-sm font-semibold ${result.integrity.passed ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`}>
          {result.integrity.passed
            ? `Evidence check passed. ${result.evidence.length} source facts protected this version.`
            : "Evidence check failed. This version cannot be applied."}
        </div>

        {!result.review.approved && (
          <div className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950" role="alert">
            The senior reviewer did not approve this version. It cannot be applied or used for an application pack. Review the notes, add stronger evidence to your CV, then run the review again.
          </div>
        )}

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500">Tailored summary</h4>
          <p className="mt-3 border-s-4 border-gold-500 ps-4 text-base leading-7 text-gray-800">{final.summary.text}</p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500">Requirement coverage</h4>
          <div className="mt-3 divide-y divide-gray-200 border-y border-gray-200">
            {final.requirements.map((requirement) => (
              <div key={requirement.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-gray-800">{requirement.text}</p>
                <span className={`w-fit shrink-0 border px-2 py-1 text-xs font-semibold capitalize ${statusStyle(requirement.status)}`}>{requirement.status}</span>
              </div>
            ))}
          </div>
        </div>

        {final.gaps.length > 0 && (
          <div className="border border-amber-200 bg-amber-50 p-4">
            <h4 className="text-sm font-bold text-amber-950">Genuine gaps kept visible</h4>
            <ul className="mt-2 list-disc space-y-1 ps-5 text-sm leading-6 text-amber-900">
              {final.gaps.map((gap) => <li key={gap}>{gap}</li>)}
            </ul>
          </div>
        )}

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500">Selected skills</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {final.skills.map((skill) => <span key={skill.name} className="border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-800">{skill.name}</span>)}
          </div>
        </div>

        {result.review.warnings.length > 0 && (
          <div className="border-t border-gray-200 pt-5">
            <h4 className="text-sm font-bold text-gray-900">Senior reviewer notes</h4>
            <ul className="mt-2 list-disc space-y-1 ps-5 text-sm leading-6 text-gray-600">
              {result.review.warnings.map((warning) => <li key={warning}>{warning}</li>)}
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
          <button type="button" onClick={() => setView("input")} className="min-h-12 border border-gray-300 px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Change Vacancy</button>
          <button
            type="button"
            onClick={applyTailoredVersion}
            disabled={!result.integrity.passed || !result.review.approved || applied}
            className="min-h-12 bg-gold-500 px-6 text-sm font-semibold text-white hover:bg-gold-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {applied ? "Tailored Version Applied" : result.review.approved ? "Apply to My CV" : "Review Not Approved"}
          </button>
        </div>
      </div>
    </section>
  );
}
