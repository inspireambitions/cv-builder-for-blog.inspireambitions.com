import type { UILocale } from "./locale-coverage";
import { findBannedCVPhrase } from "./banned-phrases";

// This is a bounded catalogue, not a free-text translator. Add a row only
// after checking every source language against the complete English claim.
// Keep it separate from UI copy: ordinary edits to example text cannot
// authorise a translation or change what the line asserts.
type CatalogueLine = Readonly<Record<UILocale, string>>;
const catalogue = new Map<string, readonly CatalogueLine[]>([
  ["housekeeping", [
    {
      en: "Cleaned guest rooms.",
      ar: "نظّفت غرف الضيوف.",
      hi: "मेहमानों के कमरे साफ़ किए।",
      ur: "مہمانوں کے کمرے صاف کیے۔",
      tl: "Nilinis ang mga kuwarto ng bisita.",
    },
    {
      en: "Changed bed linen and towels.",
      ar: "غيّرت أغطية الأسرّة والمناشف.",
      hi: "बिस्तर की चादरें और तौलिये बदले।",
      ur: "بستر کی چادریں اور تولیے بدلے۔",
      tl: "Nagpalit ng sapin sa kama at mga tuwalya.",
    },
    {
      en: "Used cleaning products and equipment in line with safety instructions.",
      ar: "استخدمت مواد التنظيف والمعدات وفق تعليمات السلامة.",
      hi: "सफ़ाई के उत्पादों और उपकरणों का सुरक्षा निर्देशों के अनुसार इस्तेमाल किया।",
      ur: "صفائی کی مصنوعات اور آلات کو حفاظتی ہدایات کے مطابق استعمال کیا۔",
      tl: "Gumamit ng mga panlinis at kagamitan ayon sa mga tagubilin sa kaligtasan.",
    },
  ]],
]);

// Do not ignore script, diacritics, punctuation, compatibility characters or
// case. NFC only makes equivalent Unicode encodings compare the same way.
const hiddenFormatting = /[\u00AD\u061C\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/u;
const lineKey = (line: string) => line.trim().replace(/^[•*-][ \t]+/u, "").normalize("NFC");

export function getTalkTranslationExamples(familyKey: string, inputLang: Exclude<UILocale, "en">): string[] {
  return (catalogue.get(familyKey) ?? []).map((row) => row[inputLang]);
}

export function translateTalkCatalogueInput(
  familyKey: string,
  inputLang: Exclude<UILocale, "en">,
  source: string,
): { bullets: string[]; sourceLines: string[] } | null {
  const allowed = catalogue.get(familyKey);
  if (!allowed || hiddenFormatting.test(source)) return null;

  const translations = new Map<string, string | null>();
  for (const row of allowed) {
    const english = row.en;
    const local = row[inputLang];
    if (findBannedCVPhrase(english)) continue;
    if (!local || local === english || hiddenFormatting.test(local)) continue;
    const localKey = lineKey(local);
    const previous = translations.get(localKey);
    translations.set(localKey, previous === undefined || previous === english ? english : null);
  }

  const sourceLines = source.split(/\r\n|[\r\n\u2028\u2029]/u).map((line) => line.trim()).filter(Boolean);
  if (sourceLines.length === 0 || sourceLines.length > 5) return null;
  const bullets = new Set<string>();
  for (const line of sourceLines) {
    const english = translations.get(lineKey(line));
    // A single unmatched or duplicate line rejects the request as a whole;
    // never create a CV that omits part of what the candidate submitted.
    if (!english || bullets.has(english)) return null;
    bullets.add(english);
  }
  return { bullets: [...bullets], sourceLines };
}
