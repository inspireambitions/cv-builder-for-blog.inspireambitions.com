"use client";

import { useLocale } from "@/lib/locale";
import type { Locale } from "@/lib/i18n";
import { visibleLanguageOptions } from "@/lib/ui-languages";

export default function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  return (
    <>
      <label className="sr-only" htmlFor="ui-language">{t("header.language")}</label>
      <select
        id="ui-language"
        aria-label={t("header.language")}
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="min-h-12 max-w-24 rounded-lg border border-[#b99b45] bg-white px-2 text-sm font-medium text-[#1a2744] sm:max-w-none"
      >
        {visibleLanguageOptions.map((option) => <option key={option.value} value={option.value} lang={option.value}>{option.label}</option>)}
      </select>
    </>
  );
}
