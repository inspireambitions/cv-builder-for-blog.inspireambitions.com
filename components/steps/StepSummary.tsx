"use client";

import { useCVState } from "@/lib/state";

const PROMPTS = [
  {
    label: "Who are you professionally?",
    starter:
      "I am a [Your Title] with [X] years of experience in [Industry]. ",
  },
  {
    label: "What is your biggest achievement?",
    starter:
      "My most significant achievement was [describe outcome], where I [action taken] resulting in [measurable impact]. ",
  },
  {
    label: "What role are you targeting?",
    starter:
      "I am seeking a [Target Role] position where I can leverage my expertise in [Key Skills] to [Value Proposition]. ",
  },
];

export default function StepSummary() {
  const { state, updateField } = useCVState();
  const charCount = state.summary.length;

  function getCounterColor() {
    if (charCount < 100) return "text-red-600";
    if (charCount < 300) return "text-amber-600";
    return "text-green-600";
  }

  function insertPrompt(starter: string) {
    const current = state.summary;
    const newText = current ? current + "\n\n" + starter : starter;
    updateField({ summary: newText });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Professional Summary
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Write a compelling overview that makes recruiters want to read more
        </p>
      </div>

      {/* Prompt cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt.label}
            onClick={() => insertPrompt(prompt.starter)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-left hover:shadow-md hover:border-gold-300 transition-all cursor-pointer group"
          >
            <p className="text-sm font-medium text-gray-900 group-hover:text-gold-600 transition-colors">
              {prompt.label}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Click to insert starter text
            </p>
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div>
        <textarea
          value={state.summary}
          onChange={(e) => updateField({ summary: e.target.value })}
          rows={8}
          placeholder="Write your professional summary here..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow resize-y"
        />
        <div className="flex items-center justify-between mt-2">
          <p className={`text-sm font-medium ${getCounterColor()}`}>
            {charCount} characters
          </p>
          <p className="text-sm text-gray-500">
            Aim for 300&ndash;600 characters
          </p>
        </div>
      </div>

      {/* HR Tip */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
        <p className="font-semibold text-amber-800 text-sm">
          HR Director Tip
        </p>
        <p className="mt-1 text-sm text-amber-900">
          A weak summary: &ldquo;Experienced professional seeking new
          opportunities.&rdquo; A strong summary: &ldquo;Senior Project Manager
          with 8 years delivering $50M+ infrastructure programmes across the
          GCC. Reduced delivery timelines by 23% through agile methodology
          adoption at AECOM.&rdquo;
        </p>
      </div>
    </div>
  );
}
