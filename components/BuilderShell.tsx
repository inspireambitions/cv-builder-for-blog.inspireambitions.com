"use client";

import { useEffect, useRef, useState } from "react";
import { LocaleProvider } from "@/lib/locale";
import { CVProvider, useCVState } from "@/lib/state";
import CVBuilder from "@/components/CVBuilder";

function StartedBuilder({ startImmediately }: { startImmediately: boolean }) {
  const { state, setState, goToStep, hydrated } = useCVState();
  const handoffChecked = useRef(false);
  const [handoffMessage, setHandoffMessage] = useState("");

  useEffect(() => {
    if (startImmediately && state.step === 0) goToStep(1);
  }, [goToStep, startImmediately, state.step]);

  useEffect(() => {
    if (!hydrated || handoffChecked.current) return;
    handoffChecked.current = true;
    const token = new URLSearchParams(window.location.search).get("handoff");
    if (!token) return;
    fetch("/api/handoff/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 410 ? "This CV handoff has expired." : "The CV handoff could not be verified.");
        return response.json() as Promise<{ role: string; country: string; tasks: string[] }>;
      })
      .then((data) => {
        setState((current) => ({
          ...current,
          step: Math.max(current.step, 3),
          personal: { ...current.personal, title: current.personal.title || data.role, location: current.personal.location || data.country },
          experience: [{ id: `risk-handoff-${Date.now()}`, role: data.role, company: "", companyDesc: "", location: data.country, dates: "", description: data.tasks.map((task) => `• ${task}`).join("\n"), gap: "" }, ...current.experience],
        }));
        setHandoffMessage("Your role and daily tasks were imported. Add evidence, numbers and employer details before exporting.");
        window.history.replaceState({}, "", window.location.pathname);
      })
      .catch((error: Error) => setHandoffMessage(error.message));
  }, [hydrated, setState]);

  return <><CVBuilder />{handoffMessage && <div className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 shadow-overlay" role="status"><p>{handoffMessage}</p><button type="button" className="mt-2 font-semibold underline" onClick={() => setHandoffMessage("")}>Dismiss</button></div>}</>;
}

export default function BuilderShell({ startImmediately = true }: { startImmediately?: boolean }) {
  return (
    <LocaleProvider>
      <CVProvider>
        <StartedBuilder startImmediately={startImmediately} />
      </CVProvider>
    </LocaleProvider>
  );
}
