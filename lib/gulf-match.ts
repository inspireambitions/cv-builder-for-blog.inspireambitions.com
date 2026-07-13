import type { CVState } from "@/lib/types";

export type MatchGapTarget = "personal" | "summary" | "experience" | "education" | "skills";

export interface GulfMatchGap {
  id: string;
  label: string;
  reason: string;
  target: MatchGapTarget;
  weight: number;
}

export interface GulfMatchResult {
  score: number;
  verdict: "Not shortlist-ready" | "Close, fix the gaps" | "Shortlist-ready";
  gaps: GulfMatchGap[];
  compliance: Array<{ label: string; met: boolean }>;
  components: { skills: number; title: number; years: number; credentials: number; gcc: number; ats: number };
}

const STOP_WORDS = new Set("and the with for from this that your our are will have has years year experience role job work working preferred required must ability strong excellent including within across into using use you their they them who where what when responsibilities requirements qualification qualifications candidate candidates".split(" "));
const SYNONYMS: Record<string, string[]> = {
  aml: ["anti money laundering"],
  kyc: ["know your customer"],
  fnb: ["food beverage", "food and beverage"],
  mep: ["mechanical electrical plumbing"],
  pmp: ["project management professional"],
  hse: ["health safety environment"],
  crm: ["customer relationship management"],
  erp: ["enterprise resource planning"],
  wms: ["warehouse management system"],
};

function normalise(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}+#.]+/gu, " ").replace(/\s+/g, " ").trim();
}

function cvCorpus(state: CVState) {
  return normalise([
    state.personal.title,
    state.summary,
    ...state.skills,
    ...state.certifications.map((item) => `${item.name} ${item.issuer}`),
    ...state.languages.map((item) => `${item.language} ${item.level}`),
    ...state.experience.flatMap((item) => [item.role, item.company, item.description]),
    ...state.education.flatMap((item) => [item.degree, item.institution, item.year]),
  ].join(" "));
}

function keyTerms(jobDescription: string) {
  const jd = normalise(jobDescription);
  const phrases = Object.entries(SYNONYMS).flatMap(([key, values]) => jd.includes(key) || values.some((value) => jd.includes(value)) ? [key] : []);
  const words = jd.split(" ").filter((word) => word.length > 3 && !STOP_WORDS.has(word) && !/^\d+$/.test(word));
  const frequency = new Map<string, number>();
  for (const word of words) frequency.set(word, (frequency.get(word) ?? 0) + 1);
  return [...new Set([...phrases, ...[...frequency.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 18).map(([word]) => word)])];
}

function hasTerm(corpus: string, term: string) {
  return corpus.includes(term) || (SYNONYMS[term] ?? []).some((value) => corpus.includes(value));
}

function yearsOfExperience(state: CVState) {
  const explicit = state.experience.flatMap((item) => item.dates.match(/(?:19|20)\d{2}/g) ?? []).map(Number);
  return explicit.length > 1 ? Math.max(0, new Date().getFullYear() - Math.min(...explicit)) : state.experience.length * 2;
}

export function computeGulfMatchScore(state: CVState, jobDescription: string, jobTitle = ""): GulfMatchResult {
  const jd = normalise(`${jobTitle} ${jobDescription}`);
  const corpus = cvCorpus(state);
  const terms = keyTerms(jobDescription);
  const matched = terms.filter((term) => hasTerm(corpus, term));
  const skills = terms.length ? Math.round(40 * matched.length / terms.length) : 0;

  const titleWords = normalise(jobTitle).split(" ").filter((word) => word.length > 2);
  const titleHits = titleWords.filter((word) => corpus.includes(word)).length;
  const title = titleWords.length ? Math.round(15 * titleHits / titleWords.length) : (state.personal.title.trim() ? 8 : 0);

  const requiredYears = Number(jd.match(/(\d{1,2})\+?\s*(?:years|year)/)?.[1] ?? 0);
  const candidateYears = yearsOfExperience(state);
  const years = requiredYears === 0 ? (state.experience.length ? 10 : 0) : Math.min(10, Math.round(10 * candidateYears / requiredYears));

  const requestedCredentials = ["pmp", "cfa", "acca", "cipd", "shrm", "dha", "moh", "doh", "dataflow", "arabic", "english", "hindi", "urdu", "tagalog"].filter((term) => jd.includes(term));
  const credentials = requestedCredentials.length ? Math.round(10 * requestedCredentials.filter((term) => corpus.includes(term)).length / requestedCredentials.length) : 10;

  const drivingRelevant = /driv|site work|field work|delivery/.test(jd);
  const compliance = [
    { label: "Location stated", met: Boolean(state.personal.location.trim()) },
    { label: "Visa status stated", met: Boolean(state.personal.visa_status.trim()) },
    { label: "Notice period stated", met: Boolean(state.personal.notice_period.trim()) },
    { label: "Nationality stated", met: Boolean(state.personal.nationality.trim()) },
    { label: "Driving licence stated", met: !drivingRelevant || Boolean(state.personal.driving_license.trim()) },
  ];
  const gcc = Math.round(15 * compliance.filter((item) => item.met).length / compliance.length);

  const bullets = state.experience.flatMap((item) => item.description.split(/\n|•/).map((line) => line.trim()).filter(Boolean));
  const quantified = bullets.filter((bullet) => /\d|%|aed|usd|sar|qar/i.test(bullet)).length;
  const atsChecks = [Boolean(state.summary.trim()), state.experience.length > 0, state.skills.length >= 5, bullets.length > 0, bullets.length > 0 && quantified / bullets.length >= 0.3];
  const ats = Math.round(10 * atsChecks.filter(Boolean).length / atsChecks.length);

  const gaps: GulfMatchGap[] = [];
  for (const term of terms.filter((item) => !hasTerm(corpus, item)).slice(0, 8)) gaps.push({ id: `skill-${term}`, label: term.toUpperCase(), reason: "The vacancy uses this term, but it is not supported in your CV.", target: "skills", weight: 40 });
  if (title < 10) gaps.push({ id: "title", label: "Target role alignment", reason: "Your headline and recent roles do not clearly match the vacancy title.", target: "personal", weight: 15 });
  if (requiredYears > candidateYears) gaps.push({ id: "years", label: `${requiredYears}+ years requested`, reason: "The vacancy asks for more experience than the dated roles currently show.", target: "experience", weight: 10 });
  for (const item of compliance.filter((entry) => !entry.met)) gaps.push({ id: `gcc-${item.label}`, label: item.label, reason: "This GCC detail is missing or not yet stated.", target: "personal", weight: 15 });
  if (!state.summary.trim()) gaps.push({ id: "summary", label: "Professional summary", reason: "A focused summary helps recruiters understand your fit quickly.", target: "summary", weight: 10 });
  gaps.sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label));

  const score = Math.max(0, Math.min(100, skills + title + years + credentials + gcc + ats));
  return { score, verdict: score >= 75 ? "Shortlist-ready" : score >= 50 ? "Close, fix the gaps" : "Not shortlist-ready", gaps, compliance, components: { skills, title, years, credentials, gcc, ats } };
}
