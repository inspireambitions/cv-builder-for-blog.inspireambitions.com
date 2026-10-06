"use client";

import type { ExpEntry } from "@/lib/types";
import { MONTHS, experienceDateText } from "@/lib/experience-dates";

export default function ExperienceDates({ entry, onChange }: { entry: ExpEntry; onChange: (entry: ExpEntry) => void }) {
  const latestYear = new Date().getFullYear();
  const years = Array.from({ length: 91 }, (_, index) => String(latestYear - index));
  for (const year of [entry.startYear, entry.endYear]) if (year && !years.includes(year)) years.push(year);
  function change(patch: Partial<ExpEntry>) {
    const next = { ...entry, ...patch };
    onChange({ ...next, dates: experienceDateText(next) });
  }
  const className = "min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-base";
  return <fieldset className="space-y-4 md:col-span-2">
    <legend className="text-sm font-medium text-gray-700">When did you work here?</legend>
    {entry.dates && entry.startYear === undefined && <p className="text-sm text-ink-muted">Saved dates: <bdi>{entry.dates}</bdi>. Keep these or choose dates below.</p>}
    <div className="grid grid-cols-2 gap-3">
      <label className="text-sm text-gray-700">Start month<select aria-label="Start month" value={entry.startMonth ?? ""} onChange={(event) => change({ startMonth: event.target.value })} className={className}><option value="">Choose month</option>{MONTHS.map((month, index) => <option key={month} value={String(index + 1)}>{month}</option>)}</select></label>
      <label className="text-sm text-gray-700">Start year<select aria-label="Start year" value={entry.startYear ?? ""} onChange={(event) => change({ startYear: event.target.value })} className={className}><option value="">Choose year</option>{years.map((year) => <option key={year}>{year}</option>)}</select></label>
    </div>
    <label className="flex min-h-12 items-center gap-3 text-base"><input type="checkbox" checked={entry.current ?? false} onChange={(event) => change({ current: event.target.checked })} />I still work here</label>
    {!entry.current && <div className="grid grid-cols-2 gap-3">
      <label className="text-sm text-gray-700">End month<select aria-label="End month" value={entry.endMonth ?? ""} onChange={(event) => change({ endMonth: event.target.value })} className={className}><option value="">Choose month</option>{MONTHS.map((month, index) => <option key={month} value={String(index + 1)}>{month}</option>)}</select></label>
      <label className="text-sm text-gray-700">End year<select aria-label="End year" value={entry.endYear ?? ""} onChange={(event) => change({ endYear: event.target.value })} className={className}><option value="">Choose year</option>{years.map((year) => <option key={year}>{year}</option>)}</select></label>
    </div>}
    {entry.startYear && entry.endYear && !entry.current && Number(`${entry.endYear}${(entry.endMonth ?? "0").padStart(2, "0")}`) < Number(`${entry.startYear}${(entry.startMonth ?? "0").padStart(2, "0")}`) && <p role="alert" className="text-sm text-red-700">The end date comes before the start date. Check both dates.</p>}
  </fieldset>;
}
