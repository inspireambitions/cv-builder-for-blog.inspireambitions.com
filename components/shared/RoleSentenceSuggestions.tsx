"use client";

import { useState } from "react";
import { Building2, CookingPot, HardHat, HeartPulse, ShoppingBag, Truck } from "lucide-react";
import { appendExperienceSentence, findRoleSuggestionFamily, getRoleFamilyForJob } from "@/lib/role-suggestions";
import { applyRoleDetail, getRoleDetails, type RoleDetailQuestion } from "@/lib/role-details";
import { trackToolEvent } from "@/lib/analytics";

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
  const [open, setOpen] = useState(!currentText.trim());
  const [showAll, setShowAll] = useState(false);
  const [message, setMessage] = useState("");
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
    setMessage("Added. Edit the sentence if you need to.");
    trackToolEvent("cv_role_suggestion_added", { roleGroup: group.key });
  }

  function addDetail(question: RoleDetailQuestion, bullet: string) {
    onChange(applyRoleDetail(currentText, question, bullet));
    setMessage(bullet ? "Added to your job description." : "Removed that answer.");
  }

  return (
    <section className="mt-3 overflow-hidden rounded-xl border border-[#d8c98e] bg-[#fffdf5]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500"
      >
        <span>
          <span className="block text-sm font-semibold text-gray-900">Need help describing this job?</span>
          <span className="block text-xs text-gray-600">{group.key === "general" ? "Find ideas for your kind of work" : `Suggested wording for ${group.label}`}</span>
        </span>
        <span aria-hidden="true" className="text-lg font-semibold text-[#8a6b00]">{open ? "−" : "+"}</span>
      </button>

      {open && (group.key === "general" || picking) && (
        <div className="space-y-3 border-t border-[#e8ddb4] px-3 py-4 sm:px-4">
          <p className="text-sm font-semibold text-gray-900">Which kind of work is this closest to?</p>
          <div className="grid grid-cols-2 gap-2">
            {workAreas.map(({ label, Icon }) => (
              <button key={label} type="button" onClick={() => setCategory(label)} aria-pressed={category === label}
                className="flex min-h-12 items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-start text-sm text-gray-900 aria-pressed:border-gold-600 aria-pressed:bg-amber-50 focus-visible:outline-2 focus-visible:outline-gold-600">
                <Icon size={18} aria-hidden="true" className="shrink-0 text-[#745900]" />{label}
              </button>
            ))}
          </div>
          {!!category && <label className="block text-sm text-gray-900">
            Pick a type of work
            <select className="mt-1 block min-h-12 w-full rounded-lg border border-gray-300 bg-white px-2"
              value="" onChange={(event) => { if (event.target.value) { onFamilyChange(event.target.value); setPicking(false); } }}>
              <option value="">Choose one</option>
              {workAreas.find((area) => area.label === category)?.keys.map((key) =>
                <option key={key} value={key}>{findRoleSuggestionFamily(key)?.label}</option>)}
            </select>
          </label>}
          <p className="text-xs text-gray-700">No close match? Use your own words above.</p>
          {picking && group.key !== "general" && <button type="button" className="min-h-11 text-sm text-[#745900] underline" onClick={() => setPicking(false)}>Keep this work type</button>}
        </div>
      )}

      {open && group.key !== "general" && !picking && (
        <div className="border-t border-[#e8ddb4] px-3 pb-4 pt-3 sm:px-4">
          <button type="button" onClick={() => setPicking(true)}
            className="mb-3 min-h-11 text-sm font-medium text-[#745900] underline">Change type of work</button>
          <p className="mb-3 text-xs leading-5 text-gray-700">
            Tap a sentence only if you did this work. You can change the wording after adding it.
          </p>
          <div className="space-y-2">
            {(showAll ? group.sentences : group.sentences.slice(0, 4)).map((sentence) => {
              const added = used.has(sentence.toLowerCase());
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
                  <span>{sentence}</span>
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
              {showAll ? "Show fewer suggestions" : `Show ${group.sentences.length - 4} more suggestions`}
            </button>
          )}
          <details className="mt-4 border-t border-[#e8ddb4] pt-1">
            <summary className="min-h-12 cursor-pointer py-3 text-sm font-semibold text-[#745900]">Add real details (optional)</summary>
            <p className="pb-3 text-xs leading-5 text-gray-700">Skip any question. Add only what you did in this job.</p>
            <div className="space-y-3">
              {getRoleDetails(group.key).map((question) => <DetailAnswer key={`${group.key}-${question.id}`}
                question={question} used={used} onAdd={(bullet) => addDetail(question, bullet)} />)}
            </div>
          </details>
          <p aria-live="polite" className="mt-3 min-h-5 text-xs font-medium text-emerald-700">
            {message}
          </p>
        </div>
      )}
    </section>
  );
}

const workAreas = [
  { label: "Hotel and food", Icon: CookingPot, keys: ["reservations", "front-office", "concierge", "housekeeping", "laundry", "kitchen-steward", "kitchen-helper", "culinary", "food-service", "barista", "cleaning"] },
  { label: "Shops and service", Icon: ShoppingBag, keys: ["cashier", "sales-assistant", "retail-sales", "call-centre", "customer-service", "beautician"] },
  { label: "Office and school", Icon: Building2, keys: ["hr", "administration", "receptionist", "accounts-clerk", "finance", "data-entry", "technology", "teacher-assistant"] },
  { label: "Transport and stock", Icon: Truck, keys: ["delivery-rider", "heavy-driver", "driver", "storekeeper", "warehouse"] },
  { label: "Trades and safety", Icon: HardHat, keys: ["construction", "labourer", "mason", "electrician", "plumber", "ac-technician", "security"] },
  { label: "Care and fitness", Icon: HeartPulse, keys: ["domestic", "nurse-assistant", "healthcare", "gym-lifeguard"] },
];

function DetailAnswer({ question, used, onAdd }: { question: RoleDetailQuestion; used: Set<string>; onAdd: (text: string) => void }) {
  const [custom, setCustom] = useState("");
  return (
    <fieldset className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
      <legend className="px-1 text-sm font-semibold text-gray-900">{question.prompt}</legend>
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => (
          <button key={option.label} type="button" aria-pressed={used.has(option.bullet.toLowerCase())}
            onClick={() => onAdd(used.has(option.bullet.toLowerCase()) ? "" : option.bullet)}
            className="min-h-12 rounded-lg border border-gray-300 px-3 text-start text-sm text-gray-900 aria-pressed:border-gold-600 aria-pressed:bg-amber-50 focus-visible:outline-2 focus-visible:outline-gold-600">
            {option.label}
          </button>
        ))}
      </div>
      <label className="mt-3 block text-xs text-gray-700">Or write one line
        <input className="mt-1 block min-h-12 w-full rounded-lg border border-gray-300 px-2 text-base" value={custom}
          maxLength={220} onChange={(event) => setCustom(event.target.value)} />
      </label>
      <button type="button" disabled={!custom.trim()} onClick={() => { onAdd(custom.trim()); setCustom(""); }}
        className="mt-1 min-h-11 text-sm font-semibold text-[#745900] underline disabled:no-underline disabled:text-gray-500">
        Add my line
      </button>
    </fieldset>
  );
}
