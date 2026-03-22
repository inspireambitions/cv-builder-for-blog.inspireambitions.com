export interface ExpEntry {
  id: string;
  role: string;
  company: string;
  companyDesc: string;
  location: string;
  dates: string;
  description: string;
  gap: string;
}

export interface EduEntry {
  id: string;
  degree: string;
  institution: string;
  year: string;
  grade: string;
}

export interface CertEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiry: string;
}

export interface LangEntry {
  id: string;
  language: string;
  level: "Native" | "Fluent" | "Professional" | "Conversational" | "Basic";
}

export interface AchievementEntry {
  id: string;
  title: string;
  body: string;
  awardingBody: string;
  year: string;
}

export interface VolunteerEntry {
  id: string;
  role: string;
  org: string;
  dates: string;
  impact: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  url: string;
  outcomes: string;
}

export interface PublicationEntry {
  id: string;
  title: string;
  outlet: string;
  date: string;
  url: string;
}

export interface MembershipEntry {
  id: string;
  org: string;
  level: string;
  year: string;
}

export type TemplateType = "corp" | "min" | "gulf" | "cre";
export type GeoType = "gulf" | "global";
export type PlanType = "free" | "payg" | "annual";

export interface ScoreCriterion {
  score: number;
  max: number;
  level: "green" | "amber" | "red";
  label: string;
}

export interface ScoreResult {
  total: number;
  max: 100;
  breakdown: {
    summary: ScoreCriterion;
    experience: ScoreCriterion;
    contact: ScoreCriterion;
    skills: ScoreCriterion;
    education: ScoreCriterion;
    linkedin: ScoreCriterion;
  };
}

export interface CVState {
  step: number;
  template: TemplateType;
  geo: GeoType;
  photo: string | null;
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  summary: string;
  experience: ExpEntry[];
  education: EduEntry[];
  certifications: CertEntry[];
  skills: string[];
  languages: LangEntry[];
  achievements: AchievementEntry[];
  volunteer: VolunteerEntry[];
  projects: ProjectEntry[];
  publications: PublicationEntry[];
  memberships: MembershipEntry[];
  score: ScoreResult | null;
  plan: PlanType;
}

export const defaultCVState: CVState = {
  step: 0,
  template: "corp",
  geo: "global",
  photo: null,
  personal: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
  },
  summary: "",
  experience: [
    {
      id: "exp-1",
      role: "",
      company: "",
      companyDesc: "",
      location: "",
      dates: "",
      description: "",
      gap: "",
    },
  ],
  education: [
    { id: "edu-1", degree: "", institution: "", year: "", grade: "" },
  ],
  certifications: [],
  skills: [],
  languages: [{ id: "lang-1", language: "", level: "Professional" }],
  achievements: [],
  volunteer: [],
  projects: [],
  publications: [],
  memberships: [],
  score: null,
  plan: "free",
};
