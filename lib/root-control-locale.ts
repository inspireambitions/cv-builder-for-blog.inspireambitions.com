"use client";

import { useSyncExternalStore } from "react";
import { UI_LOCALES, resolveUILocale } from "./locale-coverage";
import { sharedUtilityControlTranslations } from "./locales/shared-utility-controls";

function observeLanguage(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return () => observer.disconnect();
}

function documentLanguage() {
  return resolveUILocale(document.documentElement.lang, UI_LOCALES);
}

// Follow the builder's language without loading its dictionary up front.
export function useRootControlLocale() {
  const locale = useSyncExternalStore(observeLanguage, documentLanguage, () => "en" as const);
  return {
    locale,
    dir: locale === "ar" || locale === "ur" ? "rtl" : "ltr",
    t: (key: string) => sharedUtilityControlTranslations[locale][key] ?? sharedUtilityControlTranslations.en[key] ?? key,
  };
}
