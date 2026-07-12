import type { CVState } from "@/lib/types";

export type EvidenceKind =
  | "profile"
  | "experience"
  | "education"
  | "skill"
  | "certification"
  | "achievement";

export interface EvidenceItem {
  id: string;
  kind: EvidenceKind;
  text: string;
  sourceLabel: string;
}

export interface JobRequirement {
  id: string;
  text: string;
  priority: "required" | "preferred";
  status: "supported" | "partial" | "gap";
  evidenceIds: string[];
}

export interface TailoredBullet {
  text: string;
  evidenceIds: string[];
}

export interface TailoredExperience {
  experienceId: string;
  bullets: TailoredBullet[];
}

export interface TailoringDraft {
  roleTitle: string;
  company: string;
  matchScore: number;
  verdict: "strong" | "good" | "moderate" | "weak";
  summary: TailoredBullet;
  skills: Array<{ name: string; evidenceIds: string[] }>;
  experience: TailoredExperience[];
  requirements: JobRequirement[];
  gaps: string[];
  trimmingNotes: string[];
}

export interface ReviewCorrection {
  target: string;
  replacement: string;
  evidenceIds: string[];
  reason: string;
}

export interface TailoringReview {
  approved: boolean;
  confidence: number;
  corrections: ReviewCorrection[];
  warnings: string[];
  final: TailoringDraft;
}

export interface IntegrityFinding {
  path: string;
  message: string;
  severity: "error" | "warning";
}

export interface TailoringResult {
  draftProvider: "grok-4.5" | "sonnet-fallback";
  reviewProvider: string;
  evidence: EvidenceItem[];
  review: TailoringReview;
  integrity: {
    passed: boolean;
    findings: IntegrityFinding[];
  };
  generatedAt: string;
}

export interface TailoringRequest {
  cvData: CVState;
  jobDescription: string;
  jobTitle?: string;
  company?: string;
}
