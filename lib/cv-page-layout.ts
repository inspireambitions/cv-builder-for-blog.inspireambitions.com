import type { CVState } from "./types";

export const CV_PAGE_MM = { width: 210, height: 297, margin: 18 };
export const MM_PER_POINT = 25.4 / 72;
export const JOB_GAP_PT = 11;
export const BULLET_GAP_PT = 2.5;

export type BodyLayout = { size: number; leading: number; sectionGap: number };
export const regularBody: BodyLayout = { size: 11, leading: 1.32, sectionGap: 13 };
export const compactBody: BodyLayout = { size: 10.5, leading: 1.25, sectionGap: 10 };
export const openBody: BodyLayout = { size: 11.5, leading: 1.4, sectionGap: 13 };

export function chooseBodyLayout(measure: (layout: BodyLayout) => number, sectionBreaks: number, capacity: number): BodyLayout {
  const normal = measure(regularBody);
  if (normal > capacity && normal <= capacity * 1.1) return compactBody;
  if (normal >= capacity * 0.6) return regularBody;
  const openHeight = measure(openBody);
  const extra = sectionBreaks > 0 ? Math.max(0, (capacity * 0.76 - openHeight) / sectionBreaks) : 0;
  return { ...openBody, sectionGap: openBody.sectionGap + Math.min(extra / MM_PER_POINT, 85) };
}

/** Approximation for browser and Word, where each renderer measures with its own fonts. */
export function documentBodyLayout(cv: CVState) {
  const work = cv.experience.filter((entry) => entry.role.trim() || entry.company.trim());
  const school = cv.education.filter((entry) => entry.degree.trim() || entry.institution.trim());
  const languages = cv.languages.filter((entry) => entry.language.trim());
  const sections = Number(Boolean(cv.summary)) + Number(work.length > 0) + Number(school.length > 0) +
    Number(cv.skills.length > 0) + Number(languages.length > 0);
  const lengthInLines = (value: string) => value.trim() ? Math.ceil(value.length / 85) : 0;
  const lines = 4 + lengthInLines(cv.summary) + school.length * 2 + lengthInLines(cv.skills.join(" | ")) +
    languages.length + work.reduce((sum, job) => sum + 2 + job.description.split("\n").reduce((size, line) => size + lengthInLines(line), 0), 0) +
    (cv.achievements.length + cv.certifications.length + cv.volunteer.length + cv.projects.length + cv.publications.length + cv.memberships.length) * 3;
  return chooseBodyLayout(({ size, leading, sectionGap }) =>
    (lines * size * leading + sections * (sectionGap + size) + Math.max(0, work.length - 1) * JOB_GAP_PT) * MM_PER_POINT,
  Math.max(0, sections - 1), CV_PAGE_MM.height - 2 * CV_PAGE_MM.margin);
}

export function packPages<T extends { height: number; keepWithNext?: boolean }>(lines: T[], capacity: number, firstCapacity = capacity) {
  const groups: T[][] = [];
  for (const line of lines) {
    const group = groups.at(-1);
    if (group?.at(-1)?.keepWithNext) group.push(line);
    else groups.push([line]);
  }
  const pages: T[][][] = [[]];
  let used = 0;
  const height = (rows: T[]) => rows.reduce((size, row) => size + row.height, 0);
  for (const group of groups.flatMap((rows) => height(rows) > capacity ? rows.map((row) => [row]) : [rows])) {
    const limit = pages.length === 1 ? firstCapacity : capacity;
    if (used && used + height(group) > limit) { pages.push([]); used = 0; }
    pages.at(-1)!.push(group);
    used += height(group);
  }
  const last = pages.at(-1)!;
  const previous = pages.at(-2);
  while (previous && previous.flat().length > 6 && last.flat().length < 6) {
    const group = previous.at(-1)!;
    if (previous.flat().length - group.length < 6 || height(last.flat()) + height(group) > capacity) break;
    last.unshift(previous.pop()!);
  }
  return pages.map((page) => page.flat());
}

/** Try the full contact line, then choose the most even split between whole items. */
export function contactLines(parts: string[], measure: (text: string) => number, width: number) {
  const whole = parts.join(" | ");
  if (parts.length < 2 || measure(whole) <= width) return whole ? [whole] : [];
  const splits = parts.slice(1).map((_, index) => [
    parts.slice(0, index + 1).join(" | "), parts.slice(index + 1).join(" | "),
  ]);
  return splits.sort((a, b) => Math.max(...a.map(measure)) - Math.max(...b.map(measure)))[0];
}
