"use client";

import { useEffect } from "react";
import { LocaleProvider } from "@/lib/locale";
import { CVProvider, useCVState } from "@/lib/state";
import CVBuilder from "@/components/CVBuilder";

function StartedBuilder() {
  const { state, goToStep } = useCVState();

  useEffect(() => {
    if (state.step === 0) goToStep(1);
  }, [goToStep, state.step]);

  return <CVBuilder />;
}

export default function BuilderShell() {
  return (
    <LocaleProvider>
      <CVProvider>
        <StartedBuilder />
      </CVProvider>
    </LocaleProvider>
  );
}
