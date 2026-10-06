"use client";

import { useCVState } from "@/lib/state";
import { useEffect, useRef } from "react";
import { buildPlainSummary } from "@/lib/plain-summary";

const PROMPTS = [
  {
    label: "What work do you do?",
    starter:
      "I work as a ",
  },
  {
    label: "What did you improve?",
    starter:
      "At work, I helped to ",
  },
  {
    label: "What work do you want?",
    starter:
      "I am looking for work as a ",
  },
];

export default function StepSummary() {
  const { state, updateField } = useCVState();
  const charCount = state.summary.length;
  const initialised = useRef(false);
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    if (!state.summary.trim()) {
      const summary = buildPlainSummary(state);
      if (summary) updateField({ summary });
    }
  }, [state, updateField]);

  function insertPrompt(starter: string) {
    const current = state.summary;
    const newText = current ? current + "\n\n" + starter : starter;
    updateField({ summary: newText });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          About you (2 to 3 lines)
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Describe your work and strengths in 2 to 3 lines.
        </p>
      </div>

      {/* Prompt cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt.label}
            onClick={() => insertPrompt(prompt.starter)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-start hover:shadow-md hover:border-gold-300 transition-all cursor-pointer group"
          >
            <p className="text-sm font-medium text-gray-900 group-hover:text-gold-600 transition-colors">
              {prompt.label}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Tap to add a sentence starter
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
          placeholder="Write 2 to 3 lines about your work."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow resize-y"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm font-medium text-gray-600">
            {charCount} characters
          </p>
          <p className="text-sm text-gray-500">
            Keep it clear and true
          </p>
        </div>
      </div>

      {/* HR Tip */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
        <p className="font-semibold text-amber-800 text-sm">
          HR Career Specialist Tip
        </p>
        <p className="mt-1 text-sm text-amber-900">
          Name your job, your skills and the work you know.
          Only add results you can explain and prove.
        </p>
      </div>
    </div>
  );
}
