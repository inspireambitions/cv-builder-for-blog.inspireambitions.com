"use client";

import type { ExpEntry } from "@/lib/types";
import { MONTHS, experienceDateText } from "@/lib/experience-dates";
import { useLocale } from "@/lib/locale";

export default function ExperienceDates({ entry, onChange }: { entry: ExpEntry; onChange: (entry: ExpEntry) => void }) {
  const { t } = useLocale();
  const latestYear = new Date().getFullYear();
  const years = Array.from({ length: 91 }, (_, index) => String(latestYear - index));
  for (const year of [entry.startYear, entry.endYear]) if (year && !years.includes(year)) years.push(year);
  function change(patch: Partial<ExpEntry>) {
    const next = { ...entry, ...patch };
    onChange({ ...next, dates: experienceDateText(next) });
  }
  const className = "min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-base";
  const invalid = Boolean(entry.startYear && entry.endYear && !entry.current && Number(`${entry.endYear}${(entry.endMonth ?? "0").padStart(2, "0")}`) < Number(`${entry.startYear}${(entry.startMonth ?? "0").padStart(2, "0")}`));
  const errorId = `${entry.id}-date-error`;
  const monthOptions = MONTHS.map((month, index) => <option key={month} value={String(index + 1)}>{t(`month.${index + 1}`)}</option>);
  const yearOptions = years.map((year) => <option key={year} value={year}>{year}</option>);
  return <fieldset className="space-y-4 md:col-span-2">
    <legend className="text-sm font-medium text-gray-700">{t("dates.legend")}</legend>
    {entry.dates && entry.startYear === undefined && <p className="text-sm text-ink-muted">{t("dates.saved", { dates: entry.dates })}</p>}
    <div className="grid grid-cols-2 gap-3">
      <label className="text-sm text-gray-700">{t("dates.startMonth")}<select data-cv-fix={`${entry.id}-dates`} aria-label={t("dates.startMonth")} value={entry.startMonth ?? ""} onChange={(event) => change({ startMonth: event.target.value })} className={className}><option value="">{t("dates.chooseMonth")}</option>{monthOptions}</select></label>
      <label className="text-sm text-gray-700">{t("dates.startYear")}<select aria-label={t("dates.startYear")} value={entry.startYear ?? ""} onChange={(event) => change({ startYear: event.target.value })} className={className}><option value="">{t("dates.chooseYear")}</option>{yearOptions}</select></label>
    </div>
    <label className="flex min-h-12 items-center gap-3 text-base"><input type="checkbox" checked={entry.current ?? false} onChange={(event) => change({ current: event.target.checked })} />{t("dates.current")}</label>
    {!entry.current && <div className="grid grid-cols-2 gap-3">
      <label className="text-sm text-gray-700">{t("dates.endMonth")}<select aria-label={t("dates.endMonth")} aria-invalid={invalid} aria-describedby={invalid ? errorId : undefined} value={entry.endMonth ?? ""} onChange={(event) => change({ endMonth: event.target.value })} className={className}><option value="">{t("dates.chooseMonth")}</option>{monthOptions}</select></label>
      <label className="text-sm text-gray-700">{t("dates.endYear")}<select aria-label={t("dates.endYear")} aria-invalid={invalid} aria-describedby={invalid ? errorId : undefined} value={entry.endYear ?? ""} onChange={(event) => change({ endYear: event.target.value })} className={className}><option value="">{t("dates.chooseYear")}</option>{yearOptions}</select></label>
    </div>}
    {invalid && <p id={errorId} role="alert" className="text-sm text-red-700">{t("dates.invalid")}</p>}
  </fieldset>;
}
