"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import React from "react";
import { translations, type Locale } from "./i18n";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cv-locale");
      return saved && ["en", "ar", "hi", "ur", "tl"].includes(saved) ? saved as Locale : "en";
    }
    return "en";
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("cv-locale", newLocale);
    document.documentElement.dir = newLocale === "ar" || newLocale === "ur" ? "rtl" : "ltr";
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[locale][key] || translations["en"][key] || key;
    },
    [locale]
  );

  const dir = locale === "ar" || locale === "ur" ? "rtl" : "ltr";

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
