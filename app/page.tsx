"use client";

import { LocaleProvider } from "@/lib/locale";
import { CVProvider } from "@/lib/state";
import CVBuilder from "@/components/CVBuilder";

export default function Home() {
  return (
    <LocaleProvider>
      <CVProvider>
        <CVBuilder />
      </CVProvider>
    </LocaleProvider>
  );
}
