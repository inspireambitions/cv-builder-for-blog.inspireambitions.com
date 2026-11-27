"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, useCallback } from "react";
import type { ReactNode } from "react";
import React from "react";
import { translations, type Locale } from "./i18n";
import { availableLanguages } from "./ui-languages";
import { formatUITranslation, resolveUILocale } from "./locale-coverage";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
}

const LocaleContext = createContext<LocaleContextValue | null>(null);
const localeEvent = "cv-interface-language-changed";
let localOverride: Locale | undefined;

function getLocale(): Locale {
  try {
    return localOverride ?? resolveUILocale(window.localStorage.getItem("cv-locale"), availableLanguages);
  } catch {
    return localOverride ?? "en";
  }
}

function subscribeLocale(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== "cv-locale") return;
    localOverride = undefined;
    onChange();
  };
  window.addEventListener(localeEvent, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(localeEvent, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore<Locale>(subscribeLocale, getLocale, () => "en");
  const dir = locale === "ar" || locale === "ur" ? "rtl" : "ltr";

  const setLocale = useCallback((newLocale: Locale) => {
    const allowed = resolveUILocale(newLocale, availableLanguages);
    try {
      window.localStorage.setItem("cv-locale", allowed);
      localOverride = undefined;
    } catch {
      localOverride = allowed;
    }
    window.dispatchEvent(new Event(localeEvent));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const t = useCallback(
    (key: string, values?: Record<string, string | number>): string => {
      const text = translations[locale][key] || translations["en"][key] || key;
      return formatUITranslation(text, values);
    },
    [locale]
  );

  return React.createElement(
    LocaleContext.Provider,
    { value: { locale, setLocale, t, dir } },
    children
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
