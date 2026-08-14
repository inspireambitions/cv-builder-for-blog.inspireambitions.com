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
  level: "" | "Native" | "Fluent" | "Professional" | "Conversational" | "Basic";
}

export type VisaStatus =
  | ""
  | "Employment"
  | "Golden"
  | "Investor"
  | "Visit"
  | "Cancelled"
  | "Outside UAE"
  | "Prefer not to say";

export type NocAvailable = "" | "Yes" | "No" | "Not applicable";

export type ArabicProficiency =
  | ""
  | "None"
  | "Basic"
  | "Conversational"
  | "Fluent"
  | "Native";

export type MaritalStatus =
  | ""
  | "Single"
  | "Married"
  | "Divorced"
  | "Widowed"
  | "Prefer not to say";

export type SectorCredentialAuthority =
  | "DHA"
  | "DOH"
  | "MOH"
  | "RERA"
  | "KHDA"
  | "ADEK"
  | "WPS"
  | "MOHRE"
  | "VAT"
  | "SOCPA"
  | "Other";

export interface SectorCredentialEntry {
  authority: SectorCredentialAuthority;
  license_no: string;
  expiry_date: string;
}

export interface PersonalDetails {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  visa_status: VisaStatus;
  notice_period: string;
  driving_license: string;
  availability_date: string;
  noc_available: NocAvailable;
  nationality: string;
  include_date_of_birth: boolean;
  date_of_birth: string;
  include_marital_status: boolean;
  marital_status: MaritalStatus;
  arabic_proficiency: ArabicProficiency;
  sector_credentials: SectorCredentialEntry[];
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

export type TemplateType =
  | "classic"
  | "site"
  | "service"
  | "care"
  | "ledger"
  | "crew"
  | "stack"
  | "move"
  | "corner";
export type CVLanguage = "en" | "ar";
export type GeoType = "gulf" | "global";
export type PlanType = "free" | "payg" | "annual";
export type PhotoPreference = "photo" | "photo-free";

/* ââ Score types ââ */

export type ScoreLevel = "green" | "amber" | "red";

export interface ScoreCriterion {
  score: number;
  max: number;
  level: ScoreLevel;
  label: string;
  tip?: string;
}

export interface ScoreLayer {
  label: string;
  score: number;
  max: number;
  criteria: ScoreCriterion[];
}

export interface ScoreResult {
  total: number;
  max: 100;
  layers: {
    completeness: ScoreLayer;
    contentQuality: ScoreLayer;
    gulfSpecific: ScoreLayer;
    atsFormatting: ScoreLayer;
  };
  /** Flat array for backward-compatible breakdown rendering */
  breakdown: Record<string, ScoreCriterion>;
  topTips: string[];
}

/* ââ CV state ââ */

export interface CVState {
  step: number;
  mobilePersonalPage: number;
  template: TemplateType;
  templateConfirmed: boolean;
  cvLanguage: CVLanguage;
  geo: GeoType;
  photoPreference: PhotoPreference;
  photo: string | null;
  personal: PersonalDetails;
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
  mobilePersonalPage: 0,
  template: "classic",
  templateConfirmed: false,
  cvLanguage: "en",
  geo: "global",
  photoPreference: "photo-free",
  photo: null,
  personal: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    visa_status: "",
    notice_period: "",
    driving_license: "",
    availability_date: "",
    noc_available: "",
    nationality: "",
    include_date_of_birth: false,
    date_of_birth: "",
    include_marital_status: false,
    marital_status: "",
    arabic_proficiency: "",
    sector_credentials: [],
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
  languages: [{ id: "lang-1", language: "", level: "" }],
  achievements: [],
  volunteer: [],
  projects: [],
  publications: [],
  memberships: [],
  score: null,
  plan: "free",
};
