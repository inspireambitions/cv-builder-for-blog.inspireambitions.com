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
    <label className="sr-only" htmlFor="ui-language">
      Interface language
      <select
        id="ui-language"
        aria-label="Interface language"
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="not-sr-only min-h-10 rounded-lg border border-gray-300 bg-white px-2 text-sm font-medium text-gray-800"
      >
        {OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
