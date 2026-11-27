import { authoredTranslations } from "./i18n";
import { availableUILocales } from "./locale-coverage";

export const languageOptions = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
  { value: "hi", label: "हिन्दी" },
  { value: "ur", label: "اردو" },
  { value: "tl", label: "Tagalog" },
] as const;

export const availableLanguages = availableUILocales(
  authoredTranslations,
  process.env.NEXT_PUBLIC_HIDDEN_LANGUAGES ?? "",
  process.env.NEXT_PUBLIC_VERCEL_ENV !== "production" && process.env.NEXT_PUBLIC_PREVIEW_DRAFT_LOCALES === "true",
);

export const visibleLanguageOptions = languageOptions.filter((option) => availableLanguages.includes(option.value));
