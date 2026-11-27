"use client";

import { useCVState } from "@/lib/state";
import type { ExpEntry } from "@/lib/types";
import RoleSentenceSuggestions from "@/components/shared/RoleSentenceSuggestions";
import ExperienceDates from "@/components/shared/ExperienceDates";
import { getRoleExamples } from "@/lib/role-examples";
import { getRoleMove } from "@/lib/profile-builder";
import { useLocale } from "@/lib/locale";
import { authoredTranslations } from "@/lib/i18n";
import { getRoleSuggestionGroup } from "@/lib/role-suggestions";

function generateId() {
  return "exp-" + Math.random().toString(36).slice(2, 9);
}

const EMPTY_ENTRY: Omit<ExpEntry, "id"> = {
  role: "",
  company: "",
  companyDesc: "",
  location: "",
  dates: "",
  description: "",
  gap: "",
};

export default function StepExperience() {
  const { state, updateField } = useCVState();
  const { locale, t } = useLocale();
  const entries = state.experience;

  function updateEntry(id: string, field: keyof ExpEntry, value: string | undefined) {
    updateField({
      experience: entries.map((e) =>
        e.id === id ? { ...e, [field]: value, ...(field === "role" ? { roleFamily: undefined } : {}) } : e
      ),
    });
  }

  function addEntry() {
    updateField({
      experience: [...entries, { ...EMPTY_ENTRY, id: generateId() }],
    });
  }

  function removeEntry(id: string) {
    updateField({
      experience: entries.filter((e) => e.id !== id),
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {t("experience.title")}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t("workUi.intro")}
        </p>
      </div>

      <div className="space-y-6">
        {entries.map((entry, index) => {
          const role = entry.role || state.personal.title;
          const examples = getRoleExamples(role);
          const family = getRoleSuggestionGroup(role).key;
          const localExamples = authoredTranslations[locale];
          const titleExample = locale === "en" ? examples.title : localExamples[`example.title.${family}`] ?? t("experience.role");
          const companyExample = locale === "en" ? examples.company : localExamples[`example.company.${family}`] ?? t("experience.companyDesc");
          const dutyExample = locale === "en" ? examples.duty : localExamples[`role.sentence.${family}.0`] ?? t("workUi.dutyExample");
          const move = getRoleMove(entry, entries, new Date());
          return (
          <div
            key={entry.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5"
          >
            {/* Card header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                {t("experience.position", { number: index + 1 })}
              </h3>
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  {t("form.remove")}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Job Title */}
              <div>
                <label htmlFor={`${entry.id}-role`} className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("experience.role")} <span className="text-red-500">*</span>
                </label>
                <input
                  id={`${entry.id}-role`}
                  type="text"
                  dir="auto"
                  value={entry.role}
                  onChange={(e) =>
                    updateEntry(entry.id, "role", e.target.value)
                  }
                  placeholder={titleExample}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                />
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor={`${entry.id}-company`} className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("experience.company")} <span className="text-red-500">*</span>
                </label>
                <input
                  id={`${entry.id}-company`}
                  type="text"
                  dir="auto"
                  value={entry.company}
                  onChange={(e) =>
                    updateEntry(entry.id, "company", e.target.value)
                  }
                  placeholder={t("experience.workplaceExample")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                />
              </div>

              {/* Company Description */}
              <div>
                <label htmlFor={`${entry.id}-company-description`} className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("experience.companyDesc")}
                </label>
                <input
                  id={`${entry.id}-company-description`}
                  type="text"
                  dir="auto"
                  value={entry.companyDesc}
                  onChange={(e) =>
                    updateEntry(entry.id, "companyDesc", e.target.value)
                  }
                  placeholder={companyExample}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor={`${entry.id}-location`} className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("experience.location")}
                </label>
                <input
                  id={`${entry.id}-location`}
                  type="text"
                  dir="auto"
                  value={entry.location}
                  onChange={(e) =>
                    updateEntry(entry.id, "location", e.target.value)
                  }
                  placeholder={t("workUi.locationExample")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                />
              </div>

              {/* Period */}
              <ExperienceDates entry={entry} onChange={(next) => updateField({ experience: entries.map((item) => item.id === entry.id ? next : item) })} />
              {move && <label className="flex min-h-12 cursor-pointer items-center gap-3 text-sm text-gray-700 md:col-span-2">
                <input type="checkbox" className="h-5 w-5 shrink-0 accent-gold-600"
                  checked={entry.promotionConfirmation === move.confirmation}
                  onChange={(event) => updateEntry(entry.id, "promotionConfirmation", event.target.checked ? move.confirmation : undefined)} />
                {t("workUi.promotion", { role: move.from })}
              </label>}
            </div>

            {/* Key Achievements */}
            <div>
              <label htmlFor={`${entry.id}-description`} className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("experience.achievements")}
              </label>
              <textarea
                id={`${entry.id}-description`}
                data-cv-fix={`${entry.id}-description`}
                dir="auto"
                value={entry.description}
                onChange={(e) =>
                  updateEntry(entry.id, "description", e.target.value)
                }
                rows={4}
                placeholder={dutyExample}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow resize-y"
              />
              <RoleSentenceSuggestions
                role={entry.role}
                selectedFamily={entry.roleFamily}
                onFamilyChange={(key) => updateEntry(entry.id, "roleFamily", key)}
                currentText={entry.description}
                onChange={(value) => updateEntry(entry.id, "description", value)}
              />
            </div>

            {/* Employment Gap */}
            <div>
              <label htmlFor={`${entry.id}-gap`} className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("experience.gap")}{" "}
                <span className="text-gray-400 font-normal">{t("form.optional")}</span>
              </label>
              <input
                id={`${entry.id}-gap`}
                data-cv-fix={`${entry.id}-gap`}
                type="text"
                dir="auto"
                value={entry.gap}
                onChange={(e) =>
                  updateEntry(entry.id, "gap", e.target.value)
                }
                placeholder={t("workUi.gapExample")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
              />
            </div>
          </div>
        ); })}
      </div>

      {/* Add Experience button */}
      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        {t("experience.add")}
      </button>

      {/* HR Tip */}
      <div className="bg-amber-50 border-s-4 border-amber-400 p-4 rounded-e-lg">
        <p className="font-semibold text-amber-800 text-sm">
          {t("personalUi.tip")}
        </p>
        <p className="mt-1 text-sm text-amber-900">
          {t("workUi.tip")}
        </p>
      </div>
    </div>
  );
}
