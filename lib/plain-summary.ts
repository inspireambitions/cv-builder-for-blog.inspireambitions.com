import type { CVState } from "./types";

// Uses only candidate-entered fields. No invented years, results or credentials.
export function buildPlainSummary(state: CVState): string {
  const title = state.personal.title.trim() || state.experience.find((job) => job.role.trim())?.role.trim();
  const skills = [...new Set(state.skills.map((skill) => skill.trim()).filter(Boolean))].slice(0, 3);
  const languages = [...new Set(state.languages.map((entry) => entry.language.trim()).filter(Boolean))].slice(0, 3);
  return [
    title ? `${title}.` : "",
    skills.length ? `Skills include ${skills.join(", ")}.` : "",
    languages.length ? `Languages: ${languages.join(", ")}.` : "",
  ].filter(Boolean).join(" ");
}
