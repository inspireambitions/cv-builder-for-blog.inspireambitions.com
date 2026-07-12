"use client";

import { useEffect } from "react";
import { LocaleProvider } from "@/lib/locale";
import { CVProvider, useCVState } from "@/lib/state";
import CVBuilder from "@/components/CVBuilder";

function StartedBuilder({ startImmediately }: { startImmediately: boolean }) {
  const { state, goToStep } = useCVState();

  useEffect(() => {
    if (startImmediately && state.step === 0) goToStep(1);
  }, [goToStep, startImmediately, state.step]);

  return <CVBuilder />;
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
