import { migrateExperienceDates } from "./experience-dates";
import { getRoleFamilyForJob } from "./role-suggestions";
import { hasNamedSystem } from "./skill-names";
import type { CVState } from "./types";
import { validatePhone, locationParts } from "./validators";
import { getVerbForms } from "./verb-forms";

export type CVIssue = { id: string; label: string; step: number; field?: string; basic?: boolean; copy?: { key: string; job?: string } };

const issueKeys: Readonly<Record<string, string>> = {
  name: "review.addName",
  location: "review.addLocation",
  language: "review.addLanguage",
  "language-level": "review.languageLevel",
  detail: "review.addRealDetail",
  profile: "review.addProfileFacts",
};
export function reviewIssueLabel(issue: CVIssue, t: (key: string, values?: Record<string, string>) => string) {
  if (issue.copy) return t(issue.copy.key, issue.copy.job === undefined ? undefined : { job: issue.copy.job });
  const key = issueKeys[issue.id];
  return typeof key === "string" ? t(key) : issue.label;
}

function month(year?: string, value?: string) {
  if (!year || !/^[1-9]\d{3}$/.test(year) || !value || !/^(?:[1-9]|1[0-2])$/.test(value)) return undefined;
  return Number(year) * 12 + Number(value) - 1;
}

const dutyKey = (line: string) => line.toLowerCase()
  .replace(/\bwith (?:care|precision)\.?$/i, "")
  .match(/[+−-]?\p{N}+(?:[.,]\p{N}+)*|[\p{L}\p{M}]+/gu)?.map((token) => getVerbForms(token)?.base ?? token).join(" ");

/** Check the document without changing it. Basic items never block exports. */
export function checkCV(cv: CVState, asOf = new Date()): CVIssue[] {
  const issues: CVIssue[] = [];
  const add = (id: string, label: string, step: number, field?: string, basic = false, copy?: CVIssue["copy"]) =>
    issues.push(copy ? { id, label, step, field, basic, copy } : { id, label, step, field, basic });
  if (!cv.personal.name.trim()) add("name", "Add your name.", 1, "name", true);
  if (!validatePhone(cv.personal.phone).valid) add("phone", cv.personal.phone.trim()
    ? "Check your phone number and country code."
    : cv.geo === "gulf" ? "Add your phone number. Most Gulf recruiters call or WhatsApp." : "Add your phone number so employers can call you.", 1, "phone", true,
  { key: cv.personal.phone.trim() ? "review.fixPhone" : cv.geo === "gulf" ? "review.addGulfPhone" : "review.addPhone" });
  const { city, country } = locationParts(cv.personal.location);
  if (!city || !country) add("location", "Add your city and country.", 1, "location", true);
  if (!cv.languages.some((entry) => entry.language.trim())) add("language", "Add at least one language you speak.", 4, "languages", true);
  else if (cv.languages.some((entry) => entry.language.trim() && !entry.level)) add("language-level", "Choose how well you speak each language you listed.", 4, "languages");

  const jobs = cv.experience.filter((job) => job.role.trim() || job.company.trim());
  const today = asOf.getUTCFullYear() * 12 + asOf.getUTCMonth();
  const ranges: { start: number; end: number; id: string; gap: string; name: string }[] = [];
  let concreteDuty = false;
  for (const entry of jobs) {
    const job = migrateExperienceDates(entry);
    const name = job.role.trim() || job.company.trim();
    const lines = job.description.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const field = `${job.id}-description`;
    if (lines.length < 2) add(`few-${job.id}`, `${name}: add ${lines.length ? "one more line" : "two lines"} or answer the quick questions.`, 2, field, false,
      { key: lines.length ? "review.addOneLine" : "review.addTwoLines", job: name });
    const group = getRoleFamilyForJob(job.role, job.roleFamily);
    const library = new Set(group.sentences.map(dutyKey));
    if (lines.length && lines.every((line) => library.has(dutyKey(line)))) {
      add(`library-${job.id}`, `${name}: add one thing in your own words or answer the quick questions.`, 2, field, false, { key: "review.addOwnWords", job: name });
    }
    const length = (line: string) => line.match(/[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N}'’\-]*/gu)?.length ?? 0;
    if (lines.some((line) => length(line) > 28)) add(`long-${job.id}`, `${name}: keep each line to 28 words or fewer.`, 2, field, false, { key: "review.shortLines", job: name });
    if (lines.some((line) => {
      const word = line.match(/^[a-z]+(?=[\s.,;:]|$)/i)?.[0];
      return word && !getVerbForms(word);
    })) add(`verb-${job.id}`, `${name}: check that each line starts with an action, such as “Check” or “Prepare”.`, 2, field, false, { key: "review.actionFirst", job: name });
    if (lines.some((line) => /\p{N}/u.test(line) || hasNamedSystem(line))) concreteDuty = true;
    const start = month(job.startYear, job.startMonth);
    const end = job.current ? today : month(job.endYear, job.endMonth);
    if (start === undefined || end === undefined || start > end || end > today) {
      add(`dates-${job.id}`, `${name}: check the work dates.`, 2, `${job.id}-dates`, false, { key: "review.checkDates", job: name });
    } else {
      ranges.push({ start, end, id: job.id, gap: job.gap, name });
    }
  }
  if (jobs.length && !concreteDuty) add("detail", "Add a real detail if you can, such as a tool you used or a number you know.", 2, `${jobs[0].id}-description`);
  if (ranges.length === jobs.length) {
    let frontier: typeof ranges[number] | undefined;
    for (const next of ranges.sort((a, b) => a.start - b.start || b.end - a.end)) {
      if (frontier && next.start - frontier.end - 1 > 6 && !frontier.gap.trim() && !next.gap.trim()) {
        add(`gap-${next.id}`, `There is a gap before ${next.name}. Add a brief note if you want to explain it.`, 2, `${next.id}-gap`, false,
          { key: "review.gap", job: next.name });
      }
      if (!frontier || next.end > frontier.end) frontier = next;
    }
  }
  if ((cv.summary.match(/[.!?؟。](?:\s+|$)/g)?.length ?? 0) < 2) {
    add("profile", "Add work, skills or a language to build a fuller profile.", jobs.length ? 2 : 4, jobs.length ? `${jobs[0].id}-description` : "languages");
  }
  return issues;
}
