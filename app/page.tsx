"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { removeShareTrackingParams } from "@/lib/clean-url";

const BuilderShell = dynamic(() => import("@/components/BuilderShell"));

export default function Home() {
  const [started, setStarted] = useState(false);
  const [resumeExisting, setResumeExisting] = useState(false);

  useEffect(() => {
    const hasDraft = Boolean(localStorage.getItem("inspireambitions-cv-state"));
    const hasResumeLink = window.location.hash.startsWith("#resume=");
    const hasHandoff = new URLSearchParams(window.location.search).has("handoff");
    removeShareTrackingParams();
    if (hasDraft || hasResumeLink || hasHandoff) {
      queueMicrotask(() => {
        setResumeExisting(true);
        setStarted(true);
      });
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
      <section className="border-t border-gray-200 bg-white py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
          <div>
            <h2 className="text-xl font-bold text-gray-950">Built for Gulf applications</h2>
            <p className="mt-3 leading-relaxed text-gray-600">Capture the details Gulf recruiters expect, including location, notice period, visa status, nationality, languages and relevant licences.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-950">Evidence before polish</h2>
            <p className="mt-3 leading-relaxed text-gray-600">Tailoring uses the facts already in your CV. Unsupported claims and invented achievements are rejected before a reviewed version can be applied.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-950">Useful exports, no trap</h2>
            <p className="mt-3 leading-relaxed text-gray-600">Build without an account or card. JPEG remains anonymous, while free PDF and editable Word downloads ask for an email once per device.</p>
          </div>
        </div>
      </section>
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-2xl font-bold text-gray-950">From first draft to a job-ready CV</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            <li className="border-s-4 border-gold-600 ps-4"><strong className="block text-gray-950">1. Add your evidence</strong><span className="mt-1 block text-sm text-gray-600">Start fresh or upload an existing CV.</span></li>
            <li className="border-s-4 border-gold-600 ps-4"><strong className="block text-gray-950">2. Tailor carefully</strong><span className="mt-1 block text-sm text-gray-600">Match your real experience to a vacancy.</span></li>
            <li className="border-s-4 border-gold-600 ps-4"><strong className="block text-gray-950">3. Review and export</strong><span className="mt-1 block text-sm text-gray-600">Check the score, preview the CV and choose your format.</span></li>
          </ol>
        </div>
      </section>
      <footer className="border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-600">
        <p>Built by a practising Gulf HR Career Specialist. Your CV draft stays in your browser unless you choose a server-assisted feature.</p>
        <p className="mt-3"><Link href="/why-free" className="font-semibold underline">Why it is free</Link> · <Link href="/vs/zety" className="font-semibold underline">Compare CV builders</Link></p>
      </footer>
    </main>
  );
}
