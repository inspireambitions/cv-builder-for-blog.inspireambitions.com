export type ExportMode = "ats" | "recruiter";

export interface ExportOptions {
  mode?: ExportMode;
  asOf?: Date;
}

export function isRecruiterReady(options?: ExportOptions): boolean {
  return options?.mode === "recruiter";
}
