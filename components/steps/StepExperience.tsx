"use client";

import { useCVState } from "@/lib/state";
import type { ExpEntry } from "@/lib/types";

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
  const entries = state.experience;

  function updateEntry(id: string, field: keyof ExpEntry, value: string) {
    updateField({
      experience: entries.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
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
          Work Experience
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          List your roles starting with the most recent
        </p>
      </div>

      <div className="space-y-6">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5"
          >
            {/* Card header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                Position {index + 1}
              </h3>
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={entry.role}
                  onChange={(e) =>
                    updateEntry(entry.id, "role", e.target.value)
                  }
                  placeholder="e.g. Senior Project Manager"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={entry.company}
                  onChange={(e) =>
                    updateEntry(entry.id, "company", e.target.value)
                  }
                  placeholder="e.g. AECOM"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                />
              </div>

              {/* Company Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Company Description
                </label>
                <input
                  type="text"
                  value={entry.companyDesc}
                  onChange={(e) =>
                    updateEntry(entry.id, "companyDesc", e.target.value)
                  }
                  placeholder="e.g. A $2B logistics provider operating across 14 countries"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={entry.location}
                  onChange={(e) =>
                    updateEntry(entry.id, "location", e.target.value)
                  }
                  placeholder="e.g. Dubai, UAE"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                />
              </div>

              {/* Period */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Period
                </label>
                <input
                  type="text"
                  value={entry.dates}
                  onChange={(e) =>
                    updateEntry(entry.id, "dates", e.target.value)
                  }
                  placeholder="e.g. Jan 2020 – Present"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                />
              </div>
            </div>

            {/* Key Achievements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Key Achievements
              </label>
              <textarea
                value={entry.description}
                onChange={(e) =>
                  updateEntry(entry.id, "description", e.target.value)
                }
                rows={4}
                placeholder={
                  "\u2022 Reduced operational costs by 18% through process automation\n\u2022 Led a team of 12 across 3 countries to deliver a $4M project on time"
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow resize-y"
              />
            </div>

            {/* Employment Gap */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Employment Gap Explanation{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={entry.gap}
                onChange={(e) =>
                  updateEntry(entry.id, "gap", e.target.value)
                }
                placeholder="e.g. Career break for family relocation"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
              />
            </div>
          </div>
        ))}
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
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Add Experience
      </button>

      {/* HR Tip */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
        <p className="font-semibold text-amber-800 text-sm">
          HR Director Tip
        </p>
        <p className="mt-1 text-sm text-amber-900">
          Use the Action + Number + Outcome formula. Weak: &ldquo;Managed a
          team.&rdquo; Strong: &ldquo;Led a cross-functional team of 15,
          delivering a $3M digital transformation project 2 weeks ahead of
          schedule.&rdquo;
        </p>
      </div>
    </div>
  );
}
