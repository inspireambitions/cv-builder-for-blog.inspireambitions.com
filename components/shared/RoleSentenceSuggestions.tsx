"use client";

import { useId, useState } from "react";
import { Building2, CookingPot, HardHat, HeartPulse, ShoppingBag, Truck } from "lucide-react";
import { appendExperienceSentence, findRoleSuggestionFamily, getRoleFamilyForJob } from "@/lib/role-suggestions";
import { applyRoleDetail, getRoleDetails, type RoleDetailQuestion } from "@/lib/role-details";
import { trackToolEvent } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/locale";
import { roleLibraryTranslations } from "@/lib/locales/role-library";
import { suggestionDetailLabel } from "@/lib/locales/suggestions-details";

function roleLabel(source: string, locale: Locale, key: string) {
  const text = roleLibraryTranslations[locale][key];
  return text ? { text } : { text: source, lang: "en" };
}

const addedMessage = "suggestion.added";
const detailMessages = { added: "suggestion.detailAdded", removed: "suggestion.detailRemoved" } as const;

interface RoleSentenceSuggestionsProps {
  role: string;
  selectedFamily?: string;
  onFamilyChange: (value: string | undefined) => void;
  currentText: string;
  onChange: (value: string) => void;
}

export default function RoleSentenceSuggestions({
  role,
  selectedFamily,
  onFamilyChange,
  currentText,
  onChange,
}: RoleSentenceSuggestionsProps) {
  const { t, locale } = useLocale();
  const panelId = useId();
  const workTypeHeading = useId();
  const [open, setOpen] = useState(!currentText.trim());
  const [showAll, setShowAll] = useState(false);
  const [message, setMessage] = useState<typeof addedMessage | null>(null);
  const group = getRoleFamilyForJob(role, selectedFamily);
  const [category, setCategory] = useState("");
  const [picking, setPicking] = useState(false);
  const used = new Set(
    currentText
      .split("\n")
      .map((line) => line.replace(/^[•-]\s*/, "").trim().toLowerCase())
      .filter(Boolean)
  );

  function addSentence(sentence: string) {
    onChange(appendExperienceSentence(currentText, sentence));
    setMessage(addedMessage);
    trackToolEvent("cv_role_suggestion_added", { roleGroup: group.key });
  }

  return (
    <section className="mt-3 overflow-hidden rounded-xl border border-[#d8c98e] bg-[#fffdf5]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500"
      >
        <span>
          <span className="block text-sm font-semibold text-gray-900">{t("suggestion.help")}</span>
          <span className="block text-xs text-gray-600">{group.key === "general" ? t("suggestion.find") : t("suggestion.forRole", { role: roleLabel(group.label, locale, `role.label.${group.key}`).text })}</span>
        </span>
        <span aria-hidden="true" className="text-lg font-semibold text-[#8a6b00]">{open ? "−" : "+"}</span>
      </button>

      {open && (group.key === "general" || picking) && (
        <div id={panelId} className="space-y-3 border-t border-[#e8ddb4] px-3 py-4 sm:px-4">
          <p id={workTypeHeading} className="text-sm font-semibold text-gray-900">{t("suggestion.areaPrompt")}</p>
          <div role="group" aria-labelledby={workTypeHeading} className="grid grid-cols-2 gap-2">
            {workAreas.map(({ id, Icon }) => (
              <button key={id} type="button" onClick={() => setCategory(id)} aria-pressed={category === id}
                className="flex min-h-12 items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-start text-sm text-gray-900 aria-pressed:border-gold-600 aria-pressed:bg-amber-50 focus-visible:outline-2 focus-visible:outline-gold-600">
                <Icon size={18} aria-hidden="true" className="shrink-0 text-[#745900]" />{t(`suggestion.area.${id}`)}
              </button>
            ))}
          </div>
          {!!category && <label className="block text-sm text-gray-900">
            {t("suggestion.pickType")}
            <select className="mt-1 block min-h-12 w-full rounded-lg border border-gray-300 bg-white px-2"
              value="" onChange={(event) => { if (event.target.value) { onFamilyChange(event.target.value); setPicking(false); } }}>
              <option value="">{t("suggestion.chooseOne")}</option>
              {workAreas.find((area) => area.id === category)?.keys.map((key) => {
                const family = findRoleSuggestionFamily(key);
                if (!family) return null;
                const label = roleLabel(family.label, locale, `role.label.${key}`);
                return <option key={key} value={key} lang={label.lang}>{label.text}</option>;
              })}
            </select>
          </label>}
          <p className="text-xs text-gray-700">{t("suggestion.noMatch")}</p>
          {picking && group.key !== "general" && <button type="button" className="min-h-11 text-sm text-[#745900] underline" onClick={() => setPicking(false)}>{t("suggestion.keepType")}</button>}
        </div>
      )}

      {open && group.key !== "general" && !picking && (
        <div id={panelId} className="border-t border-[#e8ddb4] px-3 pb-4 pt-3 sm:px-4">
          <button type="button" onClick={() => setPicking(true)}
            className="mb-3 min-h-11 text-sm font-medium text-[#745900] underline">{t("suggestion.changeType")}</button>
          <p className="mb-3 text-xs leading-5 text-gray-700">
            {t("suggestion.truth")} {locale !== "en" && t("suggestion.englishCv")}
          </p>
          <div className="space-y-2">
            {(showAll ? group.sentences : group.sentences.slice(0, 4)).map((sentence, index) => {
              const added = used.has(sentence.toLowerCase());
              const label = roleLabel(sentence, locale, `role.sentence.${group.key}.${index}`);
              return (
                <button
                  key={sentence}
                  type="button"
                  disabled={added}
                  onClick={() => addSentence(sentence)}
                  className="flex min-h-12 w-full items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 text-start text-sm leading-5 text-gray-800 shadow-sm transition-colors hover:border-gold-400 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:cursor-default disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-800"
                >
                  <span aria-hidden="true" className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                    {added ? "✓" : "+"}
                  </span>
                  <span lang={label.lang} dir="auto">{label.text}</span>
                </button>
              );
            })}
          </div>
          {group.sentences.length > 4 && (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="mt-3 min-h-11 rounded-lg px-2 text-sm font-semibold text-[#745900] underline decoration-[#d8c98e] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              {showAll ? t("suggestion.fewer") : t("suggestion.more", { count: new Intl.NumberFormat(locale).format(group.sentences.length - 4) })}
            </button>
          )}
          <JobDetailQuestions familyKey={group.key} value={currentText} onChange={onChange} showEnglishNotice={false} />
          <p aria-live="polite" className="mt-3 min-h-5 text-xs font-medium text-emerald-700">
            {message && t(message)}
          </p>
        </div>
      )}
    </section>
  );
}

const workAreas = [
  { id: "hotel", Icon: CookingPot, keys: ["reservations", "front-office", "concierge", "housekeeping", "laundry", "kitchen-steward", "kitchen-helper", "culinary", "food-service", "barista", "cleaning"] },
  { id: "shops", Icon: ShoppingBag, keys: ["cashier", "sales-assistant", "retail-sales", "call-centre", "customer-service", "beautician"] },
  { id: "office", Icon: Building2, keys: ["hr", "administration", "receptionist", "accounts-clerk", "finance", "data-entry", "technology", "teacher-assistant"] },
  { id: "transport", Icon: Truck, keys: ["delivery-rider", "heavy-driver", "driver", "storekeeper", "warehouse"] },
  { id: "trades", Icon: HardHat, keys: ["construction", "labourer", "mason", "electrician", "plumber", "ac-technician", "security"] },
  { id: "care", Icon: HeartPulse, keys: ["domestic", "nurse-assistant", "healthcare", "gym-lifeguard"] },
];

export function JobDetailQuestions({ familyKey, value, onChange, showEnglishNotice = true }: {
  familyKey: string; value: string; onChange: (description: string) => void; showEnglishNotice?: boolean;
}) {
  const { t, locale } = useLocale();
  const [notice, setNotice] = useState<(typeof detailMessages)[keyof typeof detailMessages] | null>(null);
  const questions = getRoleDetails(familyKey);
  const sentences = findRoleSuggestionFamily(familyKey)?.sentences ?? [];
  if (!questions.length) return null;
  const used = new Set(value.split("\n").map((line) => line.trim().toLowerCase()));
  return <details className="mt-4 rounded-lg border border-gray-200 p-3">
    <summary className="min-h-12 cursor-pointer py-3 text-sm font-semibold text-accent">{t("suggestion.details")}</summary>
    <p className="pb-3 text-xs leading-5 text-ink-muted">{t("suggestion.skip")} {showEnglishNotice && locale !== "en" && t("suggestion.englishCv")}</p>
    <div className="space-y-3">
      {questions.map((question) => <DetailAnswer key={`${familyKey}-${question.id}`} familyKey={familyKey} sentences={sentences} question={question}
        used={used} onAdd={(bullet) => {
          onChange(applyRoleDetail(value, question, bullet));
          setNotice(bullet ? detailMessages.added : detailMessages.removed);
        }} />)}
    </div>
    <p aria-live="polite" className="min-h-5 text-xs text-ink-muted">{notice && t(notice)}</p>
  </details>;
}

function DetailAnswer({ familyKey, sentences, question, used, onAdd }: {
  familyKey: string; sentences: readonly string[]; question: RoleDetailQuestion; used: Set<string>; onAdd: (text: string) => void;
}) {
  const { locale, t } = useLocale();
  const customId = useId();
  const [custom, setCustom] = useState("");
  const prompt = suggestionDetailLabel(question.prompt, locale);
  return (
    <fieldset className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
      <legend lang={prompt.lang} className="px-1 text-sm font-semibold text-gray-900">{prompt.text}</legend>
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => {
          const index = question.id === "duty" || question.id === "check" ? sentences.indexOf(option.bullet) : -1;
          const label = locale !== "en" && index >= 0
            ? roleLabel(option.label, locale, `role.sentence.${familyKey}.${index}`)
            : suggestionDetailLabel(option.label, locale);
          return <button key={option.label} type="button" lang={label.lang} dir="auto" aria-pressed={used.has(option.bullet.toLowerCase())}
            onClick={() => onAdd(used.has(option.bullet.toLowerCase()) ? "" : option.bullet)}
            className="min-h-12 rounded-lg border border-gray-300 px-3 text-start text-sm text-gray-900 aria-pressed:border-gold-600 aria-pressed:bg-amber-50 focus-visible:outline-2 focus-visible:outline-gold-600">
            {label.text}
          </button>;
        })}
      </div>
      <label htmlFor={customId} className="mt-3 block text-xs text-gray-700">{t("suggestion.custom")}</label>
      <input id={customId} dir="auto" className="mt-1 block min-h-12 w-full rounded-lg border border-gray-300 px-2 text-base" value={custom}
        maxLength={220} onChange={(event) => setCustom(event.target.value)} />
      <button type="button" disabled={!custom.trim()} onClick={() => { onAdd(custom.trim()); setCustom(""); }}
        className="mt-1 min-h-12 text-sm font-semibold text-[#745900] underline disabled:no-underline disabled:text-gray-500">
        {t("suggestion.addCustom")}
      </button>
    </fieldset>
  );
}
