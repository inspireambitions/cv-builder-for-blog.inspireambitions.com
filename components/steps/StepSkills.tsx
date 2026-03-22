"use client";

import { useState } from "react";
import { useCVState } from "@/lib/state";
import { LANGUAGE_LEVELS } from "@/lib/constants";
import type { LangEntry } from "@/lib/types";

function generateLangId() {
  return "lang-" + Math.random().toString(36).slice(2, 9);
}

export default function StepSkills() {
  const { state, updateField } = useCVState();
  const skills = state.skills;
  const languages = state.languages;

  const [skillInput, setSkillInput] = useState("");

  // --- Skills helpers ---
  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed.length === 0) return;
    if (skills.includes(trimmed)) {
      setSkillInput("");
      return;
    }
    updateField({ skills: [...skills, trimmed] });
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    updateField({ skills: skills.filter((s) => s !== skill) });
  }

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  }

  // Skill count color
  const skillCount = skills.length;
  const skillCountColor =
    skillCount >= 6
      ? "text-green-600"
      : skillCount >= 1
        ? "text-amber-600"
        : "text-red-600";

  // --- Language helpers ---
  function updateLang(id: string, field: keyof LangEntry, value: string) {
    updateField({
      languages: languages.map((l) =>
        l.id === id ? { ...l, [field]: value } : l
      ),
    });
  }

  function addLang() {
    updateField({
      languages: [
        ...languages,
        { id: generateLangId(), language: "", level: "Professional" },
      ],
    });
  }

  function removeLang(id: string) {
    updateField({
      languages: languages.filter((l) => l.id !== id),
    });
  }

  return (
    <div className="space-y-10">
      {/* ── Skills Section ── */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
          <p className="mt-1 text-sm text-gray-600">
            Add your key skills — type a skill and press Enter or click Add
          </p>
        </div>

        {/* Skill input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            placeholder="e.g. Stakeholder Management"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
          />
          <button
            type="button"
            onClick={addSkill}
            className="bg-gold-500 hover:bg-gold-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>

        {/* Skill tags */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center bg-gold-500/10 text-gold-600 px-3 py-1 rounded-full text-sm font-medium"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-gold-500 hover:text-gold-700 transition-colors"
                  aria-label={`Remove ${skill}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Counter */}
        <p className={`text-sm font-medium ${skillCountColor}`}>
          {skillCount} skill{skillCount !== 1 ? "s" : ""} added
        </p>
      </div>

      {/* ── Languages Section ── */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Languages</h2>
          <p className="mt-1 text-sm text-gray-600">
            List the languages you speak and your proficiency level
          </p>
        </div>

        <div className="space-y-4">
          {languages.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-end gap-4"
            >
              {/* Language name */}
              <div className="flex-1">
                {index === 0 && (
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Language
                  </label>
                )}
                <input
                  type="text"
                  value={entry.language}
                  onChange={(e) =>
                    updateLang(entry.id, "language", e.target.value)
                  }
                  placeholder="e.g. English"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                />
              </div>

              {/* Proficiency level */}
              <div className="flex-1">
                {index === 0 && (
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Proficiency
                  </label>
                )}
                <select
                  value={entry.level}
                  onChange={(e) =>
                    updateLang(entry.id, "level", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow bg-white"
                >
                  {LANGUAGE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remove button (not for first row) */}
              <div className="w-20 flex-shrink-0">
                {index > 0 ? (
                  <button
                    type="button"
                    onClick={() => removeLang(entry.id)}
                    className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors py-2.5"
                  >
                    Remove
                  </button>
                ) : (
                  <div className="py-2.5" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Language button */}
        <button
          type="button"
          onClick={addLang}
          className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Language
        </button>
      </div>

      {/* HR Tip */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
        <p className="font-semibold text-amber-800 text-sm">
          HR Director Tip
        </p>
        <p className="mt-1 text-sm text-amber-900">
          Mirror the exact keywords from the job description. If the posting
          says &ldquo;stakeholder management&rdquo;, use that exact phrase —
          not &ldquo;managing stakeholders&rdquo;. ATS systems match keywords
          literally.
        </p>
      </div>
    </div>
  );
}
