import type { CVState, ScoreResult, ScoreCriterion } from "./types";

function scoreSummary(state: CVState): ScoreCriterion {
  const len = state.summary.length;
  if (len > 300) return { score: 18, max: 18, level: "green", label: "Professional Summary" };
  if (len > 80) return { score: 10, max: 18, level: "amber", label: "Professional Summary" };
  return { score: 3, max: 18, level: "red", label: "Professional Summary" };
}

function scoreExperience(state: CVState): ScoreCriterion {
  const hasRole = state.experience.some((e) => e.role.trim().length > 0);
  const hasDesc = state.experience.some(
    (e) => e.role.trim().length > 0 && e.description.trim().length > 50
  );
  if (hasDesc) return { score: 22, max: 22, level: "green", label: "Work Experience" };
  if (hasRole) return { score: 12, max: 22, level: "amber", label: "Work Experience" };
  return { score: 0, max: 22, level: "red", label: "Work Experience" };
}

function scoreContact(state: CVState): ScoreCriterion {
  const { name, email, phone } = state.personal;
  const allPresent =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0;
  if (allPresent) return { score: 16, max: 16, level: "green", label: "Contact Details" };
  return { score: 0, max: 16, level: "red", label: "Contact Details" };
}

function scoreSkills(state: CVState): ScoreCriterion {
  const count = state.skills.length;
  if (count >= 6) return { score: 16, max: 16, level: "green", label: "Skills" };
  if (count >= 1) return { score: 9, max: 16, level: "amber", label: "Skills" };
  return { score: 0, max: 16, level: "red", label: "Skills" };
}

function scoreEducation(state: CVState): ScoreCriterion {
  const hasDegree = state.education.some((e) => e.degree.trim().length > 0);
  if (hasDegree) return { score: 14, max: 14, level: "green", label: "Education" };
  return { score: 0, max: 14, level: "amber", label: "Education" };
}

function scoreLinkedin(state: CVState): ScoreCriterion {
  if (state.personal.linkedin.trim().length > 0) {
    return { score: 14, max: 14, level: "green", label: "LinkedIn URL" };
  }
  return { score: 0, max: 14, level: "amber", label: "LinkedIn URL" };
}

export function calculateScore(state: CVState): ScoreResult {
  const summary = scoreSummary(state);
  const experience = scoreExperience(state);
  const contact = scoreContact(state);
  const skills = scoreSkills(state);
  const education = scoreEducation(state);
  const linkedin = scoreLinkedin(state);

  const total =
    summary.score +
    experience.score +
    contact.score +
    skills.score +
    education.score +
    linkedin.score;

  return {
    total,
    max: 100,
    breakdown: { summary, experience, contact, skills, education, linkedin },
  };
}
