"use client";

import { useLocale } from "@/lib/locale";
import type { Locale } from "@/lib/i18n";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
  { value: "hi", label: "हिन्दी" },
  { value: "ur", label: "اردو" },
  { value: "tl", label: "Tagalog" },
];

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <>
      <label className="sr-only" htmlFor="ui-language">Interface language</label>
      <select
        id="ui-language"
        aria-label="Interface language"
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="min-h-10 max-w-24 rounded-lg border border-[#b99b45] bg-white px-2 text-sm font-medium text-[#1a2744] sm:max-w-none"
      >
        {OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </>
  );
}
