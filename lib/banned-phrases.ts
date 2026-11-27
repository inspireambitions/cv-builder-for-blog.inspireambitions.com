export const BANNED_CV_PHRASES = [
  "results-driven", "detail-oriented", "dynamic", "passionate", "hardworking",
  "team player", "go-getter", "seasoned", "proven track record", "leverage",
  "synergy", "spearheaded", "utilise", "in a fast-paced environment",
  "strong work ethic", "think outside the box", "responsible for",
  "duties included", "i am", "my",
] as const;

function normalise(value: string) {
  return value.normalize("NFKC").toLowerCase()
    .replace(/[\u00ad\u200b-\u200d\ufeff]/g, "")
    .replace(/[\p{Dash_Punctuation}\s]+/gu, " ");
}

const patterns = BANNED_CV_PHRASES.map((phrase) => {
  const words = normalise(phrase);
  const spelling = phrase === "hardworking" ? "hard ?working"
    : phrase === "utilise" ? "utili[sz]e"
    : words;
  return { phrase, pattern: new RegExp(`(?:^|[^\\p{L}\\p{N}])${spelling}(?=$|[^\\p{L}\\p{N}])`, "u") };
});

export function findBannedCVPhrase(value: string) {
  const text = normalise(value);
  return patterns.find(({ pattern }) => pattern.test(text))?.phrase;
}

/** Remove introductory filler only. Leave unsafe rewrites to the candidate. */
export function cleanCVProse(value: string): string {
  if (!findBannedCVPhrase(value)) return value;
  const trimmed = value.trim().replace(/^(?:(?:i (?:am|was) |my )?responsible for|(?:my )?duties included)\s*:?\s+/i, "");
  return findBannedCVPhrase(trimmed) ? "" : trimmed;
}
