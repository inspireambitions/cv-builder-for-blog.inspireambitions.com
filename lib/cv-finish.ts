import { experienceDateText, migrateExperienceDates } from "./experience-dates";
import { getRoleSuggestionGroup } from "./role-suggestions";
import { cleanAllCaps, cleanSkillName, hasNamedSystem, uppercaseFirst } from "./skill-names";
import type { CVState, ExpEntry } from "./types";
import { getVerbForms } from "./verb-forms";

export type FinishChange = {
  kind: "job-order" | "education-order" | "headline" | "dates" | "bullet" | "skills" | "empty-sections";
  jobId?: string;
};

type Tense = "present" | "past" | undefined;

// These can start a noun phrase rather than describe an action.
const nounPhrase = /^(?:booking (?:engine|system|errors?)|training (?:records?|materials?|sessions?)|driving licen[cs]e|cleaning (?:supplies|equipment|schedule)|filing system|processing time)\b/i;

function monthKey(year?: string, month?: string) {
  if (!year || !/^[1-9]\d{3}$/.test(year)) return 0;
  if (!month) return Number(year) * 12;
  return /^(?:[1-9]|1[0-2])$/.test(month) ? Number(year) * 12 + Number(month) : 0;
}

function prepareJob(entry: ExpEntry) {
  const job = migrateExperienceDates(entry);
  const start = monthKey(job.startYear, job.startMonth);
  const current = job.current === true;
  const end = current ? 0 : monthKey(job.endYear, job.endMonth);
  const dated = Boolean(start || end);
  const group = current ? 2 : dated ? 1 : 0;
  const tense: Tense = current ? "present" : end || job.current === false ? "past" : undefined;
  const validStart = start && job.startMonth;
  const validEnd = !job.endMonth || Boolean(end && job.endYear);
  const dates = validStart && (current || validEnd) ? experienceDateText(job) : job.dates;
  return { job, dates, group, start, end, tense };
}

function normaliseBullet(value: string, tense: Tense) {
  let line = value.trim().replace(/^(?:(?:[-–—](?!\.?\p{N})|[•*])\s*)+/u, "");
  const firstWord = line.match(/^[a-z]+(?=\s|$)/i)?.[0];
  if (firstWord && getVerbForms(firstWord)) line = cleanAllCaps(line);
  line = line.replace(/\s+/g, " ").replace(/[.!?۔。]+$/u, "");
  const filler = /(?:[\s,]+)(?:with precision|with care|as required|in a timely manner|to the best of my ability)$/i;
  while (filler.test(line)) line = line.replace(filler, "");
  const verb = nounPhrase.test(line) ? null : line.match(/^([a-z]+)\s+(?!of\b)/i);
  const forms = verb && getVerbForms(verb[1]);
  if (tense && forms) {
    const initial = tense === "present" ? forms.base : forms.past;
    const firstWasGerund = verb[1].toLowerCase() === forms.gerund;
    const rest = line.slice(verb[1].length).replace(/(,\s+|\band\s+)([a-z]+)(?=\s|$)/gi, (match, join: string, word: string) => {
      const coordinated = getVerbForms(word);
      if (!coordinated) return match;
      const lower = word.toLowerCase();
      // Ambiguous base forms can be nouns, as in "stock and order records".
      if (lower === coordinated.base || (lower === coordinated.gerund && !firstWasGerund)) return match;
      return join + (tense === "present" ? coordinated.base : coordinated.past);
    });
    line = initial + rest;
  }
  return line ? uppercaseFirst(line) + "." : "";
}

function bulletKey(line: string) {
  // Keep numbers as tokens so the key distinguishes 1.5 from 15 and -5 from 5.
  return (line.normalize("NFC").toLowerCase()
    .match(/[+−-]?\p{N}+(?:[.,/–-]\p{N}+)*%?|[\p{L}\p{M}]+/gu) ?? []).join(" ");
}

function finishBullets(job: ExpEntry, tense: Tense) {
  const library = new Set(
    getRoleSuggestionGroup(job.role).sentences.map((line) => bulletKey(normaliseBullet(line, tense)))
  );
  const seen = new Set<string>();
  const bullets = job.description.split(/\r?\n/).flatMap((raw) => {
    const line = normaliseBullet(raw, tense);
    const key = bulletKey(line);
    if (!key || seen.has(key)) return [];
    seen.add(key);
    const rank = /\p{N}/u.test(line) || hasNamedSystem(line) ? 0 : library.has(key) ? 2 : 1;
    return [{ line, rank }];
  });
  return bullets.sort((a, b) => a.rank - b.rank).slice(0, 6).map(({ line }) => line).join("\n");
}

function finishSkills(values: string[]) {
  const skills = new Map<string, string>();
  for (const value of values.flatMap((value) => value.split(/[,;|\n•،؛]/u))) {
    const name = cleanSkillName(value);
    if (name && !skills.has(name.toLowerCase())) skills.set(name.toLowerCase(), name);
  }
  return [...skills.values()].slice(0, 10);
}

function educationYear(year: string) {
  return Number(year.match(/\b[1-9]\d{3}\b/g)?.at(-1) ?? 0);
}

function hasText(...fields: string[]) {
  return fields.some((field) => typeof field === "string" && field.trim());
}

/** Build a document view. Never use the result to overwrite the saved draft. */
export function finishCV(state: CVState): { cv: CVState; changes: FinishChange[] } {
  const changes: FinishChange[] = [];
  const jobs = state.experience.map(prepareJob);
  const experience = [...jobs]
    .sort((a, b) => b.group - a.group || (b.end || b.start) - (a.end || a.start) || b.start - a.start)
    .map(({ job, dates, tense }) => {
      const description = finishBullets(job, tense);
      if (dates !== job.dates) changes.push({ kind: "dates", jobId: job.id });
      if (description !== job.description) changes.push({ kind: "bullet", jobId: job.id });
      return { ...job, role: job.role.trim(), dates, description };
    });
  if (experience.some((job, index) => job.id !== state.experience[index].id)) changes.push({ kind: "job-order" });

  const education = [...state.education].sort((a, b) => educationYear(b.year) - educationYear(a.year));
  if (education.some((entry, index) => entry.id !== state.education[index].id)) changes.push({ kind: "education-order" });

  const title = experience.find((job) => job.role)?.role ?? "";
  if (title !== state.personal.title) changes.push({ kind: "headline" });
  const skills = finishSkills(state.skills);
  if (skills.length !== state.skills.length || skills.some((skill, index) => skill !== state.skills[index])) changes.push({ kind: "skills" });

  const extras = {
    certifications: state.certifications.filter((item) => hasText(item.name, item.issuer, item.date, item.expiry)),
    achievements: state.achievements.filter((item) => hasText(item.title, item.body, item.awardingBody, item.year)),
    volunteer: state.volunteer.filter((item) => hasText(item.role, item.org, item.dates, item.impact)),
    projects: state.projects.filter((item) => hasText(item.name, item.description, item.url, item.outcomes)),
    publications: state.publications.filter((item) => hasText(item.title, item.outlet, item.date, item.url)),
    memberships: state.memberships.filter((item) => hasText(item.org, item.level, item.year)),
  };
  const extraKeys = Object.keys(extras) as (keyof typeof extras)[];
  if (extraKeys.some((key) => extras[key].length < state[key].length)) changes.push({ kind: "empty-sections" });

  return {
    cv: { ...state, ...extras, summary: state.summary.trim(), personal: { ...state.personal, title }, experience, education, skills },
    changes,
  };
}

export function cvContactParts(cv: CVState) {
  const { location, phone, email, linkedin } = cv.personal;
  return [location, phone, email, linkedin].map((item) => item.trim()).filter(Boolean);
}
