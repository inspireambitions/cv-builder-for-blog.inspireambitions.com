// Saved draft versions and link versions are separate. Never infer one from the other.
export const DRAFT_VERSION = 8;
export const STEP_INDEX = {
  start: 0, personal: 1, experience: 2, education: 3, skills: 4,
  summary: 5, template: 6, extras: 7, score: 8,
} as const;

export function migrateStep(step: unknown, version: number): number {
  if (typeof step !== "number" || !Number.isInteger(step) || step < 0 || step > 8) return 0;
  const legacy = [0, 6, 1, 2, 3, 4, 5, 7, 8];
  const previous = version < 5 ? legacy[step] : step;
  return version < DRAFT_VERSION ? [0, 1, 5, 2, 3, 4, 6, 7, 8][previous] : previous;
}
