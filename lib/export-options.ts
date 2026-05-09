export type ExportMode = "ats" | "recruiter";

export interface ExportOptions {
  mode?: ExportMode;
}

export function isRecruiterReady(options?: ExportOptions): boolean {
  return options?.mode === "recruiter";
}
