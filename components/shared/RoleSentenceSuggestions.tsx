"use client";

import { useMemo, useState } from "react";
import { appendExperienceSentence, getRoleSuggestionGroup } from "@/lib/role-suggestions";
import { trackToolEvent } from "@/lib/analytics";

interface RoleSentenceSuggestionsProps {
  role: string;
  targetRole: string;
  currentText: string;
  onChange: (value: string) => void;
}

export default function RoleSentenceSuggestions({
  role,
  targetRole,
  currentText,
  onChange,
}: RoleSentenceSuggestionsProps) {
  const [open, setOpen] = useState(!currentText.trim());
  const [showAll, setShowAll] = useState(false);
  const [message, setMessage] = useState("");
  const group = useMemo(
    () => getRoleSuggestionGroup(role, role.trim() ? "" : targetRole),
    [role, targetRole]
  );
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
          <span className="block text-xs text-gray-600">Suggested wording for {group.label}</span>
        </span>
        <span aria-hidden="true" className="text-lg font-semibold text-[#8a6b00]">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="border-t border-[#e8ddb4] px-3 pb-4 pt-3 sm:px-4">
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
          <p aria-live="polite" className="mt-3 min-h-5 text-xs font-medium text-emerald-700">
            {message}
          </p>
        </div>
      )}
    </section>
  );
}
