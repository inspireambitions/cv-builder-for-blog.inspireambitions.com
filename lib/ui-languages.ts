import { authoredTranslations } from "./i18n";
import { availableUILocales, type UILocale } from "./locale-coverage";

export const languageOptions = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
  { value: "hi", label: "हिन्दी" },
  { value: "ur", label: "اردو" },
  { value: "tl", label: "Tagalog" },
] as const;

const draftPreview = process.env.NEXT_PUBLIC_VERCEL_ENV !== "production" && process.env.NEXT_PUBLIC_PREVIEW_DRAFT_LOCALES === "true";
// Complete dictionaries alone do not prove that the interface uses them.
// Add a locale here only after the source audit and browser flow are green.
const reviewedInterfaceLocales: readonly UILocale[] = ["en"];

export const availableLanguages = availableUILocales(
  authoredTranslations,
  process.env.NEXT_PUBLIC_HIDDEN_LANGUAGES ?? "",
  draftPreview,
).filter((locale) => draftPreview || reviewedInterfaceLocales.includes(locale));

export const visibleLanguageOptions = languageOptions.filter((option) => availableLanguages.includes(option.value));
