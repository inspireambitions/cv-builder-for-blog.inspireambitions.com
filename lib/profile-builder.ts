import { findBannedCVPhrase } from "./banned-phrases";
import { isGroundedProfilePolish } from "./evidence";
import { migrateExperienceDates } from "./experience-dates";
import { getRoleSuggestionGroup } from "./role-suggestions";
import { hasNamedSystem } from "./skill-names";
import type { CVState, ExpEntry } from "./types";

const sectors: Record<string, [string, string]> = {
  hotel: ["hotel", "الفنادق"],
  "kitchen-steward": ["kitchen stewarding", "خدمات المطبخ"],
  housekeeping: ["housekeeping", "التدبير الفندقي"],
  "food-service": ["food service", "خدمة الطعام"],
  culinary: ["kitchen", "المطابخ"],
  "front-office": ["front office", "الاستقبال"],
  hr: ["human resources", "الموارد البشرية"],
  administration: ["administration", "الإدارة"],
  "retail-sales": ["retail and sales", "البيع بالتجزئة والمبيعات"],
  "customer-service": ["customer service", "خدمة العملاء"],
  security: ["security", "الأمن"],
  driver: ["driving and delivery", "القيادة والتوصيل"],
  warehouse: ["warehousing and logistics", "التخزين والخدمات اللوجستية"],
  cleaning: ["cleaning", "التنظيف"],
  healthcare: ["healthcare support", "دعم الرعاية الصحية"],
  construction: ["construction", "البناء"],
  finance: ["finance and accounts", "المالية والحسابات"],
  technology: ["technology", "التقنية"],
};

function key(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

function shortField(value: string) {
  const text = value.trim().replace(/\s+/g, " ").replace(/[.!?؟]+$/, "");
  return findBannedCVPhrase(text) ? "" : text;
}

function monthIndex(year?: string, month?: string) {
  return year && month && /^[1-9]\d{3}$/.test(year) && /^(?:[1-9]|1[0-2])$/.test(month)
    ? Number(year) * 12 + Number(month) - 1
    : undefined;
}

export function latestHeldRole(jobs: ExpEntry[], asOf: Date) {
  const now = asOf.getUTCFullYear() * 12 + asOf.getUTCMonth();
  return jobs.find((job) => {
    if (!job.role.trim()) return false;
    const { startYear, startMonth } = migrateExperienceDates(job);
    const start = monthIndex(startYear, startMonth);
    return start === undefined ? !(Number(startYear) > asOf.getUTCFullYear()) : start <= now;
  });
}

function monthRange(entry: ExpEntry, asOf: Date) {
  const job = migrateExperienceDates(entry);
  const now = asOf.getUTCFullYear() * 12 + asOf.getUTCMonth();
  const start = monthIndex(job.startYear, job.startMonth);
  const end = job.current === true ? now : monthIndex(job.endYear, job.endMonth);
  if (start === undefined || end === undefined || !(start <= end && end <= now)) return undefined;
  return { start, end };
}

export function getRoleMove(job: ExpEntry, jobs: ExpEntry[], asOf: Date) {
  if (!job.company.trim() || !job.role.trim()) return undefined;
  const next = monthRange(job, asOf);
  if (!next) return undefined;
  const candidates = jobs.flatMap((other) => {
    if (other.id === job.id || !other.role.trim() || key(other.company) !== key(job.company)) return [];
    const previous = monthRange(other, asOf);
    if (!previous || previous.start >= next.start || previous.end < next.start - 1 || previous.end > next.start) return [];
    return [{ other, ...previous }];
  }).sort((a, b) => b.end - a.end || b.start - a.start);
  const previous = candidates[0];
  // Two possible predecessors make the transition ambiguous.
  if (!previous || candidates.length > 1 || key(previous.other.role) === key(job.role)) return undefined;
  const confirmation = JSON.stringify([
    job.id, key(job.role), key(job.company), key(job.location), next.start,
    previous.other.id, key(previous.other.role), key(previous.other.location), previous.start, previous.end,
  ]);
  return { from: previous.other.role, year: Math.floor(next.start / 12), confirmation };
}

function sectorFor(entry: ExpEntry) {
  if (/\b(?:hotel|hotels|resort)\b|فندق|فنادق|منتجع/iu.test(entry.company + " " + entry.companyDesc)) return "hotel";
  return getRoleSuggestionGroup(entry.role).key;
}

function tenure(jobs: ExpEntry[], latest: ExpEntry, sector: string, asOf: Date) {
  const ranges = jobs.flatMap((job) => {
    if (!job.role.trim()) return [];
    const sameSite = !!latest.company.trim() && key(job.company) === key(latest.company) && key(job.location) === key(latest.location);
    const sameWork = sector === "general" ? key(job.role) === key(latest.role) : sectorFor(job) === sector;
    if (job.id !== latest.id && !(sameSite && sameWork)) return [];
    const range = monthRange(job, asOf);
    return range ? [range] : [];
  }).sort((a, b) => a.start - b.start);
  let months = 0;
  let coveredUntil = -Infinity;
  for (const range of ranges) {
    // Work dates have month precision. Count only complete intervening months.
    months += Math.max(0, range.end - Math.max(range.start + 1, coveredUntil));
    coveredUntil = Math.max(coveredUntil, range.end);
  }
  return months;
}

function uniqueFields(values: string[]) {
  const unique = new Map<string, string>();
  for (const value of values) {
    const cleaned = shortField(value);
    if (cleaned && !unique.has(key(cleaned))) unique.set(key(cleaned), cleaned);
  }
  return [...unique.values()];
}

function sentenceList(values: string[], arabic: boolean) {
  const conjunction = arabic ? " و" : " and ";
  return values.length <= 1 ? (values[0] ?? "") :
    values.slice(0, -1).join(arabic ? "، " : ", ") + conjunction + values.at(-1);
}

const lowerSkills = new Set(["email handling", "guest calls", "reservation checks", "communication", "room cleaning", "linen care"]);

/** The caller supplies experience in the same newest-first order as the document. */
export function buildProfile(
  cv: Pick<CVState, "experience" | "skills" | "languages" | "cvLanguage">,
  targetRole: string,
  asOf: Date,
  proposedPolish?: string,
) {
  const ar = cv.cvLanguage === "ar";
  const latest = latestHeldRole(cv.experience, asOf);
  const sentences: string[] = [];
  if (latest) {
    const role = shortField(latest.role);
    const employer = shortField(latest.company);
    const city = shortField(latest.location);
    const sector = sectorFor(latest);
    const label = sectors[sector]?.[ar ? 1 : 0];
    const months = tenure(cv.experience, latest, sector, asOf);
    const years = Math.floor(months / 12);
    const exact = months % 12 === 0;
    const duration = years ? ar
      ? `${exact ? "" : "أكثر من "}${years} ${years >= 3 && years <= 10 ? "سنوات" : "سنة"}`
      : `${exact ? "" : "more than "}${years} ${years === 1 ? "year" : "years"}` : "";
    if (role) {
      const place = employer ? [employer, city].filter(Boolean).join(ar ? "، " : ", ") : city;
      const where = place ? ar ? ` في ${place}` : ` ${employer ? "at" : "in"} ${place}` : "";
      sentences.push(ar
        ? `${role} مع خبرة${duration ? ` لمدة ${duration}` : ""}${label ? ` في ${label}` : ""}${where}.`
        : `${role} with ${duration ? `${duration} of ` : ""}${label ? `${label} ` : ""}experience${where}.`);
      const move = getRoleMove(latest, cv.experience, asOf);
      if (move && shortField(move.from)) {
        const promoted = latest.promotionConfirmation === move.confirmation;
        sentences.push(ar
          ? `${promoted ? "ترقية" : "انتقال"} من ${shortField(move.from)} إلى ${role} في ${move.year}.`
          : `${promoted ? "Promoted" : "Moved"} from ${shortField(move.from)} to ${role} in ${move.year}.`);
      }
    }
  }
  const guestCalls = !ar && latest?.description.split("\n").some((line) => /^(?:take|took|answer|answered|handle|handled) guest calls\b/i.test(line) && !/\b(?:not|never|without)\b/i.test(line));
  const skills = uniqueFields([...(guestCalls ? ["Guest calls"] : []), ...cv.skills]);
  const top = skills.slice(0, 3);
  const tool = skills.find(hasNamedSystem);
  if (guestCalls && top.length === 3 && tool && !top.some(hasNamedSystem)) top[2] = tool;
  if (top.length) sentences.push(`${ar ? "المهارات تشمل" : "Skilled in"} ${sentenceList(top.map((skill) => lowerSkills.has(key(skill)) ? key(skill) : skill), ar)}.`);
  const languages = uniqueFields(cv.languages.map(({ language }) => language));
  if (languages.length) sentences.push(`${ar ? "اللغات" : "Speaks"} ${sentenceList(languages, ar)}.`);
  const target = shortField(targetRole);
  if (target && !latestHeldRole(cv.experience.filter(({ role }) => key(role) === key(target)), asOf)) {
    const article = /^[aeiou]/i.test(target) ? "an" : "a";
    const goal = /^[A-Z][a-z]+(?: [a-z]+)*$/.test(target) ? target[0].toLowerCase() + target.slice(1) : target;
    sentences.push(ar ? `يسعى إلى وظيفة ${target}.` : `Now seeking ${article} ${goal} role.`);
  }
  const profile = sentences.filter((sentence) => !findBannedCVPhrase(sentence)).join(" ");
  const polish = proposedPolish?.trim();
  return polish && !findBannedCVPhrase(polish) && isGroundedProfilePolish(profile, polish) ? polish : profile;
}
