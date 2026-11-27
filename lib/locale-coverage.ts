export const UI_LOCALES = ["en", "ar", "hi", "ur", "tl"] as const;
export type UILocale = (typeof UI_LOCALES)[number];

export function formatUITranslation(text: string, values?: Record<string, string | number>): string {
  return values ? text.replace(/\{([a-zA-Z]+)\}/g, (match, name: string) =>
    values[name] === undefined ? match : `\u2068${String(values[name])}\u2069`) : text;
}

// Check the authored packs, not a dictionary filled with English fallback values.
export function missingLocaleKeys(
  source: Record<string, string>,
  pack: Record<string, string>,
): string[] {
  return Object.keys(source).filter((key) => !Object.hasOwn(pack, key) || !pack[key]?.trim());
}

export function availableUILocales(
  packs: Record<UILocale, Record<string, string>>,
  hiddenLanguages = "",
  previewDrafts = false,
): UILocale[] {
  const hidden = new Set(hiddenLanguages.split(",").map((value) => value.trim().toLowerCase()));
  // English remains the recovery language even if the setting includes it by mistake.
  return UI_LOCALES.filter((locale) => locale === "en" ||
    (!hidden.has(locale) && (previewDrafts || missingLocaleKeys(packs.en, packs[locale]).length === 0)));
}

export function resolveUILocale(value: unknown, available: readonly UILocale[]): UILocale {
  return typeof value === "string" && available.includes(value as UILocale) ? value as UILocale : "en";
}
