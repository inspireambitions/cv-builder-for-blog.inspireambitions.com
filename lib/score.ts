import type { CVState, ScoreResult, ScoreCriterion, ScoreLayer, ScoreLevel } from "./types";
import {
  ACTION_VERBS,
  QUANTIFIER_PATTERNS,
  VISA_PATTERNS,
  NOTICE_PERIOD_PATTERNS,
  DRIVING_LICENCE_PATTERNS,
  ARABIC_LANGUAGE_PATTERNS,
  GCC_CERTIFICATIONS,
  GCC_EMPLOYERS,
  GULF_INDUSTRY_KEYWORDS,
} from "./gulf-keywords";

/* ââ helpers ââ */

function level(score: number, max: number): ScoreLevel {
  const pct = score / max;
  if (pct >= 0.75) return "green";
  if (pct >= 0.4) return "amber";
  return "red";
}

function allText(state: CVState): string {
  const parts: string[] = [
    state.summary,
    state.personal.title,
    state.personal.location,
    ...state.experience.flatMap((e) => [e.role, e.company, e.companyDesc, e.location, e.description, e.gap]),
    ...state.education.flatMap((e) => [e.degree, e.institution]),
    ...state.certifications.flatMap((c) => [c.name, c.issuer]),
    ...state.skills,
    ...state.languages.map((l) => l.language),
    ...state.achievements.flatMap((a) => [a.title, a.body, a.awardingBody]),
    ...state.volunteer.flatMap((v) => [v.role, v.org, v.impact]),
    ...state.projects.flatMap((p) => [p.name, p.description, p.outcomes]),
    ...state.publications.flatMap((p) => [p.title, p.outlet]),
    ...state.memberships.flatMap((m) => [m.org, m.level]),
  ];
  return parts.join(" ").toLowerCase();
}

function experienceText(state: CVState): string {
  return state.experience
    .map((e) => [e.role, e.description, e.gap].join(" "))
    .join(" ")
    .toLowerCase();
}

function countPatternMatches(text: string, patterns: RegExp[]): number {
  let count = 0;
  for (const p of patterns) {
    const matches = text.match(new RegExp(p.source, p.flags + (p.flags.includes("g") ? "" : "g")));
    if (matches) count += matches.length;
  }
  return count;
}

function hasAnyPattern(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

/* ââââââââââââââââââââââââââââââââââââââââââ
   LAYER 1 : COMPLETENESS (30 pts)
   ââââââââââââââââââââââââââââââââââââââââââ */

function scoreContact(state: CVState): ScoreCriterion {
  const { name, email, phone, location } = state.personal;
  let pts = 0;
  if (name.trim().length > 0) pts += 2;
  if (email.trim().length > 0 && email.includes("@")) pts += 2;
  if (phone.trim().length > 0) pts += 2;
  if (location.trim().length > 0) pts += 2;
  const s = Math.min(pts, 8);
  return { score: s, max: 8, level: level(s, 8), label: "Contact Details", tip: s < 8 ? "Add your full name, email, phone, and location." : undefined };
}

function scoreSummary(state: CVState): ScoreCriterion {
  const len = state.summary.trim().length;
  let s = 0;
  if (len > 200) s = 8;
  else if (len > 100) s = 5;
  else if (len > 30) s = 2;
  return { score: s, max: 8, level: level(s, 8), label: "Professional Summary", tip: s < 8 ? "Write a 3-4 sentence summary highlighting your top achievements and what you bring to a Gulf employer." : undefined };
}

function scoreExperience(state: CVState): ScoreCriterion {
  const filled = state.experience.filter((e) => e.role.trim().length > 0);
  const withDesc = filled.filter((e) => e.description.trim().length > 50);
  let s = 0;
  if (withDesc.length >= 2) s = 8;
  else if (withDesc.length === 1) s = 5;
  else if (filled.length > 0) s = 2;
  return { score: s, max: 8, level: level(s, 8), label: "Work Experience", tip: s < 8 ? "Add at least 2 roles with detailed descriptions (50+ characters each)." : undefined };
}

function scoreEducation(state: CVState): ScoreCriterion {
  const hasDegree = state.education.some((e) => e.degree.trim().length > 0);
  const s = hasDegree ? 6 : 0;
  return { score: s, max: 6, level: level(s, 6), label: "Education", tip: s < 6 ? "Add your highest qualification." : undefined };
}

function completenessLayer(state: CVState): ScoreLayer {
  const criteria = [scoreContact(state), scoreSummary(state), scoreExperience(state), scoreEducation(state)];
  const total = criteria.reduce((a, c) => a + c.score, 0);
  return { label: "Completeness", score: total, max: 30, criteria };
}

/* ââââââââââââââââââââââââââââââââââââââââââ
   LAYER 2 : CONTENT QUALITY (30 pts)
   ââââââââââââââââââââââââââââââââââââââââââ */

function scoreActionVerbs(state: CVState): ScoreCriterion {
  const text = experienceText(state);
  const found = ACTION_VERBS.filter((v) => text.includes(v));
  let s = 0;
  if (found.length >= 8) s = 8;
  else if (found.length >= 4) s = 5;
  else if (found.length >= 1) s = 2;
  return { score: s, max: 8, level: level(s, 8), label: "Action Verbs", tip: s < 8 ? "Start bullet points with strong verbs: led, delivered, increased, reduced, built." : undefined };
}

function scoreQuantifiableResults(state: CVState): ScoreCriterion {
  const text = allText(state);
  const matches = countPatternMatches(text, QUANTIFIER_PATTERNS);
  let s = 0;
  if (matches >= 5) s = 10;
  else if (matches >= 3) s = 7;
  else if (matches >= 1) s = 3;
  return { score: s, max: 10, level: level(s, 10), label: "Measurable Achievements", tip: s < 10 ? "Add numbers: '20% increase', 'managed 150 employees', 'AED 2M budget'." : undefined };
}

function scoreSkillsCount(state: CVState): ScoreCriterion {
  const count = state.skills.length;
  let s = 0;
  if (count >= 8) s = 6;
  else if (count >= 4) s = 4;
  else if (count >= 1) s = 2;
  return { score: s, max: 6, level: level(s, 6), label: "Skills Breadth", tip: s < 6 ? "List at least 8 relevant skills. Mix technical and soft skills." : undefined };
}

function scoreDateConsistency(state: CVState): ScoreCriterion {
  const dates = [
    ...state.experience.map((e) => e.dates),
    ...state.education.map((e) => e.year),
  ].filter((d) => d.trim().length > 0);
  // Check if dates exist at all
  const s = dates.length >= 2 ? 6 : dates.length === 1 ? 3 : 0;
  return { score: s, max: 6, level: level(s, 6), label: "Timeline Coverage", tip: s < 6 ? "Ensure all roles and qualifications have dates." : undefined };
}

function contentQualityLayer(state: CVState): ScoreLayer {
  const criteria = [scoreActionVerbs(state), scoreQuantifiableResults(state), scoreSkillsCount(state), scoreDateConsistency(state)];
  const total = criteria.reduce((a, c) => a + c.score, 0);
  return { label: "Content Quality", score: total, max: 30, criteria };
}

/* ââââââââââââââââââââââââââââââââââââââââââ
   LAYER 3 : GULF-SPECIFIC (25 pts)
   ââââââââââââââââââââââââââââââââââââââââââ */

function scoreVisaNotice(state: CVState): ScoreCriterion {
  const text = allText(state);
  const hasVisa = hasAnyPattern(text, VISA_PATTERNS);
  const hasNotice = hasAnyPattern(text, NOTICE_PERIOD_PATTERNS);
  let s = 0;
  if (hasVisa && hasNotice) s = 6;
  else if (hasVisa || hasNotice) s = 3;
  return { score: s, max: 6, level: level(s, 6), label: "Visa & Availability", tip: s < 6 ? "Mention your visa status and notice period. Gulf recruiters filter on these." : undefined };
}

function scoreArabicLanguage(state: CVState): ScoreCriterion {
  const langText = state.languages.map((l) => l.language).join(" ");
  const hasArabic = hasAnyPattern(langText, ARABIC_LANGUAGE_PATTERNS);
  const s = hasArabic ? 4 : 0;
  return { score: s, max: 4, level: level(s, 4), label: "Arabic Language", tip: s < 4 ? "If you speak any Arabic, add it to your languages section. Even 'Basic' scores points with Gulf employers." : undefined };
}

function scoreDrivingLicence(state: CVState): ScoreCriterion {
  const text = allText(state);
  const has = hasAnyPattern(text, DRIVING_LICENCE_PATTERNS);
  const s = has ? 4 : 0;
  return { score: s, max: 4, level: level(s, 4), label: "Driving Licence", tip: s < 4 ? "Mention your UAE or international driving licence. Transport matters in the Gulf." : undefined };
}

function scoreGCCCertifications(state: CVState): ScoreCriterion {
  const text = allText(state);
  const found = GCC_CERTIFICATIONS.filter((p) => p.test(text));
  let s = 0;
  if (found.length >= 3) s = 5;
  else if (found.length >= 1) s = 3;
  return { score: s, max: 5, level: level(s, 5), label: "Regional Certifications", tip: s < 5 ? "Add certifications recognised in the Gulf: CIPD, SHRM, PMP, NEBOSH, MOHRE, etc." : undefined };
}

function scoreGulfKeywords(state: CVState): ScoreCriterion {
  const text = allText(state);
  const employerHits = GCC_EMPLOYERS.filter((p) => p.test(text)).length;
  const industryHits = GULF_INDUSTRY_KEYWORDS.filter((p) => p.test(text)).length;
  const total = employerHits + industryHits;
  let s = 0;
  if (total >= 5) s = 6;
  else if (total >= 3) s = 4;
  else if (total >= 1) s = 2;
  return { score: s, max: 6, level: level(s, 6), label: "Gulf Market Fit", tip: s < 6 ? "Reference GCC employers, Emiratisation, free zones, or regional industry terms." : undefined };
}

function gulfSpecificLayer(state: CVState): ScoreLayer {
  const criteria = [scoreVisaNotice(state), scoreArabicLanguage(state), scoreDrivingLicence(state), scoreGCCCertifications(state), scoreGulfKeywords(state)];
  const total = criteria.reduce((a, c) => a + c.score, 0);
  return { label: "Gulf Readiness", score: total, max: 25, criteria };
}

/* ââââââââââââââââââââââââââââââââââââââââââ
   LAYER 4 : ATS & FORMATTING (15 pts)
   ââââââââââââââââââââââââââââââââââââââââââ */

function scoreLinkedin(state: CVState): ScoreCriterion {
  const has = state.personal.linkedin.trim().length > 0;
  const s = has ? 5 : 0;
  return { score: s, max: 5, level: level(s, 5), label: "LinkedIn URL", tip: s < 5 ? "Add your LinkedIn profile URL. Recruiters check it." : undefined };
}

function scoreProfessionalTitle(state: CVState): ScoreCriterion {
  const has = state.personal.title.trim().length > 0;
  const s = has ? 5 : 0;
  return { score: s, max: 5, level: level(s, 5), label: "Professional Title", tip: s < 5 ? "Add a clear job title (e.g. 'Senior HR Business Partner'). ATS systems parse this field." : undefined };
}

function scoreSummaryKeywords(state: CVState): ScoreCriterion {
  // Check summary has enough substance to pass ATS keyword extraction
  const words = state.summary.trim().split(/\s+/).filter(Boolean);
  let s = 0;
  if (words.length >= 40) s = 5;
  else if (words.length >= 20) s = 3;
  else if (words.length >= 5) s = 1;
  return { score: s, max: 5, level: level(s, 5), label: "Summary Depth", tip: s < 5 ? "Expand your summary to 40+ words. ATS systems extract keywords from this section first." : undefined };
}

function atsFormattingLayer(state: CVState): ScoreLayer {
  const criteria = [scoreLinkedin(state), scoreProfessionalTitle(state), scoreSummaryKeywords(state)];
  const total = criteria.reduce((a, c) => a + c.score, 0);
  return { label: "ATS & Formatting", score: total, max: 15, criteria };
}

/* ââââââââââââââââââââââââââââââââââââââââââ
   MAIN SCORER
   ââââââââââââââââââââââââââââââââââââââââââ */

export function calculateScore(state: CVState): ScoreResult {
  const completeness = completenessLayer(state);
  const contentQuality = contentQualityLayer(state);
  const gulfSpecific = gulfSpecificLayer(state);
  const atsFormatting = atsFormattingLayer(state);

  const total = completeness.score + contentQuality.score + gulfSpecific.score + atsFormatting.score;

  // Build flat breakdown for backward compatibility
  const breakdown: Record<string, ScoreCriterion> = {};
  for (const layer of [completeness, contentQuality, gulfSpecific, atsFormatting]) {
    for (const c of layer.criteria) {
      breakdown[c.label] = c;
    }
  }

  // Collect top tips (red items first, then amber, max 5)
  const allCriteria = [
    ...completeness.criteria,
    ...contentQuality.criteria,
    ...gulfSpecific.criteria,
    ...atsFormatting.criteria,
  ];
  const topTips = allCriteria
    .filter((c) => c.tip && c.level !== "green")
    .sort((a, b) => {
      const order = { red: 0, amber: 1, green: 2 };
      return order[a.level] - order[b.level];
    })
    .slice(0, 5)
    .map((c) => c.tip!);

  return {
    total,
    max: 100,
    layers: { completeness, contentQuality, gulfSpecific, atsFormatting },
    breakdown,
    topTips,
  };
}
