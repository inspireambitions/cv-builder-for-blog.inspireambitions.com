"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ThemeToggle from "@/components/shared/ThemeToggle";

const BuilderShell = dynamic(() => import("@/components/BuilderShell"));

export default function Home() {
  const [started, setStarted] = useState(false);
  const [resumeExisting, setResumeExisting] = useState(false);

  useEffect(() => {
    const hasDraft = Boolean(localStorage.getItem("inspireambitions-cv-state"));
    const hasResumeLink = window.location.hash.startsWith("#resume=");
    if (hasDraft || hasResumeLink) {
      setResumeExisting(true);
      setStarted(true);
    }
  }, []);

  if (started) return <BuilderShell startImmediately={!resumeExisting} />;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <a href="https://inspireambitions.com" className="text-lg font-bold text-navy-700">
            Inspire Ambitions
          </a>
          <ThemeToggle />
        </div>
      </header>
      <section className="mx-auto flex min-h-[72vh] max-w-4xl flex-col items-center justify-center px-4 py-12 text-center">
        <p className="mb-4 text-sm font-semibold uppercase text-gold-700">Built by a Gulf HR Career Specialist</p>
        <h1 className="max-w-3xl text-4xl font-bold text-gray-950 sm:text-5xl">Build a stronger GCC CV for free</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">
          Create, tailor and export a recruiter-ready CV. No card, no trial and no surprise payment.
        </p>
        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => setStarted(true)} className="min-h-12 bg-gold-600 px-6 py-3 font-semibold text-white hover:bg-gold-700">
            Build My CV
          </button>
          <button type="button" onClick={() => setStarted(true)} className="min-h-12 border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900 hover:bg-gray-50">
            Upload &amp; Tailor to a Job
          </button>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-gray-600">
          <span>Free forever</span><span>No credit card</span><span>GCC-ready</span><span>Private by design</span>
        </div>
        <div className="mt-10 w-48 bg-white p-4 text-start shadow-raised" aria-label="Fictional sample CV preview">
          <p className="mb-3 text-xs font-semibold text-gray-700">Fictional sample CV</p>
          <div className="mb-2 h-2 w-3/4 bg-navy-700" aria-hidden="true" />
          <div className="mb-4 h-1.5 w-1/2 bg-gray-300" aria-hidden="true" />
          <div className="mb-2 h-1.5 w-full bg-gray-200" aria-hidden="true" />
          <div className="mb-2 h-1.5 w-5/6 bg-gray-200" aria-hidden="true" />
          <div className="h-1.5 w-2/3 bg-gray-200" aria-hidden="true" />
        </div>
      </section>
    </main>
  );
}
