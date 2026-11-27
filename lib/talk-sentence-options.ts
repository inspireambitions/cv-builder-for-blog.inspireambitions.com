import { getTalkSentences } from "./role-suggestions";
import { roleLibraryTranslations } from "./locales/role-library";

// Display language must not silently change the CV's saved language.
// Only a deliberate candidate tap inserts this selected output sentence.
export function getTalkDutyOptions(familyKey: string, cvLanguage: string) {
  const output = cvLanguage === "ar" ? roleLibraryTranslations.ar : roleLibraryTranslations.en;
  return getTalkSentences(familyKey).flatMap((canonical, index) => {
    const key = `role.sentence.${familyKey}.${index}`;
    const value = output[key];
    return value ? [{ key, canonical, value }] : [];
  });
}
