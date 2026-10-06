import type { ExpEntry } from "./types";

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Preserve unrecognised legacy dates until the candidate chooses new dates.
export function migrateExperienceDates(entry: ExpEntry): ExpEntry {
  if (entry.startYear !== undefined || !entry.dates.trim()) return entry;
  const match = entry.dates.trim().match(/^([A-Za-z]+)\s+(\d{4})\s*(?:to|[-–—])\s*(present|current|now|([A-Za-z]+)\s+(\d{4}))$/i);
  if (!match) return entry;
  const start = MONTHS.findIndex((month) => month.toLowerCase() === match[1].slice(0, 3).toLowerCase());
  const end = match[4] ? MONTHS.findIndex((month) => month.toLowerCase() === match[4].slice(0, 3).toLowerCase()) : -1;
  if (start < 0 || (match[4] && end < 0)) return entry;
  return { ...entry, startMonth: String(start + 1), startYear: match[2], endMonth: end >= 0 ? String(end + 1) : "", endYear: match[5] ?? "", current: !match[4] };
}

export function experienceDateText(entry: ExpEntry): string {
  if (!entry.startMonth || !entry.startYear) return entry.dates;
  const start = `${MONTHS[Number(entry.startMonth) - 1]} ${entry.startYear}`;
  if (entry.current) return `${start} to Present`;
  if (entry.endMonth && entry.endYear) return `${start} to ${MONTHS[Number(entry.endMonth) - 1]} ${entry.endYear}`;
  return start;
}
